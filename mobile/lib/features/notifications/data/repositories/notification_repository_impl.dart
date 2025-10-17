import '../../domain/entities/notification_item.dart';
import '../../domain/repositories/notification_repository.dart';
import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import '../../../../core/constants/endpoints.dart';
import '../../../../core/services/secure_storage.dart';
import '../../../../core/services/dio_client.dart';

class NotificationRepositoryImpl implements INotificationRepository {
  final SecureStorageService _secureStorage;
  late final Dio _dio;

  NotificationRepositoryImpl({required SecureStorageService secureStorage}) 
      : _secureStorage = secureStorage {
    final dioClient = DioClient(_secureStorage);
    _dio = dioClient.dio;
  }

  @override
  Future<List<NotificationItem>> getNotifications() async {
    try {
      final response = await _dio.get(
        '${Endpoints.baseUrl}${Endpoints.studentNotifications}',
        options: Options(
          headers: {
            'Content-Type': 'application/json',
          },
        ),
      );

      if (response.statusCode == 200) {
        final data = response.data;
        final notificationsData = List<Map<String, dynamic>>.from(data['notifications'] ?? []);
        
        return notificationsData.map((notificationData) {
          return NotificationItem(
            title: notificationData['title'] ?? 'Notification',
            message: notificationData['message'] ?? '',
            time: notificationData['time'] ?? 'Just now',
            icon: _getIconFromString(notificationData['icon'] ?? 'info'),
            color: _getColorFromString(notificationData['color'] ?? 'blue'),
          );
        }).toList();
      } else {
        throw Exception('Failed to load notifications: ${response.statusCode}');
      }
    } catch (e) {
      // Return empty list on error to prevent app crash
      return [];
    }
  }

  IconData _getIconFromString(String iconString) {
    switch (iconString) {
      case 'add_circle':
        return Icons.add_circle;
      case 'send':
        return Icons.send;
      case 'payment':
        return Icons.payment;
      case 'receipt':
        return Icons.receipt;
      case 'upload':
        return Icons.upload;
      case 'update':
        return Icons.update;
      case 'event':
        return Icons.event;
      case 'edit':
        return Icons.edit;
      case 'maintenance':
        return Icons.build;
      default:
        return Icons.info;
    }
  }

  Color _getColorFromString(String colorString) {
    switch (colorString) {
      case 'blue':
        return Colors.blue;
      case 'green':
        return Colors.green;
      case 'orange':
        return Colors.orange;
      case 'purple':
        return Colors.purple;
      case 'red':
        return Colors.red;
      default:
        return Colors.blue;
    }
  }
}
