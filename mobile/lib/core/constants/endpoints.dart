import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;

/// Centralized API paths
class Endpoints {
  /// Base URL per platform
  static final String baseUrl = kIsWeb
      ? 'http://10.0.2.2:8000'
      : Platform.isAndroid
      ? 'http://10.0.2.2:8000' // Android emulator -> host machine
      : 'http://127.0.0.1:8000'; // iOS simulator / desktop

  // --- Auth ---
  static const String token = '/api/token/';
  static const String tokenRefresh = '/api/token/refresh/';
  static const String register = '/api/auth/register/';

  // --- Chatbot (lives under /api/ai/) ---
  static const String chat = '/api/ai/chat/';

  /// Leave empty so the app falls back to [chat] for history.
  static const String chatMessages = '';

  // --- Other features (if any) ---
  static const String receipts = '/api/receipts/';
  static const String documentRequests = '/api/document-requests/';
  static const String appointments = '/api/appointments/';
}
