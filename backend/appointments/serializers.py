from rest_framework import serializers
from .models import Appointment, AppointmentAction, AppointmentSettings, AppointmentTimeSlot

class AppointmentActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppointmentAction
        fields = '__all__'
        read_only_fields = ['created_at']

class AppointmentSerializer(serializers.ModelSerializer):
    actions = AppointmentActionSerializer(many=True, read_only=True)
    student_name = serializers.SerializerMethodField()
    student_id = serializers.SerializerMethodField()
    faculty_name = serializers.SerializerMethodField()
    document_type = serializers.SerializerMethodField()
    request_id = serializers.SerializerMethodField()
    scheduled_date = serializers.SerializerMethodField()
    scheduled_time = serializers.SerializerMethodField()
    date = serializers.SerializerMethodField()
    start_time = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    
    class Meta:
        model = Appointment
        fields = '__all__'
        read_only_fields = ['created_at']
    
    def get_student_name(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name}".strip() or obj.student.email
    
    def get_student_id(self, obj):
        # Return the actual student ID number, not the database ID
        return getattr(obj.student, 'student_id', obj.student.id)
    
    def get_faculty_name(self, obj):
        if obj.faculty:
            return f"{obj.faculty.first_name} {obj.faculty.last_name}".strip() or obj.faculty.email
        return "Not assigned"
    
    def get_document_type(self, obj):
        if obj.document_request:
            return obj.document_request.document_type
        return "N/A"
    
    def get_request_id(self, obj):
        if obj.document_request:
            return obj.document_request.id
        return None
    
    def get_scheduled_date(self, obj):
        if obj.schedule:
            return obj.schedule.strftime('%Y-%m-%d')
        return None
    
    def get_scheduled_time(self, obj):
        if obj.schedule:
            return obj.schedule.strftime('%H:%M')
        return None
    
    def get_date(self, obj):
        # Alias for scheduled_date
        return self.get_scheduled_date(obj)
    
    def get_start_time(self, obj):
        # Alias for scheduled_time
        return self.get_scheduled_time(obj)
    
    def get_location(self, obj):
        return "Registrar Office"

class AppointmentSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppointmentSettings
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
    
    def validate_max_appointments_per_day(self, value):
        if value <= 0:
            raise serializers.ValidationError("Maximum appointments per day must be greater than 0")
        if value > 1000:
            raise serializers.ValidationError("Maximum appointments per day cannot exceed 1000")
        return value
    
    def validate_appointment_start_hour(self, value):
        if not 0 <= value <= 23:
            raise serializers.ValidationError("Start hour must be between 0 and 23")
        return value
    
    def validate_appointment_end_hour(self, value):
        if not 0 <= value <= 23:
            raise serializers.ValidationError("End hour must be between 0 and 23")
        return value
    
    def validate(self, data):
        start_hour = data.get('appointment_start_hour')
        end_hour = data.get('appointment_end_hour')
        
        if start_hour is not None and end_hour is not None:
            if start_hour >= end_hour:
                raise serializers.ValidationError("End hour must be after start hour")
        
        return data


class AppointmentTimeSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppointmentTimeSlot
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
    
    def validate(self, data):
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        
        if start_time and end_time:
            if start_time >= end_time:
                raise serializers.ValidationError("End time must be after start time")
        
        slots_per_hour = data.get('slots_per_hour')
        if slots_per_hour and slots_per_hour > 12:
            raise serializers.ValidationError("Slots per hour cannot exceed 12 (5 minutes per slot)")
        
        return data