from django.urls import path
from .views import DocumentRequestListCreateView, DocumentRequestDetailView, DocumentRequestStatusUpdateView
from .views import create_document_request
from .views import document_request_history, document_request_status, document_request_cancel

urlpatterns = [
    path('', DocumentRequestListCreateView.as_view(), name="document-request-list-create"),
    path('<int:pk>/', DocumentRequestDetailView.as_view(), name="document-request-detail"),
    path('<int:pk>/status/', DocumentRequestStatusUpdateView.as_view(), name='document-request-status'),
    path("create/", create_document_request, name="create_document_request"),

    # ✅ Chatbot endpoints
    path('chatbot/history/', document_request_history, name="document-request-history"),
    path('chatbot/<int:pk>/status/', document_request_status, name="document-request-status-chatbot"),
    path('chatbot/<int:pk>/cancel/', document_request_cancel, name="document-request-cancel-chatbot"),
]
