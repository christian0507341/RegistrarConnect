import '../../domain/entities/appointment.dart';

abstract class AppointmentEvent {}

class LoadAppointments extends AppointmentEvent {}

class AddAppointmentEvent extends AppointmentEvent {
  final Appointment appointment;
  AddAppointmentEvent(this.appointment);
}
