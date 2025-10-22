from django.urls import path
from .views import (
    AppointmentListCreateView,
    AppointmentDetailView,
    AppointmentStatusUpdateView,
    FacultyListView,
    AppointmentSettingsView,
    appointment_statistics,
    trigger_automatic_scheduling,
    get_next_available_slot,
    debug_ready_requests,
    student_appointments
)
from .schedule_views import (
    time_slot_list_create,
    time_slot_detail
)
from .faculty_views import (
    faculty_dashboard_stats,
    faculty_students,
    faculty_reports,
    faculty_notifications
)

urlpatterns = [
    path('', AppointmentListCreateView.as_view(), name='appointment-list-create'),
    path('student/', student_appointments, name='student-appointments'),
    path('<int:pk>/', AppointmentDetailView.as_view(), name='appointment-detail'),
    path('<int:pk>/status/', AppointmentStatusUpdateView.as_view(), name='appointment-status'),
    path("faculty/", FacultyListView.as_view(), name="faculty-list"),
    path("settings/", AppointmentSettingsView.as_view(), name="appointment-settings"),
    path("statistics/", appointment_statistics, name="appointment-statistics"),
    path("trigger-scheduling/", trigger_automatic_scheduling, name="trigger-automatic-scheduling"),
    path("next-slot/", get_next_available_slot, name="next-available-slot"),
    path("debug-ready-requests/", debug_ready_requests, name="debug-ready-requests"),
    
    # Faculty endpoints
    path("faculty/stats/", faculty_dashboard_stats, name="faculty-dashboard-stats"),
    path("faculty/students/", faculty_students, name="faculty-students"),
    path("faculty/reports/", faculty_reports, name="faculty-reports"),
    path("faculty/notifications/", faculty_notifications, name="faculty-notifications"),
    
    # Schedule management endpoints
    path("schedule/", time_slot_list_create, name="time-slot-list-create"),
    path("schedule/<int:pk>/", time_slot_detail, name="time-slot-detail"),
]
