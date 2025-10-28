import '../../domain/entities/appointment.dart';

class AppointmentModel extends Appointment {
  AppointmentModel({
    required super.id,
    required super.schedule,
    required super.purpose,
    required super.status,
    required super.documentType,
    required super.facultyName,
  });

  factory AppointmentModel.fromJson(Map<String, dynamic> json) {
    try {
      return AppointmentModel(
        id: json['id'] ?? 0,
        schedule: DateTime.parse(json['schedule'] ?? DateTime.now().toIso8601String()),
        purpose: json['purpose'] ?? 'General Purpose',
        status: json['status'] ?? 'pending',
        documentType: json['document_type'] ?? 'Unknown',
        facultyName: json['faculty_name'] ?? 'Unassigned',
      );
    } catch (e) {
      // Fallback values if parsing fails
      return AppointmentModel(
        id: 0,
        schedule: DateTime.now(),
        purpose: 'General Purpose',
        status: 'pending',
        documentType: 'Unknown',
        facultyName: 'Unassigned',
      );
    }
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'schedule': schedule.toIso8601String(),
    'purpose': purpose,
    'status': status,
    'document_type': documentType,
    'faculty_name': facultyName,
  };

  Appointment toEntity() => this;
}
