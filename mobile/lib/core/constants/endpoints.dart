/// Centralized API paths so the whole app uses the same strings.
/// NOTE: when testing on Android emulator use 'http://10.0.2.2:8000' instead
/// of 'http://127.0.0.1:8000'. For iOS Simulator use 'http://127.0.0.1:8000'.
class Endpoints {
  // Base URL (switch between iOS/Android simulator manually as needed)
  static const String baseUrl = 'http://127.0.0.1:8000';

  // ─── Auth ────────────────────────────────────────────────────────────────
  static const String token =
      '/api/token/'; // POST {role,email,password} -> {access,refresh,...}
  static const String tokenRefresh =
      '/api/token/refresh/'; // POST {refresh} -> {access}
  static const String register =
      '/api/auth/register/'; // POST registration payload

  // ─── Chatbot ─────────────────────────────────────────────────────────────
  /// Single-endpoint style: send message OR fetch history depending on method
  static const String chat = '/api/chat/';

  /// Split-endpoint style (if backend exposes it). Leave as empty string ""
  /// if you don’t use it, so ChatApi will fallback to [chat].
  static const String chatMessages = '/api/chat/messages/';

  // ─── Receipt uploads ─────────────────────────────────────────────────────
  static const String receipts =
      '/api/receipts/'; // POST multipart: {request_id, image}

  // ─── Feature roots ───────────────────────────────────────────────────────
  static const String documentRequests = '/api/document-requests/';
  static const String appointments = '/api/appointments/';
}
