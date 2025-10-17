from django.urls import path
from .views import document_requests_web
from .views import (
    DocumentRequestListCreateView,
    DocumentRequestDetailView,
    DocumentRequestStatusUpdateView,
    create_document_request,
    document_request_history,
    document_request_status,
    document_request_cancel,
    upload_receipt,  # NEW
    view_receipt,  # NEW
)

urlpatterns = [
    # Generic API endpoints
    path('', DocumentRequestListCreateView.as_view(), name="document-request-list-create"),
    path('<int:pk>/', DocumentRequestDetailView.as_view(), name="document-request-detail"),
    path('<int:pk>/status/', DocumentRequestStatusUpdateView.as_view(), name='document-request-status'),

    # Creation endpoint (separate for clarity)
    path('create/', create_document_request, name="create_document_request"),
    path('api/document-requests/web/', document_requests_web, name='document_requests_web'),
    path('list/', DocumentRequestListCreateView.as_view(), name="document-request-list"),

    # Chatbot-specific endpoints (namespaced under /chatbot/)
    path('chatbot/history/', document_request_history, name="document-request-history"),
    path('chatbot/<int:pk>/status/', document_request_status, name="document-request-status-chatbot"),
    path('chatbot/<int:pk>/cancel/', document_request_cancel, name="document-request-cancel-chatbot"),

    # NEW: receipt upload (mobile)
    path('<int:pk>/upload-receipt/', upload_receipt, name='document-request-upload-receipt'),
    
    # NEW: faculty receipt view
    path('<int:pk>/receipt/', view_receipt, name='document-request-view-receipt'),
]
