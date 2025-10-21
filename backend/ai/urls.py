# backend/ai/urls.py
from django.urls import path
from .views import chat, chat_messages, chat_history_list, delete_chat_history
from .chat_analytics_views import (
    get_chat_analytics, 
    get_system_stats, 
    reset_chat_memory, 
    test_chat_ai
)

urlpatterns = [
    path("chat/", chat, name="ai_chat"),
    path("chat/messages/", chat_messages, name="ai_chat_messages"),
    path("chat/history/", chat_history_list, name="ai_chat_history"),
    path("chat/history/<str:conversation_id>/", delete_chat_history, name="ai_delete_chat_history"),
    
    # Student Chat AI Analytics endpoints
    path("analytics/chat/", get_chat_analytics, name="ai_chat_analytics"),
    path("analytics/stats/", get_system_stats, name="ai_system_stats"),
    path("analytics/reset/", reset_chat_memory, name="ai_reset_memory"),
    path("analytics/test/", test_chat_ai, name="ai_test_chat"),
]
