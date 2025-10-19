import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'local_notification_service.dart';
import 'notification_settings_service.dart';
import '../../features/notifications/domain/entities/notification_item.dart';

class NotificationManager {
  static final NotificationManager _instance = NotificationManager._internal();
  factory NotificationManager() => _instance;
  NotificationManager._internal();

  final LocalNotificationService _localNotificationService = LocalNotificationService();
  final NotificationSettingsService _settingsService = NotificationSettingsService();

  // Initialize the notification manager
  Future<void> initialize() async {
    await _localNotificationService.initialize();
  }

  // Show notification for document request status change
  Future<void> showDocumentStatusChange({
    required String documentType,
    required String oldStatus,
    required String newStatus,
    required int requestId,
  }) async {
    // Check if document status notifications are enabled
    final isEnabled = await _settingsService.isDocumentStatusEnabled();
    if (!isEnabled) return;

    await _localNotificationService.showDocumentStatusNotification(
      documentType: documentType,
      oldStatus: oldStatus,
      newStatus: newStatus,
      requestId: requestId,
    );
  }

  // Show notification for appointment scheduled
  Future<void> showAppointmentScheduled({
    required String documentType,
    required String facultyName,
    required DateTime schedule,
    required int appointmentId,
  }) async {
    // Check if appointment notifications are enabled
    final isEnabled = await _settingsService.isAppointmentEnabled();
    if (!isEnabled) return;

    await _localNotificationService.showAppointmentNotification(
      documentType: documentType,
      facultyName: facultyName,
      schedule: schedule,
      appointmentId: appointmentId,
    );
  }

  // Show notification for payment status
  Future<void> showPaymentStatus({
    required String documentType,
    required bool isApproved,
    required int requestId,
  }) async {
    // Check if payment notifications are enabled
    final isEnabled = await _settingsService.isPaymentEnabled();
    if (!isEnabled) return;

    await _localNotificationService.showPaymentNotification(
      documentType: documentType,
      isApproved: isApproved,
      requestId: requestId,
    );
  }

  // Show notification for receipt upload
  Future<void> showReceiptUploaded({
    required String documentType,
    required int requestId,
  }) async {
    // Check if receipt notifications are enabled
    final isEnabled = await _settingsService.isReceiptEnabled();
    if (!isEnabled) return;

    await _localNotificationService.showReceiptNotification(
      documentType: documentType,
      requestId: requestId,
    );
  }

  // Show system announcement
  Future<void> showSystemAnnouncement({
    required String title,
    required String message,
    required int announcementId,
  }) async {
    // Check if system notifications are enabled
    final isEnabled = await _settingsService.isSystemEnabled();
    if (!isEnabled) return;

    await _localNotificationService.showSystemAnnouncement(
      title: title,
      message: message,
      announcementId: announcementId,
    );
  }

  // Show notification from notification item
  Future<void> showNotificationFromItem({
    required NotificationItem notification,
    required int id,
  }) async {
    await _localNotificationService.showNotification(
      id: id,
      title: notification.title,
      body: notification.message,
      payload: 'notification:$id',
    );
  }

  // Show batch notifications for multiple status changes
  Future<void> showBatchNotifications({
    required List<Map<String, dynamic>> statusChanges,
  }) async {
    for (int i = 0; i < statusChanges.length; i++) {
      final change = statusChanges[i];
      await Future.delayed(Duration(milliseconds: 500 * i)); // Stagger notifications
      
      await _localNotificationService.showDocumentStatusNotification(
        documentType: change['document_type'] ?? 'Document',
        oldStatus: change['old_status'] ?? 'Unknown',
        newStatus: change['new_status'] ?? 'Unknown',
        requestId: change['request_id'] ?? i,
      );
    }
  }

  // Show notification with custom details
  Future<void> showCustomNotification({
    required int id,
    required String title,
    required String body,
    String? payload,
    Color? color,
  }) async {
    await _localNotificationService.showNotification(
      id: id,
      title: title,
      body: body,
      payload: payload,
    );
  }

  // Schedule reminder notification
  Future<void> scheduleReminder({
    required int id,
    required String title,
    required String body,
    required DateTime reminderTime,
    String? payload,
  }) async {
    await _localNotificationService.scheduleNotification(
      id: id,
      title: title,
      body: body,
      scheduledDate: reminderTime,
      payload: payload,
    );
  }

  // Cancel specific notification
  Future<void> cancelNotification(int id) async {
    await _localNotificationService.cancelNotification(id);
  }

  // Cancel all notifications
  Future<void> cancelAllNotifications() async {
    await _localNotificationService.cancelAllNotifications();
  }

  // Get notification stream for handling taps
  Stream<NotificationResponse> get notificationStream => 
      _localNotificationService.notificationStream;

  // Handle notification tap
  void handleNotificationTap(NotificationResponse response) {
    final payload = response.payload;
    if (payload != null) {
      _handleNotificationPayload(payload);
    }
  }

  // Handle notification payload
  void _handleNotificationPayload(String payload) {
    final parts = payload.split(':');
    if (parts.length >= 2) {
      final type = parts[0];
      final id = parts[1];

      switch (type) {
        case 'document_request':
          _navigateToDocumentRequest(int.parse(id));
          break;
        case 'appointment':
          _navigateToAppointment(int.parse(id));
          break;
        case 'payment':
          _navigateToPayment(int.parse(id));
          break;
        case 'receipt':
          _navigateToReceipt(int.parse(id));
          break;
        case 'announcement':
          _navigateToAnnouncement(int.parse(id));
          break;
        case 'notification':
          _navigateToNotification(int.parse(id));
          break;
        default:
          _navigateToHome();
      }
    }
  }

  // Navigation handlers (you can customize these based on your app structure)
  void _navigateToDocumentRequest(int requestId) {
    // Navigate to document request details
    // You can use a global navigator key or pass context
  }

  void _navigateToAppointment(int appointmentId) {
    // Navigate to appointment details
  }

  void _navigateToPayment(int requestId) {
    // Navigate to payment details
  }

  void _navigateToReceipt(int requestId) {
    // Navigate to receipt details
  }

  void _navigateToAnnouncement(int announcementId) {
    // Navigate to announcement details
  }

  void _navigateToNotification(int notificationId) {
    // Navigate to notification details
  }

  // Show notification for claimed document
  Future<void> showClaimedNotification({
    required String documentType,
    required int requestId,
    required String studentName,
  }) async {
    // Check if document status notifications are enabled
    final isEnabled = await _settingsService.isDocumentStatusEnabled();
    if (!isEnabled) return;

    final title = '🎉 Document Claimed!';
    final body = 'Your $documentType has been successfully claimed. Thank you!';

    await _localNotificationService.showNotification(
      id: requestId + 10000, // Offset to avoid conflicts
      title: title,
      body: body,
      payload: 'claimed_${requestId}_${documentType}_${studentName}',
    );
  }

  void _navigateToHome() {
    // Navigate to home page
  }

  // Dispose the manager
  void dispose() {
    _localNotificationService.dispose();
  }
}
