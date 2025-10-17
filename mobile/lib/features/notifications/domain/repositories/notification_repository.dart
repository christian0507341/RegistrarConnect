import '../entities/notification_item.dart';

abstract class INotificationRepository {
  Future<List<NotificationItem>> getNotifications();
  Future<void> markAsRead(String notificationId);
  Future<void> sendLocalNotification({
    required String title,
    required String body,
    String? payload,
  });
  Future<void> scheduleNotification({
    required String title,
    required String body,
    required DateTime scheduledDate,
    String? payload,
  });
}
