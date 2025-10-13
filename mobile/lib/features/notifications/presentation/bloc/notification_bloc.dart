import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/repositories/notification_repository.dart';
import 'notification_event.dart';
import 'notification_state.dart';
import '../../domain/entities/notification_item.dart'; // Added import
import 'package:flutter/material.dart';

class NotificationBloc extends Bloc<NotificationEvent, NotificationState> {
  final INotificationRepository repository;

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
        emit(NotificationLoaded([...notifications, newNotification]));
      } catch (e) {
        emit(NotificationError(e.toString()));
      }
    });
  }
}
