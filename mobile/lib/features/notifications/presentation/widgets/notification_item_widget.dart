import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/entities/notification_item.dart';
import '../bloc/notification_bloc.dart';
import '../bloc/notification_event.dart';
import 'package:mobile/features/theme/presentation/bloc/theme_bloc.dart';
import 'package:mobile/features/theme/presentation/bloc/theme_state.dart';

class NotificationItemWidget extends StatelessWidget {
  final NotificationItem notification;
  const NotificationItemWidget({super.key, required this.notification});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ThemeBloc, ThemeState>(
      builder: (context, themeState) {
        return ListTile(
          leading: CircleAvatar(
            backgroundColor: notification.color.withValues(alpha: 0.2),
            child: Icon(notification.icon, color: notification.color),
          ),
          title: Text(
            notification.title,
            style: TextStyle(
              fontWeight: notification.isRead ? FontWeight.normal : FontWeight.bold,
              color: themeState.isDarkMode ? Colors.white : Colors.black,
            ),
          ),
          subtitle: Text(
            notification.message,
            style: TextStyle(
              color: themeState.isDarkMode ? Colors.white70 : Colors.black54,
            ),
          ),
          trailing: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (!notification.isRead)
                Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    color: Colors.blue,
                    shape: BoxShape.circle,
                  ),
                ),
              const SizedBox(width: 8),
              Text(
                notification.time,
                style: TextStyle(
                  color: themeState.isDarkMode ? Colors.white70 : Colors.grey,
                  fontSize: 12,
                ),
              ),
            ],
          ),
          onTap: () {
            if (!notification.isRead) {
              context.read<NotificationBloc>().add(MarkAsRead(notification.id));
            }
          },
        );
      },
    );
  }
}
