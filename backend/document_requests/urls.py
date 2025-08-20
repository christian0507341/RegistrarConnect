from django.urls import path
from .views import DocumentRequestListCreateView, DocumentRequestDetailView, DocumentRequestStatusUpdateView

urlpatterns = [
    path('', DocumentRequestListCreateView.as_view(), name="document-request-list-create"),
    path('<int:pk>/', DocumentRequestDetailView.as_view(), name="document-request-detail"),
    path('<int:pk>/status/', DocumentRequestStatusUpdateView.as_view(), name='document-request-status'),

]
