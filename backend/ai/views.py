from uuid import uuid4
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny  # temporarily AllowAny for dev
from rest_framework.response import Response
from rest_framework import status

@api_view(["GET", "POST"])
@permission_classes([AllowAny])  # mobile can call without auth for dev
def chat(request):
    
    if request.method == "GET":
        conv_id = request.query_params.get("conversation_id")
        return Response([], status=status.HTTP_200_OK)

    data = request.data or {}
    conv_id = data.get("conversation_id")
    text = data.get("text")

    if not conv_id or text is None:
        return Response({"detail": "conversation_id and text are required"}, status=400)

    msg_id = str(uuid4())
    ts = timezone.now().isoformat()

    reply = {
        "message": {
            "id": msg_id,
            "conversation_id": conv_id,
            "sender": "bot",
            "text": f"Echo: {text}",  # placeholder for real LLM
            "timestamp": ts,
        },
        "action": None,
    }
    return Response(reply, status=status.HTTP_200_OK)
