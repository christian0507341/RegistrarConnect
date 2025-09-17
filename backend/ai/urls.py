from django.urls import path
from .views import input_check, chat
urlpatterns = [ 
    path("input-check/", input_check, name="input-check"),
    path("chat/", chat, name="ai-chat"),
]
