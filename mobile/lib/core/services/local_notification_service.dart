import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter/material.dart';
import 'dart:async';

class LocalNotificationService {
  static final LocalNotificationService _instance = LocalNotificationService._internal();
  factory LocalNotificationService() => _instance;
  LocalNotificationService._internal();

  final FlutterLocalNotificationsPlugin _flutterLocalNotificationsPlugin =
      FlutterLocalNotificationsPlugin();

  // Stream for notification actions
  final StreamController<NotificationResponse> _notificationController = 
      StreamController<NotificationResponse>.broadcast();
  Stream<NotificationResponse> get notificationStream => _notificationController.stream;

  // Initialize the notification service
  Future<void> initialize() async {
    // Android initialization settings
    const AndroidInitializationSettings androidSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    // iOS initialization settings
    const DarwinInitializationSettings iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    const InitializationSettings initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _flutterLocalNotificationsPlugin.initialize(
      initSettings,
      onDidReceiveNotificationResponse: _onNotificationTapped,
    );

    // Request permissions
    await _requestPermissions();
  }

  // Handle notification tap
  void _onNotificationTapped(NotificationResponse response) {
    _notificationController.add(response);
  }

  // Request notification permissions
  Future<void> _requestPermissions() async {
    await _flutterLocalNotificationsPlugin
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.requestNotificationsPermission();

    await _flutterLocalNotificationsPlugin
        .resolvePlatformSpecificImplementation<
            IOSFlutterLocalNotificationsPlugin>()
        ?.requestPermissions(
          alert: true,
          badge: true,
          sound: true,
        );
  }

  // Show a simple notification
  Future<void> showNotification({
    required int id,
    required String title,
    required String body,
    String? payload,
    NotificationDetails? notificationDetails,
  }) async {
    final details = notificationDetails ?? _getDefaultNotificationDetails();
    
    await _flutterLocalNotificationsPlugin.show(
      id,
      title,
      body,
      details,
      payload: payload,
    );
  }

  // Show notification for document request status change
  Future<void> showDocumentStatusNotification({
    required String documentType,
    required String oldStatus,
    required String newStatus,
    required int requestId,
  }) async {
    final title = 'Document Status Updated';
    final body = 'Your $documentType status changed from $oldStatus to $newStatus';
    
    await showNotification(
      id: requestId,
      title: title,
      body: body,
      payload: 'document_request:$requestId',
      notificationDetails: _getDocumentStatusNotificationDetails(),
    );
  }

  // Show notification for appointment scheduled
  Future<void> showAppointmentNotification({
    required String documentType,
    required String facultyName,
    required DateTime schedule,
    required int appointmentId,
  }) async {
    final title = 'Appointment Scheduled';
    final body = 'Your $documentType appointment with $facultyName is scheduled for ${_formatDateTime(schedule)}';
    
    await showNotification(
      id: appointmentId,
      title: title,
      body: body,
      payload: 'appointment:$appointmentId',
      notificationDetails: _getAppointmentNotificationDetails(),
    );
  }

  // Show notification for payment approval
  Future<void> showPaymentNotification({
    required String documentType,
    required bool isApproved,
    required int requestId,
  }) async {
    final title = isApproved ? 'Payment Approved' : 'Payment Pending';
    final body = isApproved 
        ? 'Your payment for $documentType has been approved'
        : 'Your payment for $documentType is still pending review';
    
    await showNotification(
      id: requestId + 1000, // Offset to avoid conflicts
      title: title,
      body: body,
      payload: 'payment:$requestId',
      notificationDetails: _getPaymentNotificationDetails(isApproved),
    );
  }

  // Show notification for receipt upload
  Future<void> showReceiptNotification({
    required String documentType,
    required int requestId,
  }) async {
    final title = 'Receipt Uploaded';
    final body = 'Receipt uploaded for your $documentType request';
    
    await showNotification(
      id: requestId + 2000, // Offset to avoid conflicts
      title: title,
      body: body,
      payload: 'receipt:$requestId',
      notificationDetails: _getReceiptNotificationDetails(),
    );
  }

  // Show system announcement
  Future<void> showSystemAnnouncement({
    required String title,
    required String message,
    required int announcementId,
  }) async {
    await showNotification(
      id: announcementId + 3000, // Offset to avoid conflicts
      title: title,
      body: message,
      payload: 'announcement:$announcementId',
      notificationDetails: _getSystemAnnouncementDetails(),
    );
  }

  // Get default notification details
  NotificationDetails _getDefaultNotificationDetails() {
    return const NotificationDetails(
      android: AndroidNotificationDetails(
        'default_channel',
        'Default Notifications',
        channelDescription: 'Default notification channel',
        importance: Importance.high,
        priority: Priority.high,
        icon: '@mipmap/ic_launcher',
      ),
      iOS: DarwinNotificationDetails(
        presentAlert: true,
        presentBadge: true,
        presentSound: true,
      ),
    );
  }

  // Get document status notification details
  NotificationDetails _getDocumentStatusNotificationDetails() {
    return const NotificationDetails(
      android: AndroidNotificationDetails(
        'document_status_channel',
        'Document Status Updates',
        channelDescription: 'Notifications for document request status changes',
        importance: Importance.high,
        priority: Priority.high,
        icon: '@mipmap/ic_launcher',
        color: Colors.blue,
      ),
      iOS: DarwinNotificationDetails(
        presentAlert: true,
        presentBadge: true,
        presentSound: true,
      ),
    );
  }

  // Get appointment notification details
  NotificationDetails _getAppointmentNotificationDetails() {
    return const NotificationDetails(
      android: AndroidNotificationDetails(
        'appointment_channel',
        'Appointment Notifications',
        channelDescription: 'Notifications for appointment scheduling',
        importance: Importance.high,
        priority: Priority.high,
        icon: '@mipmap/ic_launcher',
        color: Colors.purple,
      ),
      iOS: DarwinNotificationDetails(
        presentAlert: true,
        presentBadge: true,
        presentSound: true,
      ),
    );
  }

  // Get payment notification details
  NotificationDetails _getPaymentNotificationDetails(bool isApproved) {
    return NotificationDetails(
      android: AndroidNotificationDetails(
        'payment_channel',
        'Payment Notifications',
        channelDescription: 'Notifications for payment status',
        importance: Importance.high,
        priority: Priority.high,
        icon: '@mipmap/ic_launcher',
        color: isApproved ? Colors.green : Colors.orange,
      ),
      iOS: DarwinNotificationDetails(
        presentAlert: true,
        presentBadge: true,
        presentSound: true,
      ),
    );
  }

  // Get receipt notification details
  NotificationDetails _getReceiptNotificationDetails() {
    return const NotificationDetails(
      android: AndroidNotificationDetails(
        'receipt_channel',
        'Receipt Notifications',
        channelDescription: 'Notifications for receipt uploads',
        importance: Importance.high,
        priority: Priority.high,
        icon: '@mipmap/ic_launcher',
        color: Colors.blue,
      ),
      iOS: DarwinNotificationDetails(
        presentAlert: true,
        presentBadge: true,
        presentSound: true,
      ),
    );
  }

  // Get system announcement details
  NotificationDetails _getSystemAnnouncementDetails() {
    return const NotificationDetails(
      android: AndroidNotificationDetails(
        'system_announcement_channel',
        'System Announcements',
        channelDescription: 'System-wide announcements and maintenance notices',
        importance: Importance.high,
        priority: Priority.high,
        icon: '@mipmap/ic_launcher',
        color: Colors.orange,
      ),
      iOS: DarwinNotificationDetails(
        presentAlert: true,
        presentBadge: true,
        presentSound: true,
      ),
    );
  }

  // Format datetime for display
  String _formatDateTime(DateTime dateTime) {
    return '${dateTime.day}/${dateTime.month}/${dateTime.year} at ${dateTime.hour.toString().padLeft(2, '0')}:${dateTime.minute.toString().padLeft(2, '0')}';
  }

  // Cancel a specific notification
  Future<void> cancelNotification(int id) async {
    await _flutterLocalNotificationsPlugin.cancel(id);
  }

  // Cancel all notifications
  Future<void> cancelAllNotifications() async {
    await _flutterLocalNotificationsPlugin.cancelAll();
  }

  // Get pending notifications
  Future<List<PendingNotificationRequest>> getPendingNotifications() async {
    return await _flutterLocalNotificationsPlugin.pendingNotificationRequests();
  }

  // Schedule a notification for later
  Future<void> scheduleNotification({
    required int id,
    required String title,
    required String body,
    required DateTime scheduledDate,
    String? payload,
  }) async {
    // For now, we'll use immediate notification instead of scheduling
    // You can implement proper scheduling with timezone support later
    await showNotification(
      id: id,
      title: title,
      body: body,
      payload: payload,
    );
  }

  // Dispose the service
  void dispose() {
    _notificationController.close();
  }
}
