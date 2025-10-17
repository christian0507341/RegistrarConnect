import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/repositories/notification_repository.dart';
import 'notification_event.dart';
import 'notification_state.dart';
import '../../domain/entities/notification_item.dart'; // Added import
import 'package:flutter/material.dart';
import '../../../../core/services/notification_manager.dart';

class NotificationBloc extends Bloc<NotificationEvent, NotificationState> {
  final INotificationRepository repository;
  final NotificationManager _notificationManager = NotificationManager();

  NotificationBloc({required this.repository}) : super(NotificationInitial()) {
    on<LoadNotifications>((event, emit) async {
      emit(NotificationLoading());
      try {
        final notifications = await repository.getNotifications();
        emit(NotificationLoaded(notifications));
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
  }
}
