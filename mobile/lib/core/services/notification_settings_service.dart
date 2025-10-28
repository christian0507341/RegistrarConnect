import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class NotificationSettingsService {
  static final NotificationSettingsService _instance = NotificationSettingsService._internal();
  factory NotificationSettingsService() => _instance;
  NotificationSettingsService._internal();

  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  
  // Storage keys
  static const String _notificationsEnabledKey = 'notifications_enabled';
  static const String _documentStatusKey = 'document_status_notifications';
  static const String _appointmentKey = 'appointment_notifications';
  static const String _paymentKey = 'payment_notifications';
  static const String _receiptKey = 'receipt_notifications';
  static const String _systemKey = 'system_notifications';
  static const String _soundEnabledKey = 'notification_sound_enabled';
  static const String _vibrationEnabledKey = 'notification_vibration_enabled';

  // Default settings
  static const bool _defaultNotificationsEnabled = true;
  static const bool _defaultDocumentStatus = true;
  static const bool _defaultAppointment = true;
  static const bool _defaultPayment = true;
  static const bool _defaultReceipt = true;
  static const bool _defaultSystem = true;
  static const bool _defaultSound = true;
  static const bool _defaultVibration = true;

  // Get all notification settings
  Future<NotificationSettings> getSettings() async {
    return NotificationSettings(
      notificationsEnabled: await _getBoolValue(_notificationsEnabledKey, _defaultNotificationsEnabled),
      documentStatusNotifications: await _getBoolValue(_documentStatusKey, _defaultDocumentStatus),
      appointmentNotifications: await _getBoolValue(_appointmentKey, _defaultAppointment),
      paymentNotifications: await _getBoolValue(_paymentKey, _defaultPayment),
      receiptNotifications: await _getBoolValue(_receiptKey, _defaultReceipt),
      systemNotifications: await _getBoolValue(_systemKey, _defaultSystem),
      soundEnabled: await _getBoolValue(_soundEnabledKey, _defaultSound),
      vibrationEnabled: await _getBoolValue(_vibrationEnabledKey, _defaultVibration),
    );
  }

  // Update notification settings
  Future<void> updateSettings(NotificationSettings settings) async {
    await _setBoolValue(_notificationsEnabledKey, settings.notificationsEnabled);
    await _setBoolValue(_documentStatusKey, settings.documentStatusNotifications);
    await _setBoolValue(_appointmentKey, settings.appointmentNotifications);
    await _setBoolValue(_paymentKey, settings.paymentNotifications);
    await _setBoolValue(_receiptKey, settings.receiptNotifications);
    await _setBoolValue(_systemKey, settings.systemNotifications);
    await _setBoolValue(_soundEnabledKey, settings.soundEnabled);
    await _setBoolValue(_vibrationEnabledKey, settings.vibrationEnabled);
  }

  // Toggle main notifications
  Future<void> toggleNotifications(bool enabled) async {
    await _setBoolValue(_notificationsEnabledKey, enabled);
  }

  // Toggle specific notification types
  Future<void> toggleDocumentStatusNotifications(bool enabled) async {
    await _setBoolValue(_documentStatusKey, enabled);
  }

  Future<void> toggleAppointmentNotifications(bool enabled) async {
    await _setBoolValue(_appointmentKey, enabled);
  }

  Future<void> togglePaymentNotifications(bool enabled) async {
    await _setBoolValue(_paymentKey, enabled);
  }

  Future<void> toggleReceiptNotifications(bool enabled) async {
    await _setBoolValue(_receiptKey, enabled);
  }

  Future<void> toggleSystemNotifications(bool enabled) async {
    await _setBoolValue(_systemKey, enabled);
  }

  Future<void> toggleSound(bool enabled) async {
    await _setBoolValue(_soundEnabledKey, enabled);
  }

  Future<void> toggleVibration(bool enabled) async {
    await _setBoolValue(_vibrationEnabledKey, enabled);
  }

  // Check if notifications are enabled
  Future<bool> areNotificationsEnabled() async {
    return await _getBoolValue(_notificationsEnabledKey, _defaultNotificationsEnabled);
  }

  // Check if specific notification type is enabled
  Future<bool> isDocumentStatusEnabled() async {
    final mainEnabled = await areNotificationsEnabled();
    final typeEnabled = await _getBoolValue(_documentStatusKey, _defaultDocumentStatus);
    return mainEnabled && typeEnabled;
  }

  Future<bool> isAppointmentEnabled() async {
    final mainEnabled = await areNotificationsEnabled();
    final typeEnabled = await _getBoolValue(_appointmentKey, _defaultAppointment);
    return mainEnabled && typeEnabled;
  }

  Future<bool> isPaymentEnabled() async {
    final mainEnabled = await areNotificationsEnabled();
    final typeEnabled = await _getBoolValue(_paymentKey, _defaultPayment);
    return mainEnabled && typeEnabled;
  }

  Future<bool> isReceiptEnabled() async {
    final mainEnabled = await areNotificationsEnabled();
    final typeEnabled = await _getBoolValue(_receiptKey, _defaultReceipt);
    return mainEnabled && typeEnabled;
  }

  Future<bool> isSystemEnabled() async {
    final mainEnabled = await areNotificationsEnabled();
    final typeEnabled = await _getBoolValue(_systemKey, _defaultSystem);
    return mainEnabled && typeEnabled;
  }

  // Helper methods
  Future<bool> _getBoolValue(String key, bool defaultValue) async {
    final value = await _storage.read(key: key);
    if (value == null) return defaultValue;
    return value.toLowerCase() == 'true';
  }

  Future<void> _setBoolValue(String key, bool value) async {
    await _storage.write(key: key, value: value.toString());
  }

  // Reset to default settings
  Future<void> resetToDefaults() async {
    await _storage.delete(key: _notificationsEnabledKey);
    await _storage.delete(key: _documentStatusKey);
    await _storage.delete(key: _appointmentKey);
    await _storage.delete(key: _paymentKey);
    await _storage.delete(key: _receiptKey);
    await _storage.delete(key: _systemKey);
    await _storage.delete(key: _soundEnabledKey);
    await _storage.delete(key: _vibrationEnabledKey);
  }
}

class NotificationSettings {
  final bool notificationsEnabled;
  final bool documentStatusNotifications;
  final bool appointmentNotifications;
  final bool paymentNotifications;
  final bool receiptNotifications;
  final bool systemNotifications;
  final bool soundEnabled;
  final bool vibrationEnabled;

  NotificationSettings({
    required this.notificationsEnabled,
    required this.documentStatusNotifications,
    required this.appointmentNotifications,
    required this.paymentNotifications,
    required this.receiptNotifications,
    required this.systemNotifications,
    required this.soundEnabled,
    required this.vibrationEnabled,
  });

  NotificationSettings copyWith({
    bool? notificationsEnabled,
    bool? documentStatusNotifications,
    bool? appointmentNotifications,
    bool? paymentNotifications,
    bool? receiptNotifications,
    bool? systemNotifications,
    bool? soundEnabled,
    bool? vibrationEnabled,
  }) {
    return NotificationSettings(
      notificationsEnabled: notificationsEnabled ?? this.notificationsEnabled,
      documentStatusNotifications: documentStatusNotifications ?? this.documentStatusNotifications,
      appointmentNotifications: appointmentNotifications ?? this.appointmentNotifications,
      paymentNotifications: paymentNotifications ?? this.paymentNotifications,
      receiptNotifications: receiptNotifications ?? this.receiptNotifications,
      systemNotifications: systemNotifications ?? this.systemNotifications,
      soundEnabled: soundEnabled ?? this.soundEnabled,
      vibrationEnabled: vibrationEnabled ?? this.vibrationEnabled,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is NotificationSettings &&
        other.notificationsEnabled == notificationsEnabled &&
        other.documentStatusNotifications == documentStatusNotifications &&
        other.appointmentNotifications == appointmentNotifications &&
        other.paymentNotifications == paymentNotifications &&
        other.receiptNotifications == receiptNotifications &&
        other.systemNotifications == systemNotifications &&
        other.soundEnabled == soundEnabled &&
        other.vibrationEnabled == vibrationEnabled;
  }

  @override
  int get hashCode {
    return Object.hash(
      notificationsEnabled,
      documentStatusNotifications,
      appointmentNotifications,
      paymentNotifications,
      receiptNotifications,
      systemNotifications,
      soundEnabled,
      vibrationEnabled,
    );
  }
}

