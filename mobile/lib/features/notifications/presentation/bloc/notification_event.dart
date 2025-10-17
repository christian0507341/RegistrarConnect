abstract class NotificationEvent {}

class LoadNotifications extends NotificationEvent {}

class MarkAsRead extends NotificationEvent {
  final String notificationId;
  MarkAsRead(this.notificationId);
}

class SendLocalNotification extends NotificationEvent {
  final String title;
  final String body;
  final String? payload;
  
  SendLocalNotification({
    required this.title,
    required this.body,
    this.payload,
  });
}

class ScheduleNotification extends NotificationEvent {
  final String title;
  final String body;
  final DateTime scheduledDate;
  final String? payload;
  
  ScheduleNotification({
    required this.title,
    required this.body,
    required this.scheduledDate,
    this.payload,
  });
}