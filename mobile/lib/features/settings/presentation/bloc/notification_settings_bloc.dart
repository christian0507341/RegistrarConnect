import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../../../../core/services/notification_settings_service.dart';

// Events
abstract class NotificationSettingsEvent extends Equatable {
  const NotificationSettingsEvent();

  @override
  List<Object> get props => [];
}

class LoadNotificationSettings extends NotificationSettingsEvent {}

class ToggleMainNotifications extends NotificationSettingsEvent {
  final bool enabled;
  const ToggleMainNotifications(this.enabled);
  
  @override
  List<Object> get props => [enabled];
}

class ToggleDocumentStatusNotifications extends NotificationSettingsEvent {
  final bool enabled;
  const ToggleDocumentStatusNotifications(this.enabled);
  
  @override
  List<Object> get props => [enabled];
}

class ToggleAppointmentNotifications extends NotificationSettingsEvent {
  final bool enabled;
  const ToggleAppointmentNotifications(this.enabled);
  
  @override
  List<Object> get props => [enabled];
}

class TogglePaymentNotifications extends NotificationSettingsEvent {
  final bool enabled;
  const TogglePaymentNotifications(this.enabled);
  
  @override
  List<Object> get props => [enabled];
}

class ToggleReceiptNotifications extends NotificationSettingsEvent {
  final bool enabled;
  const ToggleReceiptNotifications(this.enabled);
  
  @override
  List<Object> get props => [enabled];
}

class ToggleSystemNotifications extends NotificationSettingsEvent {
  final bool enabled;
  const ToggleSystemNotifications(this.enabled);
  
  @override
  List<Object> get props => [enabled];
}

class ToggleSound extends NotificationSettingsEvent {
  final bool enabled;
  const ToggleSound(this.enabled);
  
  @override
  List<Object> get props => [enabled];
}

class ToggleVibration extends NotificationSettingsEvent {
  final bool enabled;
  const ToggleVibration(this.enabled);
  
  @override
  List<Object> get props => [enabled];
}

class ResetToDefaults extends NotificationSettingsEvent {}

// States
abstract class NotificationSettingsState extends Equatable {
  const NotificationSettingsState();

  @override
  List<Object> get props => [];
}

class NotificationSettingsInitial extends NotificationSettingsState {}

class NotificationSettingsLoading extends NotificationSettingsState {}

class NotificationSettingsLoaded extends NotificationSettingsState {
  final NotificationSettings settings;
  
  const NotificationSettingsLoaded(this.settings);
  
  @override
  List<Object> get props => [settings];
}

class NotificationSettingsError extends NotificationSettingsState {
  final String message;
  
  const NotificationSettingsError(this.message);
  
  @override
  List<Object> get props => [message];
}

// BLoC
class NotificationSettingsBloc extends Bloc<NotificationSettingsEvent, NotificationSettingsState> {
  final NotificationSettingsService _settingsService;

  NotificationSettingsBloc({required NotificationSettingsService settingsService})
      : _settingsService = settingsService,
        super(NotificationSettingsInitial()) {
    
    on<LoadNotificationSettings>(_onLoadSettings);
    on<ToggleMainNotifications>(_onToggleMainNotifications);
    on<ToggleDocumentStatusNotifications>(_onToggleDocumentStatus);
    on<ToggleAppointmentNotifications>(_onToggleAppointment);
    on<TogglePaymentNotifications>(_onTogglePayment);
    on<ToggleReceiptNotifications>(_onToggleReceipt);
    on<ToggleSystemNotifications>(_onToggleSystem);
    on<ToggleSound>(_onToggleSound);
    on<ToggleVibration>(_onToggleVibration);
    on<ResetToDefaults>(_onResetToDefaults);
  }

  Future<void> _onLoadSettings(
    LoadNotificationSettings event,
    Emitter<NotificationSettingsState> emit,
  ) async {
    emit(NotificationSettingsLoading());
    try {
      final settings = await _settingsService.getSettings();
      emit(NotificationSettingsLoaded(settings));
    } catch (e) {
      emit(NotificationSettingsError('Failed to load notification settings: ${e.toString()}'));
    }
  }

  Future<void> _onToggleMainNotifications(
    ToggleMainNotifications event,
    Emitter<NotificationSettingsState> emit,
  ) async {
    try {
      await _settingsService.toggleNotifications(event.enabled);
      final settings = await _settingsService.getSettings();
      emit(NotificationSettingsLoaded(settings));
    } catch (e) {
      emit(NotificationSettingsError('Failed to toggle main notifications: ${e.toString()}'));
    }
  }

  Future<void> _onToggleDocumentStatus(
    ToggleDocumentStatusNotifications event,
    Emitter<NotificationSettingsState> emit,
  ) async {
    try {
      await _settingsService.toggleDocumentStatusNotifications(event.enabled);
      final settings = await _settingsService.getSettings();
      emit(NotificationSettingsLoaded(settings));
    } catch (e) {
      emit(NotificationSettingsError('Failed to toggle document status notifications: ${e.toString()}'));
    }
  }

  Future<void> _onToggleAppointment(
    ToggleAppointmentNotifications event,
    Emitter<NotificationSettingsState> emit,
  ) async {
    try {
      await _settingsService.toggleAppointmentNotifications(event.enabled);
      final settings = await _settingsService.getSettings();
      emit(NotificationSettingsLoaded(settings));
    } catch (e) {
      emit(NotificationSettingsError('Failed to toggle appointment notifications: ${e.toString()}'));
    }
  }

  Future<void> _onTogglePayment(
    TogglePaymentNotifications event,
    Emitter<NotificationSettingsState> emit,
  ) async {
    try {
      await _settingsService.togglePaymentNotifications(event.enabled);
      final settings = await _settingsService.getSettings();
      emit(NotificationSettingsLoaded(settings));
    } catch (e) {
      emit(NotificationSettingsError('Failed to toggle payment notifications: ${e.toString()}'));
    }
  }

  Future<void> _onToggleReceipt(
    ToggleReceiptNotifications event,
    Emitter<NotificationSettingsState> emit,
  ) async {
    try {
      await _settingsService.toggleReceiptNotifications(event.enabled);
      final settings = await _settingsService.getSettings();
      emit(NotificationSettingsLoaded(settings));
    } catch (e) {
      emit(NotificationSettingsError('Failed to toggle receipt notifications: ${e.toString()}'));
    }
  }

  Future<void> _onToggleSystem(
    ToggleSystemNotifications event,
    Emitter<NotificationSettingsState> emit,
  ) async {
    try {
      await _settingsService.toggleSystemNotifications(event.enabled);
      final settings = await _settingsService.getSettings();
      emit(NotificationSettingsLoaded(settings));
    } catch (e) {
      emit(NotificationSettingsError('Failed to toggle system notifications: ${e.toString()}'));
    }
  }

  Future<void> _onToggleSound(
    ToggleSound event,
    Emitter<NotificationSettingsState> emit,
  ) async {
    try {
      await _settingsService.toggleSound(event.enabled);
      final settings = await _settingsService.getSettings();
      emit(NotificationSettingsLoaded(settings));
    } catch (e) {
      emit(NotificationSettingsError('Failed to toggle sound: ${e.toString()}'));
    }
  }

  Future<void> _onToggleVibration(
    ToggleVibration event,
    Emitter<NotificationSettingsState> emit,
  ) async {
    try {
      await _settingsService.toggleVibration(event.enabled);
      final settings = await _settingsService.getSettings();
      emit(NotificationSettingsLoaded(settings));
    } catch (e) {
      emit(NotificationSettingsError('Failed to toggle vibration: ${e.toString()}'));
    }
  }

  Future<void> _onResetToDefaults(
    ResetToDefaults event,
    Emitter<NotificationSettingsState> emit,
  ) async {
    try {
      await _settingsService.resetToDefaults();
      final settings = await _settingsService.getSettings();
      emit(NotificationSettingsLoaded(settings));
    } catch (e) {
      emit(NotificationSettingsError('Failed to reset settings: ${e.toString()}'));
    }
  }
}

