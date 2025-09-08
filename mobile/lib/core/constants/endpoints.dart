/// Centralized API paths so the whole app uses the same strings.
/// NOTE: when testing on Android emulator use 'http://10.0.2.2:8000' instead
/// of 'http://127.0.0.1:8000'. For iOS Simulator use 'http://127.0.0.1:8000'.
class Endpoints {
  static const String baseUrl = 'http://127.0.0.1:8000';

  // Auth
  static const String token =
      '/api/token/'; // POST {role,email,password} -> {access,refresh,...}
  static const String tokenRefresh =
      '/api/token/refresh/'; // POST {refresh} -> {access}
  static const String register =
      '/api/auth/register/'; // POST registration payload
  // Chatbot
  static const String chat =
      '/api/chat/'; // POST message, GET history (if you expose it)
  static const String chatMessages =
      '/api/chat/messages/'; // optional, if you split endpoints

  // Receipt uploads (attach to request)
  static const String receipts =
      '/api/receipts/'; // POST multipart: {request_id, image}

  // Feature roots (add endpoints for the rest as you build them)
  static const String documentRequests = '/api/document-requests/';
  static const String appointments = '/api/appointments/';
}
