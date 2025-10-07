from uuid import uuid4
from django.utils import timezone
from django.db import transaction
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from .models import ChatHistory

# engine pieces from the CLI module
from backend.ai.services.train.chatbot_cli import (
    start_new_session,
    handle_user_text,
    push_history,
)

def _extract_bearer_token(request):
    auth = request.META.get("HTTP_AUTHORIZATION", "")
    parts = auth.split()
    return parts[1] if len(parts) == 2 and parts[0].lower() == "bearer" else None

# -------- Optional legacy endpoint: keep only if some old client still calls it
@api_view(["POST"])
@permission_classes([AllowAny])
def input_check(request):
    return Response({"ok": True}, status=200)
# -----------------------------------------------------------------------------

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def chat_messages(request):
    """
    GET /api/ai/chat/messages/?conversation_id=...
    Returns: [ {id, conversation_id, sender, text, timestamp}, ... ]
    """
    conv_id = request.query_params.get("conversation_id") or request.query_params.get("conversationId")
    if not conv_id:
        return Response({"detail": "conversation_id is required"}, status=400)

    try:
        row = ChatHistory.objects.get(user_id=request.user.id, conversation_id=conv_id)
        return Response(row.history or [], status=200)
    except ChatHistory.DoesNotExist:
        return Response([], status=200)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def chat(request):
    """
    POST /api/ai/chat/
      Body: { conversation_id, text (optional), session (optional for save), history (optional for save), status (optional for save) }
    Uses the same engine as the CLI to produce the reply or save state.
    """
    data = request.data or {}
    conv_id = data.get("conversation_id") or data.get("conversationId")
    text = (data.get("text") or data.get("message") or "").strip()
    if not conv_id:
        return Response({"detail": "conversation_id is required"}, status=400)

    access_token = _extract_bearer_token(request)
    now_iso = timezone.now().isoformat()

    with transaction.atomic():
        row, _created = ChatHistory.objects.select_for_update().get_or_create(
            user_id=request.user.id,
            conversation_id=conv_id,
            defaults={
                "history": [],
                "session": start_new_session(str(request.user.id)),
            },
        )

        session = data.get("session") or getattr(row, "session", None) or start_new_session(str(request.user.id))
        history = data.get("history") or row.history or []
        status = data.get("status") or row.status

        reply_text = "State saved successfully"  # Default response for state save
        action = None

        if text:  # Process as a new message if text is provided
            push_history(session, "user", text)
            reply_text = handle_user_text(session, text, access_token)

            # Simple action hook (optional: pattern-based)
            if "receipt" in reply_text.lower():
                action = {"type": "upload_receipt", "request_id": None}
            elif "up to date" in reply_text and "Yes" in text:
                action = {"type": "reset_form", "request_id": None}

            # Build UI bubbles
            user_msg = {
                "id": str(uuid4()),
                "conversation_id": conv_id,
                "sender": "student",
                "text": text,
                "timestamp": now_iso,
            }
            bot_msg = {
                "id": str(uuid4()),
                "conversation_id": conv_id,
                "sender": "bot",
                "text": reply_text,
                "timestamp": timezone.now().isoformat(),
            }
            history = history + [user_msg, bot_msg]
        else:  # Save state without processing a new message
            pass  # Session, history, and status are already updated from data

        # Update the row with the latest state
        row.history = history
        row.session = session
        row.status = status
        row.save(update_fields=["history", "session", "status", "updated_at"])

    return Response({"message": {"id": str(uuid4()), "conversation_id": conv_id, "sender": "bot", "text": reply_text, "timestamp": now_iso}, "action": action}, status=200)