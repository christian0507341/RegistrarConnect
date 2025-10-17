import '../../domain/entities/appointment.dart';
import '../../domain/repositories/appointment_repository.dart';

class AppointmentRepositoryImpl implements AppointmentRepository {
  // 🔹 This is the storage for appointments
  final Map<DateTime, List<Appointment>> _storage = {};

  // Public getter for BLoC
  Map<DateTime, List<Appointment>> get storage => _storage;

  @override
  Future<void> addAppointment(Appointment appointment) async {
    final day = DateTime(
        appointment.date.year, appointment.date.month, appointment.date.day);

    if (_storage.containsKey(day)) {
      _storage[day]!.add(appointment);
    } else {
      _storage[day] = [appointment];
    }
  }

  @override
  Future<List<Appointment>> getAppointments() async {
    return _storage.values.expand((list) => list).toList();
  }

  List<Appointment> getAppointmentsByDate(DateTime date) {
    final day = DateTime(date.year, date.month, date.day);
    return _storage[day] ?? [];
  }
}
