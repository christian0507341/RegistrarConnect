import 'package:mobile/features/auth/presentation/bloc/auth_state.dart';
import 'package:mobile/core/services/notification_polling_service.dart';
import 'dart:developer' as developer;

/// Service that manages notification polling based on authentication state
class NotificationAuthService {
  static final NotificationAuthService _instance = NotificationAuthService._internal();
  factory NotificationAuthService() => _instance;
  NotificationAuthService._internal();

  final NotificationPollingService _pollingService = NotificationPollingService();
  bool _isInitialized = false;

  /// Initialize the service
  Future<void> initialize() async {
    if (_isInitialized) return;
    
    await _pollingService.initialize();
    _isInitialized = true;
    developer.log('🔔 NotificationAuthService initialized', name: 'NotificationAuth');
  }

  /// Start notification polling for authenticated users
  void startPollingForAuthenticatedUser() {
    if (!_isInitialized) {
      developer.log('⚠️ NotificationAuthService not initialized', name: 'NotificationAuth');
      return;
    }

    developer.log('🔔 Starting notification polling for authenticated user', name: 'NotificationAuth');
    _pollingService.startPolling(interval: const Duration(seconds: 30));
  }

  /// Stop notification polling (when user logs out)
  void stopPolling() {
    developer.log('🔔 Stopping notification polling', name: 'NotificationAuth');
    _pollingService.stopPolling();
  }

  /// Reset shown notifications (when user logs in)
  void resetShownNotifications() {
    developer.log('🔔 Resetting shown notifications', name: 'NotificationAuth');
    _pollingService.resetShownNotifications();
  }

  /// Handle authentication state changes
  void handleAuthStateChange(AuthState state) {
    if (state is AuthAuthenticated) {
      // User is authenticated, start polling and reset notifications
      resetShownNotifications();
      startPollingForAuthenticatedUser();
    } else if (state is AuthUnauthenticated) {
      // User is not authenticated, stop polling
      stopPolling();
    }
    // For other states (loading, error), we don't change polling state
  }

  /// Dispose the service
  void dispose() {
    stopPolling();
    _pollingService.dispose();
    _isInitialized = false;
  }
}
