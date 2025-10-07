from django.conf import settings
from django.db import models


class ChatHistory(models.Model):
    """
    One record per (user, conversation_id).
    - history: flat list of UI bubbles [{id, conversation_id, sender, text, timestamp}, ...]
    - session: full engine state snapshot (slots, expected step, etc.)
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="ai_chat_histories")
    conversation_id = models.CharField(max_length=128, db_index=True)

    # UI bubbles shown in the mobile app
    history = models.JSONField(default=list, blank=True)

    # Engine session/state snapshot used by chatbot_cli logic
    session = models.JSONField(default=dict, blank=True)

    # Status of the conversation (e.g., draft, confirming, awaiting_payment, etc.)
    status = models.CharField(max_length=50, default="draft")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "conversation_id")
        indexes = [
            models.Index(fields=["user", "conversation_id"]),
        ]

    def __str__(self) -> str:
        return f"{self.user_id}:{self.conversation_id}"