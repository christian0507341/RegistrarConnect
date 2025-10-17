import '../../domain/entities/notification_item.dart';
import '../../domain/repositories/notification_repository.dart';
import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'package:mobile/core/services/notification_service.dart';

class NotificationRepositoryImpl implements INotificationRepository {
  final Dio _dio;
  final NotificationService _notificationService;

  NotificationRepositoryImpl({
    required Dio dio,
    required NotificationService notificationService,
  }) : _dio = dio, _notificationService = notificationService;

  @override
  Future<List<NotificationItem>> getNotifications() async {
    try {
      // Try to fetch from API first
      final response = await _dio.get('/notifications/');
      final List<dynamic> data = response.data;
      
      return data.map((json) => NotificationItem.fromJson(json)).toList();
    } catch (e) {
      // Fallback to mock data if API fails
      debugPrint('Failed to fetch notifications from API: $e');
      return _getMockNotifications();
    }
  }

  @override
  Future<void> markAsRead(String notificationId) async {
    try {
      await _dio.patch('/notifications/$notificationId/mark-read/');
    } catch (e) {
      debugPrint('Failed to mark notification as read: $e');
    }
  }

  @override
  Future<void> sendLocalNotification({
    required String title,
    required String body,
    String? payload,
  }) async {
    await _notificationService.showNotification(
      id: DateTime.now().millisecondsSinceEpoch ~/ 1000,
      title: title,
      body: body,
      payload: payload,
    );
  }

  @override
  Future<void> scheduleNotification({
    required String title,
    required String body,
    required DateTime scheduledDate,
    String? payload,
  }) async {
    await _notificationService.scheduleNotification(
      id: DateTime.now().millisecondsSinceEpoch ~/ 1000,
      title: title,
      body: body,
      scheduledDate: scheduledDate,
      payload: payload,
    );
  }

  List<NotificationItem> _getMockNotifications() {
    return [];
  }
}
