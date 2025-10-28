import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;

class Endpoints {
  static final String baseUrl = kIsWeb
      ? 'http://localhost:8000'
      : Platform.isAndroid
      ? 'http://192.168.1.8:8000' // Your computer's IP for physical device
      : 'http://127.0.0.1:8000';

  // Auth
  static const String token = '/api/token/';
  static const String tokenRefresh = '/api/token/refresh/';
  static const String register = '/api/auth/register/';
  static const String me = '/api/accounts/me/';

  // Chat
  static const String chat = '/api/ai/chat/';
  static const String chatMessages = '/api/ai/chat/messages/';
  static const String chatHistory = '/api/ai/chat/history/';

  // Other
  static const String receipts =
      '/api/document-requests/'; // Receipt upload is part of document requests
  static const String documentRequests = '/api/document-requests/';
  static const String studentTransactions =
      '/api/document-requests/student/transactions/';
  static const String studentNotifications =
      '/api/document-requests/student/notifications/';
  static const String pendingNotifications =
      '/api/document-requests/student/pending-notifications/';
  static const String clearNotifications =
      '/api/document-requests/student/clear-notifications/';
  static const String appointments = '/api/appointments/';
}
