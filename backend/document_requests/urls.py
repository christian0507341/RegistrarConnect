from django.urls import path
from .views import DocumentRequestCreateView, DocumentRequestListView

urlpatterns = [
    path('create/', DocumentRequestCreateView.as_view(), name='create-request'),
    path('my-requests/', DocumentRequestListView.as_view(), name='my-requests'),
]