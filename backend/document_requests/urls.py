from django.urls import path
from .views import (
    document_requests_web,
    DocumentRequestListView,
    DocumentRequestListCreateView,
    DocumentRequestDetailView,
    DocumentRequestStatusUpdateView,
    create_document_request,
    document_request_history,
    document_request_status,
    document_request_cancel,
    StatusListView,
    StatusUpdateView,
    status_web_view
)

urlpatterns = [
    path('', DocumentRequestListCreateView.as_view(), name="document-request-list-create"),
    path('<int:pk>/', DocumentRequestDetailView.as_view(), name="document-request-detail"),
    path('<int:pk>/status/', DocumentRequestStatusUpdateView.as_view(), name='document-request-status'),
    path('create/', create_document_request, name="create_document_request"),
    path('api/document-requests/web/', document_requests_web, name='document_requests_web'),
    path('list/', DocumentRequestListView.as_view(), name="document-request-list"),
    path('chatbot/history/', document_request_history, name="document-request-history"),
    path('chatbot/<int:pk>/status/', document_request_status, name="document-request-status-chatbot"),
    path('chatbot/<int:pk>/cancel/', document_request_cancel, name="document-request-cancel-chatbot"),
    path('statuses/', StatusListView.as_view(), name='status-list'),
    path('statuses/<int:pk>/update/', StatusUpdateView.as_view(), name='status-update'),
    path('web/statuses/', status_web_view, name='status-web'),
]