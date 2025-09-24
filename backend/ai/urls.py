# backend/ai/urls.py
from django.urls import path
from .views import chat, chat_messages

urlpatterns = [
    path("chat/", chat, name="ai_chat"),
    path("chat/messages/", chat_messages, name="ai_chat_messages"),
]
