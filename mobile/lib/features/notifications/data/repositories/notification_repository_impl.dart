import '../../domain/entities/notification_item.dart';
import '../../domain/repositories/notification_repository.dart';
import 'package:flutter/material.dart';

class NotificationRepositoryImpl implements INotificationRepository {
  final List<NotificationItem> _notifications = [
    NotificationItem(
      title: "Appointment Approved",
      message: "Your appointment with Registrar has been approved.",
      time: "2h ago",
      icon: Icons.check_circle,
      color: Colors.green,
    ),
    NotificationItem(
      title: "New Announcement",
      message: "Registrar’s office will be closed on Sept 20.",
      time: "1d ago",
      icon: Icons.campaign,
      color: Colors.blue,
    ),
    NotificationItem(
      title: "Transaction Completed",
      message: "Your request for transcript has been processed.",
      time: "3d ago",
      icon: Icons.receipt_long,
      color: Colors.orange,
    ),
  ];

  @override
  Future<List<NotificationItem>> getNotifications() async {
    await Future.delayed(const Duration(milliseconds: 200)); // simulate delay
    return _notifications;
  }
}
