import '../../domain/entities/appointment.dart';

class AppointmentModel extends Appointment {
  AppointmentModel({
    required int id,
    required DateTime schedule,
    required String purpose,
    required String status,
    required String documentType,
    required String facultyName,
  }) : super(
         id: id,
         schedule: schedule,
         purpose: purpose,
         status: status,
         documentType: documentType,
         facultyName: facultyName,
       );

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
