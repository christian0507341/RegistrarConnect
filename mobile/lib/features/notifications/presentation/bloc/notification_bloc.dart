import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/repositories/notification_repository.dart';
import 'notification_event.dart';
import 'notification_state.dart';

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

    on<MarkAsRead>((event, emit) async {
      try {
        await repository.markAsRead(event.notificationId);
        // Reload notifications to reflect the change
        add(LoadNotifications());
      } catch (e) {
        emit(NotificationError(e.toString()));
      }
    });

    on<SendLocalNotification>((event, emit) async {
      try {
        await repository.sendLocalNotification(
          title: event.title,
          body: event.body,
          payload: event.payload,
        );
        emit(NotificationSent());
      } catch (e) {
        emit(NotificationError(e.toString()));
      }
    });

    on<ScheduleNotification>((event, emit) async {
      try {
        await repository.scheduleNotification(
          title: event.title,
          body: event.body,
          scheduledDate: event.scheduledDate,
          payload: event.payload,
        );
        emit(NotificationScheduled());
      } catch (e) {
        emit(NotificationError(e.toString()));
      }
    });
  }
}
