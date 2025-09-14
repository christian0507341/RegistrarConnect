from django.db import models
from django.conf import settings

class ChatHistory(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name="chat_histories"
    )
    history = models.JSONField(default=list)  # stores conversation [{sender, text, ts}, ...]
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"ChatHistory({self.user.username}) - {self.created_at:%Y-%m-%d %H:%M}"
