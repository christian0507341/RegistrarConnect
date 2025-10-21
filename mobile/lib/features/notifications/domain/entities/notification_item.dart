import 'package:flutter/material.dart';

class NotificationItem {
  final String id;
  final String title;
  final String message;
  final String time;
  final IconData icon;
  final Color color;

  NotificationItem({
    String? id,
    required this.title,
    required this.message,
    required this.time,
    required this.icon,
    required this.color,
  }) : id = id ?? DateTime.now().millisecondsSinceEpoch.toString();
}
