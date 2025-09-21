from uuid import uuid4
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated  # or AllowAny for quick local tests
from rest_framework.response import Response
from rest_framework import status
from .services.input_checker import normalize_inputs

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def input_check(request):
    payload = request.data or {}
    profile_ctx = {
        "student_id": getattr(request.user, "student_id", None),
        "program": getattr(request.user, "program", None),
        "full_name": getattr(request.user, "full_name", None),
        "birthdate": getattr(request.user, "birthdate", None),
        "exact_address": getattr(request.user, "exact_address", None),
        "place_of_birth": getattr(request.user, "place_of_birth", None),
    }
    result = normalize_inputs(payload, profile=profile_ctx)
    return Response(result, status=status.HTTP_200_OK)

# ---------- NEW ----------
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])  # switch to AllowAny temporarily if needed
def chat(request):
    """
    Minimal shape compatible with the mobile app.

    POST: {conversation_id, text} -> {message:{...}, action:null}
    GET : ?conversation_id=...     -> [] (stubbed history)
    """
    if request.method == "GET":
        conv_id = request.query_params.get("conversation_id") or request.query_params.get("conversationId")
        # TODO: fetch real history from DB if you have one
        return Response([], status=status.HTTP_200_OK)

    data = request.data or {}
    conv_id = data.get("conversation_id") or data.get("conversationId")
    text = data.get("text") or data.get("message")

    if not conv_id or text is None:
        return Response({"detail": "conversation_id and text are required"}, status=400)

    msg_id = str(uuid4())
    ts = timezone.now().isoformat()

    # TODO: replace this with your actual LLM/retrieval flow; keep the same shape
    reply = {
        "message": {
            "id": msg_id,
            "conversation_id": conv_id,
            "sender": "bot",
            "text": f"Echo: {text}",
            "timestamp": ts,
        },
        "action": None,  # e.g., {"type": "upload_receipt", "request_id": "..."}
    }
    return Response(reply, status=status.HTTP_200_OK)
