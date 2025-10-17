from rest_framework import generics, permissions
from rest_framework.exceptions import ValidationError
from .models import Appointment, AppointmentAction
from .serializers import AppointmentSerializer, AppointmentStatusSerializer
from backend.common.permissions import IsFaculty
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions

class FacultyListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # placeholder response
        return Response({"message": "Faculty list endpoint placeholder"})

class AppointmentListCreateView(generics.ListCreateAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'faculty':
            return Appointment.objects.all().select_related('student', 'faculty')
        return Appointment.objects.filter(student=user).select_related('student', 'faculty')

    def perform_create(self, serializer):
        instance = serializer.save(student=self.request.user)
        # audit
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
            return Appointment.objects.all().select_related('student', 'faculty')
        return Appointment.objects.filter(student=user).select_related('student', 'faculty')

class AppointmentStatusUpdateView(generics.UpdateAPIView):
    queryset = Appointment.objects.all().select_related('student', 'faculty')
    serializer_class = AppointmentStatusSerializer
    permission_classes = [permissions.IsAuthenticated, IsFaculty]

    def perform_update(self, serializer):
        appt = self.get_object()
        old_status = appt.status

        # Validate no double‑booking on approval
        incoming_status = self.request.data.get('status') or appt.status
        incoming_faculty = self.request.data.get('faculty') or appt.faculty_id

        # If approving, check conflicts (same datetime)
        if incoming_status == 'approved':
            faculty_id = serializer.validated_data.get('faculty').id if serializer.validated_data.get('faculty') else appt.faculty_id
            schedule = appt.schedule
            if faculty_id and schedule:
                conflict = Appointment.objects.filter(
                    status='approved',
                    faculty_id=faculty_id,
                    schedule=schedule
                ).exclude(pk=appt.pk).exists()
                if conflict:
                    raise ValidationError("This faculty already has an approved appointment at that schedule.")

        updated = serializer.save()

        # audit
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
