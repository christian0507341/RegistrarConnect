import '../entities/notification_item.dart';

abstract class INotificationRepository {
  Future<List<NotificationItem>> getNotifications();
}
