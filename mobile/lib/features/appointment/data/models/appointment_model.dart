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
    return AppointmentModel(
      id: json['id'],
      schedule: DateTime.parse(json['schedule']),
      purpose: json['purpose'],
      status: json['status'],
      documentType: json['document_request']['document_type'] ?? 'Unknown',
      facultyName: json['faculty'] != null
          ? '${json['faculty']['first_name']} ${json['faculty']['last_name']}'
          : 'Unassigned',
    );
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
