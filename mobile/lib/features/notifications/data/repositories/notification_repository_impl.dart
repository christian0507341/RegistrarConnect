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
      // Get access token for authentication
      final token = await _secureStorage.readAccess();
      if (token == null || token.isEmpty) {
        print('No access token available for notifications');
        return [];
      }

      // Fetch both regular notifications and pending approval notifications with proper authentication
      final results = await Future.wait([
        _dio.get(
          '${Endpoints.baseUrl}${Endpoints.studentNotifications}',
          options: Options(
            headers: {
              'Authorization': 'Bearer $token',
              'Content-Type': 'application/json',
            },
          ),
        ),
        _dio.get(
          '${Endpoints.baseUrl}${Endpoints.pendingNotifications}',
          options: Options(
            headers: {
              'Authorization': 'Bearer $token',
              'Content-Type': 'application/json',
            },
          ),
        ),
      ]);

      final regularResponse = results[0];
      final pendingResponse = results[1];
      
      final allNotifications = <NotificationItem>[];

      // Process regular notifications (from document request actions)
      if (regularResponse.statusCode == 200) {
        final data = regularResponse.data;
        final notificationsData = List<Map<String, dynamic>>.from(data['notifications'] ?? []);
        
        print('📬 Regular notifications found: ${notificationsData.length}');
        
        final regularNotifications = notificationsData.map((notificationData) {
          return NotificationItem(
            id: notificationData['id']?.toString() ?? DateTime.now().millisecondsSinceEpoch.toString(),
            title: notificationData['title'] ?? 'Notification',
            message: notificationData['message'] ?? '',
            time: notificationData['time'] ?? 'Just now',
            icon: _getIconFromString(notificationData['icon'] ?? 'info'),
            color: _getColorFromString(notificationData['color'] ?? 'blue'),
          );
        }).toList();
        
        allNotifications.addAll(regularNotifications);
      } else {
        print('❌ Regular notifications request failed: ${regularResponse.statusCode}');
      }

      // Process pending approval notifications (from cache)
      if (pendingResponse.statusCode == 200) {
        final data = pendingResponse.data;
        final pendingData = List<Map<String, dynamic>>.from(data['notifications'] ?? []);
        
        print('📬 Pending notifications found: ${pendingData.length}');
        
        final pendingNotifications = pendingData.map((notificationData) {
          final type = notificationData['type'] ?? '';
          return NotificationItem(
            id: notificationData['id']?.toString() ?? DateTime.now().millisecondsSinceEpoch.toString(),
            title: notificationData['title'] ?? 'Notification',
            message: notificationData['message'] ?? '',
            time: _getTimeFromTimestamp(notificationData['timestamp']),
            icon: type == 'payment_approved' ? Icons.payment : 
                  type == 'document_approved' ? Icons.description : Icons.notifications,
            color: type == 'payment_approved' || type == 'document_approved' ? Colors.green : Colors.blue,
          );
        }).toList();
        
        allNotifications.addAll(pendingNotifications);
      } else {
        print('❌ Pending notifications request failed: ${pendingResponse.statusCode}');
      }

      // Sort by time (most recent first)
      // Note: This is a simple implementation, you might want to parse timestamps for accurate sorting
      return allNotifications;
      
    } catch (e) {
      print('Error fetching notifications: $e');
      // Return empty list on error to prevent app crash
      return [];
    }
  }
  
  String _getTimeFromTimestamp(dynamic timestamp) {
    if (timestamp == null) return 'Just now';
    try {
      final dateTime = DateTime.parse(timestamp.toString());
      final now = DateTime.now();
      final difference = now.difference(dateTime);
      
      if (difference.inSeconds < 60) {
        return 'Just now';
      } else if (difference.inMinutes < 60) {
        return '${difference.inMinutes}m ago';
      } else if (difference.inHours < 24) {
        return '${difference.inHours}h ago';
      } else {
        return '${difference.inDays}d ago';
      }
    } catch (e) {
      return 'Just now';
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
