from django.contrib import admin
from .models import Appointment, AppointmentAction, AppointmentSettings

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ['student', 'faculty', 'document_request', 'schedule', 'status', 'created_at']
    list_filter = ['status', 'schedule', 'created_at']
    search_fields = ['student__email', 'faculty__email', 'document_request__document_type']
    readonly_fields = ['created_at']
    ordering = ['-created_at']

@admin.register(AppointmentAction)
class AppointmentActionAdmin(admin.ModelAdmin):
    list_display = ['appointment', 'action', 'from_status', 'to_status', 'actor', 'created_at']
    list_filter = ['action', 'created_at']
    readonly_fields = ['created_at']
    ordering = ['-created_at']

@admin.register(AppointmentSettings)
class AppointmentSettingsAdmin(admin.ModelAdmin):
    list_display = ['max_appointments_per_day', 'appointment_start_hour', 'appointment_end_hour', 'advance_days', 'exclude_weekends']
    fields = [
        'max_appointments_per_day',
        'appointment_start_hour',
        'appointment_end_hour',
        'appointment_duration_minutes',
        'advance_days',
        'exclude_weekends'
    ]
    
    def has_add_permission(self, request):
        # Only allow one settings record
        return not AppointmentSettings.objects.exists()
    
    def has_delete_permission(self, request, obj=None):
        # Don't allow deletion of settings
        return False
