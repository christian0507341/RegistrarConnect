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
        return {
            "user_id": user_id, 
            "status": "draft", 
            "mode": "qa",
            "expected": None,
            "history": [],
            "doc_type": None,
            "semester": None,
            "school_year": None,
            "purpose": None,
            "specify": None,
            "other_doc_name": None,
            "sis_confirmed": None,
            "payment_method": None,
            "receipt_hashes": []
        }
    
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
    """Get messages for a specific conversation - only if it belongs to the authenticated user."""
    conv_id = request.query_params.get("conversation_id") or request.query_params.get("conversationId")
    if not conv_id:
        return Response({"detail": "conversation_id is required"}, status=400)

    # Ensure user is authenticated
    if not request.user or not request.user.is_authenticated:
        return Response({"error": "Authentication required"}, status=401)

    try:
        user_id = str(request.user.id)
        print(f"🔍 Backend: User {user_id} requesting messages for conversation {conv_id}")
        
        row = ChatHistory.objects.get(user_id=user_id, conversation_id=conv_id)
        
        # Double-check ownership
        if row.user_id != user_id:
            return Response({"error": "Access denied - conversation does not belong to user"}, status=403)
        
        # Log access for security monitoring
        print(f"🔍 Backend: Found conversation with {len(row.history or [])} messages")
        
        return Response(row.history or [], status=200)
    except ChatHistory.DoesNotExist:
        print(f"🔍 Backend: Conversation {conv_id} not found for user {user_id}")
        return Response([], status=200)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def chat_history_list(request):
    """Get list of all chat conversations for the authenticated user only."""
    try:
        # Ensure user is authenticated and get their ID
        if not request.user or not request.user.is_authenticated:
            return Response({"error": "Authentication required"}, status=401)
        
        user_id = str(request.user.id)
        
        # Double-check: Only get conversations for this specific user
        conversations = ChatHistory.objects.filter(
            user_id=user_id
        ).order_by('-updated_at')
        
        # Log access for security monitoring (optional)
        print(f"User {user_id} accessed chat history - {conversations.count()} conversations")
        
        history_list = []
        for conv in conversations:
            # Additional security check: ensure conversation belongs to user
            if conv.user_id != user_id:
                continue  # Skip if somehow not matching
                
            last_message = None
            if conv.history and len(conv.history) > 0:
                # Get the last message from history
                last_msg = conv.history[-1]
                if isinstance(last_msg, dict):
                    last_message = last_msg.get('text', '')
            
            history_list.append({
                'id': conv.conversation_id,
                'timestamp': conv.updated_at.isoformat(),
                'lastMessage': last_message,
                'messageCount': len(conv.history) if conv.history else 0,
                'status': conv.status,
                'documentType': conv.document_request.document_type if conv.document_request else None,
            })
        
        return Response(history_list, status=200)
    except Exception as e:
        print(f"Error in chat_history_list for user {request.user.id}: {str(e)}")
        return Response({"error": "Failed to retrieve chat history"}, status=500)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_chat_history(request, conversation_id):
    """Delete a specific chat conversation - only if it belongs to the authenticated user."""
    try:
        # Ensure user is authenticated
        if not request.user or not request.user.is_authenticated:
            return Response({"error": "Authentication required"}, status=401)
        
        user_id = str(request.user.id)
        
        # Get conversation and verify ownership
        conv = ChatHistory.objects.get(
            user_id=user_id,
            conversation_id=conversation_id
        )
        
        # Double-check ownership before deletion
        if conv.user_id != user_id:
            return Response({"error": "Access denied - conversation does not belong to user"}, status=403)
        
        # Log deletion for security monitoring
        print(f"User {user_id} deleted conversation {conversation_id}")
        
        conv.delete()
        return Response({"message": "Conversation deleted successfully"}, status=200)
    except ChatHistory.DoesNotExist:
        return Response({"error": "Conversation not found or access denied"}, status=404)
    except Exception as e:
        print(f"Error deleting conversation {conversation_id} for user {request.user.id}: {str(e)}")
        return Response({"error": "Failed to delete conversation"}, status=500)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def chat(request):
    """
    POST /api/ai/chat/
      Body: { conversation_id, text?, session?, history?, status? }
    """
    try:
        data = request.data or {}
        conv_id = data.get("conversation_id") or data.get("conversationId")
        text = (data.get("text") or data.get("message") or "").strip()
        
        if not conv_id:
            return Response({"detail": "conversation_id is required"}, status=400)
        
        # Log the request for debugging
        print(f"🔍 Chat request - User: {request.user.id}, Conv: {conv_id}, Text: {text[:50]}...")
        
    except Exception as e:
        print(f"❌ Error parsing chat request: {e}")
        return Response({"detail": "Invalid request data"}, status=400)

    # Ensure user is authenticated
    if not request.user or not request.user.is_authenticated:
        return Response({"error": "Authentication required"}, status=401)

    try:
        access_token = _extract_bearer_token(request)
        now_iso = timezone.now().isoformat()
        
        # Ensure we have a valid access token
        if not access_token:
            return Response({"detail": "Authentication required"}, status=401)
    except Exception as e:
        print(f"❌ Error extracting token: {e}")
        return Response({"detail": "Authentication error"}, status=401)

    LOCKED_STATUSES = {"pending", "on_process", "ready_to_claim", "rejected"}

    try:
        with transaction.atomic():
            user_id = str(request.user.id)
            row, _created = ChatHistory.objects.select_for_update().get_or_create(
                user_id=user_id,
                conversation_id=conv_id,
                defaults={
                    "history": [],
                "session": start_new_session(user_id),
            },
            )
            
            # Security check: Ensure conversation belongs to the authenticated user
            if row.user_id != user_id:
                return Response({"error": "Access denied - conversation does not belong to user"}, status=403)

            # Get inbound session data
            inbound_session = data.get("session") or {}
            
            # For new conversations, start fresh
            if _created:
                # Start with a fresh session, then merge any inbound data
                merged_session = start_new_session(str(request.user.id))
                merged_session.update(inbound_session)
                history = data.get("history", [])
            else:
                # Merge inbound data for existing conversations
                merged_session = dict(getattr(row, "session", {}) or {})
                # Ensure existing session has required keys
                if "mode" not in merged_session:
                    merged_session.update(start_new_session(str(request.user.id)))
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
                        f"🔒 **This conversation is locked** to your submitted **{row.document_request.document_type}** request.\n\n"
                        f"📊 **Current Status:** {status_messages.get(row.document_request.status, row.document_request.status)}\n\n"
                        f"💡 **To request another document:**\n"
                        f"• Tap the **'+' button** in the chat header\n"
                        f"• Or go to **Settings → Chat History** to start fresh\n"
                        f"• Or use the **'New Conversation'** option in the menu\n\n"
                        f"🎯 This ensures each document request is tracked separately!"
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
                    print(f"❌ Chatbot error: {e}")
                    # Provide a helpful fallback response
                    reply_text = (
                        "👋 **Hello! I'm your AI Assistant for document requests.**\n\n"
                        "I can help you with:\n"
                        "• **OTR** (Official Transcript of Records)\n"
                        "• **COG** (Certificate of Grades)\n"
                        "• **COE** (Certificate of Enrollment)\n"
                        "• **Other certificates**\n\n"
                        "💡 **Try saying:**\n"
                        "• \"I need my transcript\"\n"
                        "• \"Request COG\"\n"
                        "• \"How to get COE?\"\n\n"
                        "What can I help you with today?"
                    )

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
        
    except Exception as e:
        print(f"❌ Chat error: {e}")
        return Response(
            {
                "message": {
                    "id": str(uuid4()),
                    "conversation_id": conv_id,
                    "sender": "bot",
                    "text": "I'm sorry, I encountered an error. Please try again.",
                    "timestamp": timezone.now().isoformat(),
                },
                "action": None,
            },
            status=200,
        )
