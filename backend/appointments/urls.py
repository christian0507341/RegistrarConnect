from django.urls import path
from .views import AppointmentCreateView

urlpatterns = [
    path('create/', AppointmentCreateView.as_view(), name='appointment-create'),
]
