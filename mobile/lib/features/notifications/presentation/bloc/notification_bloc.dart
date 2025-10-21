import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/repositories/notification_repository.dart';
import 'notification_event.dart';
import 'notification_state.dart';
import '../../domain/entities/notification_item.dart'; // Added import
import 'package:flutter/material.dart';
import '../../../../core/services/notification_manager.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'dart:convert';

class NotificationBloc extends Bloc<NotificationEvent, NotificationState> {
  final INotificationRepository repository;
  final NotificationManager _notificationManager = NotificationManager();
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  static const String _deletedNotificationsKey = 'deleted_notification_ids';

  NotificationBloc({required this.repository}) : super(NotificationInitial()) {
    on<LoadNotifications>((event, emit) async {
      // Only show loading screen on initial load, not on refresh
      if (event.showLoading) {
        emit(NotificationLoading());
      }
      
      try {
        final notifications = await repository.getNotifications();
        
        // Filter out deleted notifications
        final deletedIds = await _getDeletedNotificationIds();
        final filteredNotifications = notifications
            .where((notification) => !deletedIds.contains(notification.id))
            .toList();
        
        emit(NotificationLoaded(filteredNotifications));
      } catch (e) {
        emit(NotificationError(e.toString()));
      }
    });

    on<AppointmentScheduled>((event, emit) async {
      emit(NotificationLoading());
      try {
        final notifications = await repository.getNotifications();
        final newNotification = NotificationItem(
          title: 'New Appointment Scheduled',
          message:
              'Your ${event.appointment.documentType} is ready to claim on '
              '${event.appointment.schedule.toString().substring(0, 16)} with ${event.appointment.facultyName}.',
          time: 'Just now',
          icon: Icons.event_available,
          color: Colors.green,
        );
        
        // Show local notification
        await _notificationManager.showAppointmentScheduled(
          documentType: event.appointment.documentType,
          facultyName: event.appointment.facultyName,
          schedule: event.appointment.schedule,
          appointmentId: event.appointment.id,
        );
        
        emit(NotificationLoaded([...notifications, newNotification]));
      } catch (e) {
        emit(NotificationError(e.toString()));
      }
    });

    // Handle document status notification
    on<ShowDocumentStatusNotification>((event, emit) async {
      await _notificationManager.showDocumentStatusChange(
        documentType: event.documentType,
        oldStatus: event.oldStatus,
        newStatus: event.newStatus,
        requestId: event.requestId,
      );
    });

    // Handle payment notification
    on<ShowPaymentNotification>((event, emit) async {
      await _notificationManager.showPaymentStatus(
        documentType: event.documentType,
        isApproved: event.isApproved,
        requestId: event.requestId,
      );
    });

    // Handle receipt notification
    on<ShowReceiptNotification>((event, emit) async {
      await _notificationManager.showReceiptUploaded(
        documentType: event.documentType,
        requestId: event.requestId,
      );
    });

    // Handle system announcement
    on<ShowSystemAnnouncement>((event, emit) async {
      await _notificationManager.showSystemAnnouncement(
        title: event.title,
        message: event.message,
        announcementId: event.announcementId,
      );
    });

    // Handle custom notification
    on<ShowCustomNotification>((event, emit) async {
      await _notificationManager.showCustomNotification(
        id: event.id,
        title: event.title,
        body: event.body,
        payload: event.payload,
      );
    });

    // Handle claimed notification
    on<ShowClaimedNotification>((event, emit) async {
      await _notificationManager.showClaimedNotification(
        documentType: event.documentType,
        requestId: event.requestId,
        studentName: event.studentName,
      );
    });

    // Handle delete notification
    on<DeleteNotification>((event, emit) async {
      try {
        if (state is NotificationLoaded) {
          final currentNotifications = (state as NotificationLoaded).notifications;
          final updatedNotifications = currentNotifications
              .where((notification) => notification.id != event.notificationId)
              .toList();
          
          // Save deleted notification ID
          await _saveDeletedNotificationId(event.notificationId);
          
          // Cancel the local notification if it exists
          try {
            final notificationId = int.tryParse(event.notificationId.replaceAll(RegExp(r'[^0-9]'), ''));
            if (notificationId != null) {
              await _notificationManager.cancelNotification(notificationId);
            }
          } catch (e) {
            // Ignore error if notification ID is not a number
          }
          
          emit(NotificationLoaded(updatedNotifications));
        }
      } catch (e) {
        emit(NotificationError('Failed to delete notification: ${e.toString()}'));
      }
    });
  }

  // Helper methods for managing deleted notification IDs
  Future<Set<String>> _getDeletedNotificationIds() async {
    try {
      final deletedIdsJson = await _storage.read(key: _deletedNotificationsKey);
      if (deletedIdsJson == null || deletedIdsJson.isEmpty) {
        return {};
      }
      final List<dynamic> deletedIdsList = jsonDecode(deletedIdsJson);
      return deletedIdsList.map((id) => id.toString()).toSet();
    } catch (e) {
      return {};
    }
  }

  Future<void> _saveDeletedNotificationId(String notificationId) async {
    try {
      final deletedIds = await _getDeletedNotificationIds();
      deletedIds.add(notificationId);
      final deletedIdsJson = jsonEncode(deletedIds.toList());
      await _storage.write(key: _deletedNotificationsKey, value: deletedIdsJson);
    } catch (e) {
      // Ignore error, deletion will still work for current session
    }
  }
}
