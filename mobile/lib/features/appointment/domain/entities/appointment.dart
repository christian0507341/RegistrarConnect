class Appointment {
  final int id; // Added to match backend Appointment model
  final DateTime schedule; // Renamed from date for clarity
  final String purpose; // Matches backend purpose
  final String
  status; // Matches backend status (pending, scheduled, missed, cancelled)
  final String documentType; // From linked DocumentRequest
  final String facultyName; // For display

  Appointment({
    required this.id,
    required this.schedule,
    required this.purpose,
    required this.status,
    required this.documentType,
    required this.facultyName,
  });
}
