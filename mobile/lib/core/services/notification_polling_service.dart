import 'dart:async';
import 'package:dio/dio.dart';
import 'package:mobile/core/services/secure_storage.dart';
import 'package:mobile/core/services/dio_client.dart';
import 'package:mobile/core/services/local_notification_service.dart';
import 'package:mobile/core/constants/endpoints.dart';

class NotificationPollingService {
  static final NotificationPollingService _instance = NotificationPollingService._internal();
  factory NotificationPollingService() => _instance;
  NotificationPollingService._internal();

  Timer? _pollingTimer;
  final SecureStorageService _storage = SecureStorageService();
  late final Dio _dio;
  final LocalNotificationService _localNotificationService = LocalNotificationService();
  
  bool _isPolling = false;
  final Set<String> _shownNotificationIds = {};

  /// Initialize the polling service
  Future<void> initialize() async {
    final dioClient = DioClient(_storage);
    _dio = dioClient.dio;
    await _localNotificationService.initialize();
  }

  /// Start polling for new notifications every 30 seconds
  void startPolling({Duration interval = const Duration(seconds: 5)}) {
    if (_isPolling) {
      return; // Already polling
    }

    _isPolling = true;
    
    // Check immediately
    _checkForNotifications();
    
    // Then check periodically
    _pollingTimer = Timer.periodic(interval, (timer) {
      _checkForNotifications();
    });
    
    print('📡 Notification polling started (every ${interval.inSeconds}s)');
  }

  /// Stop polling for notifications
  void stopPolling() {
    _pollingTimer?.cancel();
    _pollingTimer = null;
    _isPolling = false;
    print('📡 Notification polling stopped');
  }

  /// Manually check for new notifications
  Future<void> _checkForNotifications() async {
    try {
      final token = await _storage.readAccess();
      if (token == null || token.isEmpty) {
        print('⚠️ No access token, skipping notification check');
        return;
      }

      print('🔍 Checking for pending notifications...');

      final response = await _dio.get(
        '${Endpoints.baseUrl}${Endpoints.pendingNotifications}',
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
            'Content-Type': 'application/json',
          },
        ),
      );

      if (response.statusCode == 200) {
        final data = response.data;
        final notifications = List<Map<String, dynamic>>.from(data['notifications'] ?? []);
        final count = data['count'] ?? 0;

        print('📬 Found $count pending notifications');

        if (notifications.isNotEmpty) {
          final newNotifications = <Map<String, dynamic>>[];
          final notificationIdsToShow = <String>[];

          // Filter out already shown notifications
          for (final notification in notifications) {
            final id = notification['id']?.toString() ?? '';
            if (id.isNotEmpty && !_shownNotificationIds.contains(id)) {
              newNotifications.add(notification);
              notificationIdsToShow.add(id);
            }
          }

          if (newNotifications.isNotEmpty) {
            print('🆕 ${newNotifications.length} new notifications to show');
            
            // Show local notifications
            for (final notification in newNotifications) {
              await _showLocalNotification(notification);
            }

            // Mark as shown locally to prevent duplicate local notifications
            _shownNotificationIds.addAll(notificationIdsToShow);

            // DON'T clear from backend cache - let notification page fetch them
            // The notifications will persist in cache and notification page
            print('✓ Notifications shown in status bar, also available in notification page');
          } else {
            print('✓ All pending notifications already shown');
          }
        }
      }
    } catch (e) {
      print('❌ Error checking for notifications: $e');
    }
  }

  /// Show a local notification
  Future<void> _showLocalNotification(Map<String, dynamic> notification) async {
    try {
      final type = notification['type'] ?? '';
      final title = notification['title'] ?? 'Notification';
      final message = notification['message'] ?? '';
      final requestId = notification['request_id'] ?? 0;
      
      // Generate unique notification ID from the notification ID string
      final notificationIdStr = notification['id']?.toString() ?? '';
      int notificationId = notificationIdStr.hashCode.abs() % 2147483647;

      print('🔔 Showing notification: $title');

      if (type == 'payment_approved') {
        await _localNotificationService.showNotification(
          id: notificationId,
          title: '✅ $title',
          body: message,
          payload: 'payment_approved_$requestId',
        );
      } else if (type == 'document_approved') {
        await _localNotificationService.showNotification(
          id: notificationId,
          title: '✅ $title',
          body: message,
          payload: 'document_approved_$requestId',
        );
      } else {
        await _localNotificationService.showNotification(
          id: notificationId,
          title: title,
          body: message,
          payload: 'notification_$requestId',
        );
      }
    } catch (e) {
      print('❌ Error showing notification: $e');
    }
  }

  /// Clear all pending notifications from backend cache
  /// Call this if you want to manually clear the backend notification cache
  Future<void> clearAllPendingNotifications() async {
    try {
      final token = await _storage.readAccess();
      if (token == null) return;

      await _dio.post(
        '${Endpoints.baseUrl}${Endpoints.clearNotifications}',
        data: {}, // Empty data clears all notifications
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
            'Content-Type': 'application/json',
          },
        ),
      );

      print('✓ Cleared all pending notifications from backend cache');
    } catch (e) {
      print('❌ Error clearing notifications: $e');
    }
  }

  /// Reset shown notifications (call on app restart)
  void resetShownNotifications() {
    _shownNotificationIds.clear();
    print('🔄 Reset shown notifications');
  }

  /// Dispose the service
  void dispose() {
    stopPolling();
    _shownNotificationIds.clear();
  }
}

