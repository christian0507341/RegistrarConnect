import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/theme/theme_bloc.dart';
import '../bloc/notification_bloc.dart';
import '../bloc/notification_event.dart';
import '../bloc/notification_state.dart';
import '../widgets/notification_item_widget.dart';

class NotificationPage extends StatefulWidget {
  const NotificationPage({super.key});

  @override
  State<NotificationPage> createState() => _NotificationPageState();
}

class _NotificationPageState extends State<NotificationPage> {
  Timer? _autoRefreshTimer;

  @override
  void initState() {
    super.initState();
    // Load notifications immediately (show loading on first load)
    final notificationBloc = context.read<NotificationBloc>();
    notificationBloc.add(LoadNotifications(showLoading: true));
    
    // Set up auto-refresh every 10 seconds (no loading screen)
    _autoRefreshTimer = Timer.periodic(const Duration(seconds: 10), (timer) {
      if (mounted) {
        context.read<NotificationBloc>().add(LoadNotifications(showLoading: false));
        print('🔄 Auto-refreshing notifications...');
      }
    });
    
    print('✅ Auto-refresh enabled (every 10 seconds)');
  }

  @override
  void dispose() {
    _autoRefreshTimer?.cancel();
    print('🛑 Auto-refresh disabled');
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ThemeBloc, ThemeState>(
      builder: (context, themeState) {
        final isDarkMode = themeState is ThemeLoadedState ? themeState.isDarkMode : false;
        
        return Scaffold(
          backgroundColor: isDarkMode ? const Color(0xFF121212) : Colors.grey[50],
          appBar: AppBar(
            title: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  "🔔 Notifications",
                  style: TextStyle(
                    fontWeight: FontWeight.w800,
                    fontSize: 24,
                    letterSpacing: 0.5,
                    color: isDarkMode ? Colors.white : const Color(0xFF1F2937),
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.green.withAlpha(51),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.refresh,
                        size: 12,
                        color: Colors.green[700],
                      ),
                      const SizedBox(width: 4),
                      Text(
                        'Auto',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          color: Colors.green[700],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.refresh_rounded),
                tooltip: 'Refresh Now',
                onPressed: () {
                  context.read<NotificationBloc>().add(LoadNotifications(showLoading: false));
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: const Row(
                        children: [
                          Icon(Icons.refresh, color: Colors.white, size: 20),
                          SizedBox(width: 8),
                          Text('Refreshing notifications...'),
                        ],
                      ),
                      duration: const Duration(seconds: 1),
                      behavior: SnackBarBehavior.floating,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      backgroundColor: Colors.blue[700],
                    ),
                  );
                },
              ),
            ],
            elevation: 0,
            backgroundColor: Colors.transparent,
            foregroundColor: isDarkMode ? Colors.white : Colors.grey[800],
            centerTitle: true,
            flexibleSpace: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: isDarkMode 
                    ? [const Color(0xFF1a1a1a), const Color(0xFF2d2d2d)]
                    : [Colors.white, Colors.grey[50]!],
                ),
              ),
            ),
          ),
      body: BlocBuilder<NotificationBloc, NotificationState>(
        builder: (context, state) {
          if (state is NotificationLoading || state is NotificationInitial) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(
                    valueColor: AlwaysStoppedAnimation<Color>(
                      isDarkMode ? Colors.white : Colors.blue[600]!,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Loading notifications...',
                    style: TextStyle(
                      color: isDarkMode ? Colors.grey[300] : Colors.grey[600],
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            );
          } else if (state is NotificationLoaded) {
            final notifications = state.notifications;

            if (notifications.isEmpty) {
              return Center(
                child: Container(
                  margin: const EdgeInsets.all(24),
                  padding: const EdgeInsets.all(32),
                  decoration: BoxDecoration(
                    color: isDarkMode ? Colors.grey[800] : Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withAlpha(26),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: Colors.blue.withAlpha(26),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          Icons.notifications_none,
                          size: 48,
                          color: Colors.blue[600],
                        ),
                      ),
                      const SizedBox(height: 20),
                      Text(
                        "No Notifications Yet",
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w700,
                          color: isDarkMode ? Colors.white : const Color(0xFF1F2937),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        "You'll receive notifications about your document requests here.",
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 14,
                          color: isDarkMode ? Colors.grey[300] : const Color(0xFF6B7280),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }

            return ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: notifications.length,
              separatorBuilder: (_, _) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final n = notifications[index];
                return Dismissible(
                  key: Key(n.id),
                  background: Container(
                    margin: const EdgeInsets.symmetric(vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.red,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    alignment: Alignment.centerRight,
                    padding: const EdgeInsets.only(right: 20),
                    child: const Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.delete_outline,
                          color: Colors.white,
                          size: 32,
                        ),
                        SizedBox(height: 4),
                        Text(
                          'Delete',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                  direction: DismissDirection.endToStart,
                  confirmDismiss: (direction) async {
                    return await showDialog(
                      context: context,
                      builder: (BuildContext context) {
                        return AlertDialog(
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                          title: const Row(
                            children: [
                              Icon(
                                Icons.delete_outline,
                                color: Colors.red,
                                size: 24,
                              ),
                              SizedBox(width: 8),
                              Text('Delete Notification'),
                            ],
                          ),
                          content: const Text(
                            'Are you sure you want to delete this notification?',
                            style: TextStyle(fontSize: 16),
                          ),
                          actions: [
                            TextButton(
                              onPressed: () => Navigator.of(context).pop(false),
                              child: const Text(
                                'Cancel',
                                style: TextStyle(color: Colors.grey),
                              ),
                            ),
                            ElevatedButton(
                              onPressed: () => Navigator.of(context).pop(true),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.red,
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                              ),
                              child: const Text('Delete'),
                            ),
                          ],
                        );
                      },
                    );
                  },
                  onDismissed: (direction) {
                    // Delete the notification from the BLoC
                    context.read<NotificationBloc>().add(DeleteNotification(n.id));
                    
                    // Show snackbar
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: const Row(
                          children: [
                            Icon(
                              Icons.check_circle,
                              color: Colors.white,
                            ),
                            SizedBox(width: 8),
                            Expanded(
                              child: Text('Notification deleted'),
                            ),
                          ],
                        ),
                        backgroundColor: Colors.green,
                        behavior: SnackBarBehavior.floating,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                        duration: const Duration(seconds: 2),
                      ),
                    );
                  },
                  child: Card(
                    elevation: 2,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 12),
                      child: NotificationItemWidget(notification: n),
                    ),
                  ),
                );
              },
            );
          } else if (state is NotificationError) {
            return Center(
              child: Text(
                state.message,
                style: const TextStyle(color: Colors.redAccent),
              ),
            );
          } else {
            return const SizedBox.shrink();
          }
        },
      ),
        );
      },
    );
  }
}
