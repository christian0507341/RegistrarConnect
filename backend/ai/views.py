# RegistrarConnect/backend/ai/views.py
from uuid import uuid4
from django.utils import timezone
from django.db import transaction
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import ChatHistory
from backend.document_requests.models import DocumentRequest

# engine pieces from the CLI module
try:
    from backend.ai.services.train.chatbot_cli import (
        start_new_session,
        handle_user_text,
        push_history,
    )
except ImportError as e:
    print(f"Warning: Could not import chatbot CLI functions: {e}")
    # Fallback functions
    def start_new_session(user_id):
        return {"user_id": user_id, "status": "draft"}
    
    def handle_user_text(session, text, access_token):
        return "I'm sorry, the chatbot service is temporarily unavailable."
    
    def push_history(session, sender, text):
        pass

def _extract_bearer_token(request):
    auth = request.META.get("HTTP_AUTHORIZATION", "")
    parts = auth.split()
    return parts[1] if len(parts) == 2 and parts[0].lower() == "bearer" else None


@api_view(["POST"])
@permission_classes([AllowAny])
def input_check(request):
    return Response({"ok": True}, status=200)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def chat_messages(request):
    conv_id = request.query_params.get("conversation_id") or request.query_params.get("conversationId")
    if not conv_id:
        return Response({"detail": "conversation_id is required"}, status=400)

    try:
        row = ChatHistory.objects.get(user_id=str(request.user.id), conversation_id=conv_id)
        return Response(row.history or [], status=200)
    except ChatHistory.DoesNotExist:
        return Response([], status=200)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def chat(request):
    """
    POST /api/ai/chat/
      Body: { conversation_id, text?, session?, history?, status? }
    """
    data = request.data or {}
    conv_id = data.get("conversation_id") or data.get("conversationId")
    text = (data.get("text") or data.get("message") or "").strip()
    if not conv_id:
        return Response({"detail": "conversation_id is required"}, status=400)

    access_token = _extract_bearer_token(request)
    now_iso = timezone.now().isoformat()
    
    # Ensure we have a valid access token
    if not access_token:
        return Response({"detail": "Authentication required"}, status=401)

    LOCKED_STATUSES = {"pending", "on_process", "ready_to_claim", "rejected"}

    with transaction.atomic():
        row, _created = ChatHistory.objects.select_for_update().get_or_create(
            user_id=str(request.user.id),
            conversation_id=conv_id,
            defaults={
                "history": [],
                "session": start_new_session(str(request.user.id)),
            },
        )

        # For new conversations, start fresh
        if _created:
            merged_session = inbound_session
            history = data.get("history", [])
        else:
            # Merge inbound data for existing conversations
            merged_session = dict(getattr(row, "session", {}) or {})
            inbound_session = data.get("session") or {}
            merged_session.update(inbound_session)
            history = (row.history or []) + (data.get("history") or [])

        # Status preference: payload -> session -> row -> draft
        status_val = data.get("status") or merged_session.get("status") or row.status or "draft"

        reply_text = "State saved successfully"
        action = None

        if text:
            # If the chat is locked to a submitted request, just notify
            if row.document_request and row.document_request.status in LOCKED_STATUSES:
                user_msg = {
                    "id": str(uuid4()),
                    "conversation_id": conv_id,
                    "sender": "student",
                    "text": text,
                    "timestamp": now_iso,
                }
                
                # Provide more specific message based on status
                status_messages = {
                    "pending": "under faculty review for payment approval",
                    "on_process": "approved and being processed",
                    "ready_to_claim": "ready for you to claim",
                    "rejected": "rejected"
                }
                
                locked_notice = (
                    f"This conversation is **locked** to your submitted **{row.document_request.document_type}** request. "
                    f"Status: **{status_messages.get(row.document_request.status, row.document_request.status)}**. "
                    "To request another document, please start a **new conversation** in the app."
                )
                
                bot_msg = {
                    "id": str(uuid4()),
                    "conversation_id": conv_id,
                    "sender": "bot",
                    "text": locked_notice,
                    "timestamp": timezone.now().isoformat(),
                }
                history.extend([user_msg, bot_msg])

                status_val = row.document_request.status
                row.history = history
                row.session = merged_session
                row.status = status_val
                row.save(update_fields=["history", "session", "status", "updated_at"])

                return Response({"message": bot_msg, "action": action}, status=200)

            # Normal engine path
            try:
                push_history(merged_session, "user", text)
                reply_text = handle_user_text(merged_session, text, access_token)
            except Exception as e:
                reply_text = f"⚠️ Error processing your message: {str(e)}"
                # Log the error for debugging
                print(f"Chatbot error: {e}")

            # Try to link the chat to the most recent relevant DocumentRequest
            if not row.document_request and merged_session.get("doc_type"):
                q = DocumentRequest.objects.filter(
                    student_id=request.user,
                    document_type=merged_session.get("doc_type"),
                ).order_by("-requested_at")

                sem = merged_session.get("semester")
                sy = merged_session.get("school_year")
                purpose = merged_session.get("purpose")
                if sem in (1, 2):
                    q = q.filter(semester=sem)
                if sy:
                    q = q.filter(school_year=sy)
                if purpose:
                    q = q.filter(purpose=purpose)

                doc = q.filter(status__in=["draft", "awaiting_payment", "pending"]).first()
                if doc:
                    row.document_request = doc
                    row.status = doc.status
                    row.save(update_fields=["document_request", "status", "updated_at"])
                    status_val = doc.status

            # Add the two chat bubbles
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
            history.extend([user_msg, bot_msg])

        # Persist merged state
        row.history = history
        row.session = merged_session
        row.status = status_val
        row.save(update_fields=["history", "session", "status", "updated_at"])

    return Response(
        {
            "message": {
                "id": str(uuid4()),
                "conversation_id": conv_id,
                "sender": "bot",
                "text": reply_text,
                "timestamp": now_iso,
            },
            "action": action,
        },
        status=200,
    )
