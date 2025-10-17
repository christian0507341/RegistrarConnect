import 'package:flutter/material.dart';
import 'package:mobile/features/notifications/presentation/bloc/notification_event.dart';
import 'package:mobile/features/notifications/presentation/bloc/notification_bloc.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class NotificationHelper {
  static void showTestNotification(BuildContext context) {
    context.read<NotificationBloc>().add(
      SendLocalNotification(
        title: "Test Notification",
        body: "This is a test notification from RegistrarConnect!",
        payload: "test_notification",
      ),
    );
  }

  static void scheduleAppointmentReminder(BuildContext context, DateTime appointmentDate) {
    final reminderTime = appointmentDate.subtract(const Duration(hours: 1));
    
    context.read<NotificationBloc>().add(
      ScheduleNotification(
        title: "Appointment Reminder",
        body: "You have an appointment in 1 hour!",
        scheduledDate: reminderTime,
        payload: "appointment_reminder",
      ),
    );
  }

  static void showAppointmentApproved(BuildContext context) {
    context.read<NotificationBloc>().add(
      SendLocalNotification(
        title: "Appointment Approved",
        body: "Your appointment with the Registrar has been approved!",
        payload: "appointment_approved",
      ),
    );
  }

  static void showDocumentReady(BuildContext context) {
    context.read<NotificationBloc>().add(
      SendLocalNotification(
        title: "Document Ready",
        body: "Your requested document is ready for pickup!",
        payload: "document_ready",
      ),
    );
  }

  static void showPaymentReceived(BuildContext context) {
    context.read<NotificationBloc>().add(
      SendLocalNotification(
        title: "Payment Received",
        body: "Your payment has been processed successfully!",
        payload: "payment_received",
      ),
    );
  }
}
