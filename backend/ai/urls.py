# backend/ai/urls.py
from django.urls import path
from .views import chat, chat_messages, chat_history_list, delete_chat_history

urlpatterns = [
    path("chat/", chat, name="ai_chat"),
    path("chat/messages/", chat_messages, name="ai_chat_messages"),
    path("chat/history/", chat_history_list, name="ai_chat_history"),
    path("chat/history/<str:conversation_id>/", delete_chat_history, name="ai_delete_chat_history"),
]
