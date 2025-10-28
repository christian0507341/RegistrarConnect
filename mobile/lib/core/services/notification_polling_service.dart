import 'dart:async';
import 'dart:developer' as developer;
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
  void startPolling({Duration interval = const Duration(seconds: 30)}) {
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
    
    developer.log('📡 Notification polling started (every ${interval.inSeconds}s)', name: 'NotificationPolling');
  }

  /// Stop polling for notifications
  void stopPolling() {
    _pollingTimer?.cancel();
    _pollingTimer = null;
    _isPolling = false;
    developer.log('📡 Notification polling stopped', name: 'NotificationPolling');
  }

  /// Manually check for new notifications
  Future<void> _checkForNotifications() async {
    try {
      final token = await _storage.readAccess();
      if (token == null || token.isEmpty) {
        developer.log('⚠️ No access token, skipping notification check', name: 'NotificationPolling');
        return;
      }

      developer.log('🔍 Checking for pending notifications...', name: 'NotificationPolling');

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

        developer.log('📬 Found $count pending notifications', name: 'NotificationPolling');

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
            developer.log('🆕 ${newNotifications.length} new notifications to show', name: 'NotificationPolling');
            
            // Show local notifications
            for (final notification in newNotifications) {
              await _showLocalNotification(notification);
            }

            // Mark as shown locally to prevent duplicate local notifications
            _shownNotificationIds.addAll(notificationIdsToShow);

            // DON'T clear from backend cache - let notification page fetch them
            // The notifications will persist in cache and notification page
            developer.log('✓ Notifications shown in status bar, also available in notification page', name: 'NotificationPolling');
          } else {
            developer.log('✓ All pending notifications already shown', name: 'NotificationPolling');
          }
        }
      }
    } catch (e) {
      developer.log('❌ Error checking for notifications: $e', name: 'NotificationPolling', error: e);
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

      developer.log('🔔 Showing notification: $title', name: 'NotificationPolling');

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
      developer.log('❌ Error showing notification: $e', name: 'NotificationPolling', error: e);
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

      developer.log('✓ Cleared all pending notifications from backend cache', name: 'NotificationPolling');
    } catch (e) {
      developer.log('❌ Error clearing notifications: $e', name: 'NotificationPolling', error: e);
    }
  }

  /// Reset shown notifications (call on app restart)
  void resetShownNotifications() {
    _shownNotificationIds.clear();
    developer.log('🔄 Reset shown notifications', name: 'NotificationPolling');
  }

  /// Dispose the service
  void dispose() {
    stopPolling();
    _shownNotificationIds.clear();
  }
}

