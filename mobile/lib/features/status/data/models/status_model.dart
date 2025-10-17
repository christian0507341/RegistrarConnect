import '../../domain/entities/status_entity.dart';

class StatusModel extends StatusEntity {
  StatusModel({
    required super.title,
    required super.payment,
    required super.document,
    required super.status,
    super.appointmentDate,
  });

  factory StatusModel.fromJson(Map<String, dynamic> json) {
    return StatusModel(
      title: json['title'] as String? ?? 'Unknown',
      payment: (json['payment'] as String?) == 't',
      document: (json['document'] as String?) == 't',
      status: json['status'] as String? ?? 'pending',
      appointmentDate: json['appointment_date'] != null 
          ? DateTime.parse(json['appointment_date']) 
          : null,
    );
  }
}
