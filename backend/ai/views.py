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
      Body: { conversation_id, text }
    Uses the same engine as the CLI to produce the reply.
    """
    data = request.data or {}
    conv_id = data.get("conversation_id") or data.get("conversationId")
    text = (data.get("text") or data.get("message") or "").strip()
    if not conv_id or text == "":
        return Response({"detail": "conversation_id and text are required"}, status=400)

    access_token = _extract_bearer_token(request)  # pass-thru to engine for backend REST calls
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

        # Harden against existing rows created before the `session` field existed
        session = getattr(row, "session", None) or start_new_session(str(request.user.id))

        # record user turn into engine session (kept short inside engine)
        push_history(session, "user", text)

        # ask the same engine your CLI uses
        reply_text = handle_user_text(session, text, access_token)  # returns a string reply

        # simple action hook (optional: pattern-based)
        action = None
        if "receipt" in reply_text.lower():
            action = {"type": "upload_receipt", "request_id": None}
        elif "up to date" in reply_text and "Yes" in text:  # Detect SIS confirmation
            action = {"type": "reset_form", "request_id": None}

        # build UI bubbles
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

        # persist both: flat history + full engine session snapshot
        row.history = (row.history or []) + [user_msg, bot_msg]
        row.session = session
        row.save(update_fields=["history", "session", "updated_at"])

    return Response({"message": bot_msg, "action": action}, status=200)