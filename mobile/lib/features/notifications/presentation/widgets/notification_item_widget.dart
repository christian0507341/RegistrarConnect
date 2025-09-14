import 'package:flutter/material.dart';
import '../../domain/entities/notification_item.dart';

class NotificationItemWidget extends StatelessWidget {
  final NotificationItem notification;
  const NotificationItemWidget({super.key, required this.notification});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: CircleAvatar(
        backgroundColor: notification.color.withOpacity(0.2),
        child: Icon(notification.icon, color: notification.color),
      ),
      title: Text(notification.title, style: const TextStyle(fontWeight: FontWeight.bold)),
      subtitle: Text(notification.message),
      trailing: Text(
        notification.time,
        style: const TextStyle(color: Colors.grey, fontSize: 12),
      ),
    );
  }
}
