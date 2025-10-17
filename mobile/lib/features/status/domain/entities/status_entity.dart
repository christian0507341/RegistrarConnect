class StatusEntity {
  final String title;
  final bool payment;
  final bool document;
  final String status;
  final DateTime? appointmentDate;

  StatusEntity({
    required this.title,
    required this.payment,
    required this.document,
    required this.status,
    this.appointmentDate,
  });
}
