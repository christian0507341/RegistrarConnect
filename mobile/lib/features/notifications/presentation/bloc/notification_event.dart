import 'package:mobile/features/appointment/domain/entities/appointment.dart';

abstract class NotificationEvent {}

class LoadNotifications extends NotificationEvent {}

class AppointmentScheduled extends NotificationEvent {
  final Appointment appointment;
  AppointmentScheduled(this.appointment);
}
