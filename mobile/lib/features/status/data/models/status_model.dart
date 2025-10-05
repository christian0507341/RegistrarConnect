import '../../domain/entities/status_entity.dart';

class StatusModel extends StatusEntity {
  StatusModel({
    required String title,
    required bool payment,
    required bool document,
  }) : super(title: title, payment: payment, document: document);

  factory StatusModel.fromJson(Map<String, dynamic> json) {
    return StatusModel(
      title: json['title'] as String? ?? 'Unknown',
      payment: (json['payment'] as String?) == 't',
      document: (json['document'] as String?) == 't',
    );
  }
}