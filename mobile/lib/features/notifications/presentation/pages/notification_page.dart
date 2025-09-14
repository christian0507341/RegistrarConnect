import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/notification_bloc.dart';
import '../bloc/notification_event.dart';
import '../bloc/notification_state.dart';
import '../widgets/notification_item_widget.dart';

class NotificationPage extends StatelessWidget {
  const NotificationPage({super.key}); // ✅ Remove required notificationBloc

  @override
  Widget build(BuildContext context) {
    final notificationBloc = BlocProvider.of<NotificationBloc>(context); // Access global Bloc
    notificationBloc.add(LoadNotifications());

    return BlocBuilder<NotificationBloc, NotificationState>(
      bloc: notificationBloc,
      builder: (context, state) {
        Widget body;

        if (state is NotificationLoading || state is NotificationInitial) {
          body = const Center(child: CircularProgressIndicator());
        } else if (state is NotificationLoaded) {
          final notifications = state.notifications;
          body = ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: notifications.length,
            separatorBuilder: (_, __) => const Divider(),
            itemBuilder: (context, index) {
              final n = notifications[index];
              return NotificationItemWidget(notification: n);
            },
          );
        } else if (state is NotificationError) {
          body = Center(child: Text(state.message));
        } else {
          body = const SizedBox.shrink();
        }

        return Scaffold(
          appBar: AppBar(
            title: const Text("Notifications"),
            backgroundColor: const Color(0xFF2E7D32),
          ),
          body: body,
        );
      },
    );
  }
}
