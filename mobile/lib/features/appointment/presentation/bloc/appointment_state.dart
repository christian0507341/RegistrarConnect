import '../../domain/entities/appointment.dart';

abstract class AppointmentState {}

class AppointmentInitial extends AppointmentState {}

class AppointmentLoaded extends AppointmentState {
  final Map<DateTime, List<Appointment>> appointments;
  AppointmentLoaded(this.appointments);
}
