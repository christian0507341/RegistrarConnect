import 'package:mobile/features/appointment/domain/entities/appointment.dart';

abstract class NotificationEvent {}

class LoadNotifications extends NotificationEvent {}

class AppointmentScheduled extends NotificationEvent {
  final Appointment appointment;
  AppointmentScheduled(this.appointment);
}

// New events for local notifications
class ShowDocumentStatusNotification extends NotificationEvent {
  final String documentType;
  final String oldStatus;
  final String newStatus;
  final int requestId;
  
  ShowDocumentStatusNotification({
    required this.documentType,
    required this.oldStatus,
    required this.newStatus,
    required this.requestId,
  });
}

class ShowPaymentNotification extends NotificationEvent {
  final String documentType;
  final bool isApproved;
  final int requestId;
  
  ShowPaymentNotification({
    required this.documentType,
    required this.isApproved,
    required this.requestId,
  });
}

class ShowReceiptNotification extends NotificationEvent {
  final String documentType;
  final int requestId;
  
  ShowReceiptNotification({
    required this.documentType,
    required this.requestId,
  });
}

class ShowSystemAnnouncement extends NotificationEvent {
  final String title;
  final String message;
  final int announcementId;
  
  ShowSystemAnnouncement({
    required this.title,
    required this.message,
    required this.announcementId,
  });
}

class ShowCustomNotification extends NotificationEvent {
  final int id;
  final String title;
  final String body;
  final String? payload;
  
  ShowCustomNotification({
    required this.id,
    required this.title,
    required this.body,
    this.payload,
  });
}