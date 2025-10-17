from rest_framework import generics, permissions
from rest_framework.exceptions import ValidationError
from .models import Appointment, AppointmentAction
from .serializers import AppointmentSerializer, AppointmentStatusSerializer
from backend.common.permissions import IsFaculty
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.utils import timezone

class FacultyListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from backend.accounts.models import User
        faculty = User.objects.filter(role='faculty').values('id', 'email', 'first_name', 'last_name')
        return Response(faculty)

class AppointmentListCreateView(generics.ListCreateAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'faculty':
            return Appointment.objects.all().select_related('student', 'faculty', 'document_request')
        return Appointment.objects.filter(student=user).select_related('student', 'faculty', 'document_request')

    def perform_create(self, serializer):
        instance = serializer.save(student=self.request.user)
        AppointmentAction.objects.create(
            appointment=instance,
            actor=self.request.user,
            action='created',
            to_status=instance.status,
            notes=instance.purpose or ''
        )

class AppointmentDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'faculty':
            return Appointment.objects.all().select_related('student', 'faculty', 'document_request')
        return Appointment.objects.filter(student=user).select_related('student', 'faculty', 'document_request')

class AppointmentStatusUpdateView(generics.UpdateAPIView):
    queryset = Appointment.objects.all().select_related('student', 'faculty', 'document_request')
    serializer_class = AppointmentStatusSerializer
    permission_classes = [permissions.IsAuthenticated, IsFaculty]

    def perform_update(self, serializer):
        appt = self.get_object()
        old_status = appt.status
        incoming_status = self.request.data.get('status') or appt.status
        incoming_schedule = self.request.data.get('schedule') or appt.schedule

        if incoming_status == 'scheduled':
            if not incoming_schedule:
                raise ValidationError("Schedule is required to set status to scheduled.")
            if incoming_schedule <= timezone.now():
                raise ValidationError("Schedule must be in the future.")
            conflict = Appointment.objects.filter(
                faculty=appt.faculty,
                schedule=incoming_schedule,
                status='scheduled'
            ).exclude(pk=appt.pk).exists()
            if conflict:
                raise ValidationError("This faculty already has an appointment at that schedule.")

        updated = serializer.save()
        action = 'status_changed'
        notes = self.request.data.get('notes', '')
        if 'faculty' in serializer.validated_data and (appt.faculty != updated.faculty):
            action = 'assigned' if old_status == updated.status else 'status_changed'
        AppointmentAction.objects.create(
            appointment=updated,
            actor=self.request.user,
            action=action,
            from_status=old_status,
            to_status=updated.status,
            notes=notes
        )