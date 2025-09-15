import 'package:dio/dio.dart';
import 'package:mobile/core/constants/endpoints.dart';
import 'package:mobile/core/services/dio_client.dart';
import 'package:mobile/core/services/secure_storage.dart'; // <- important
import 'package:mobile/features/chat/data/models/chat_dtos.dart';

class ChatApi {
  /// Prefer the app's shared Dio (with auth/refresh interceptors).
  /// You can override [dio] in tests, or pass a custom [storage] if needed.
  ChatApi({Dio? dio, SecureStorageService? storage})
    : _dio = dio ?? DioClient(storage ?? SecureStorageService()).dio;

  final Dio _dio;

  String get _chatUrl => (Endpoints.chatMessages.isNotEmpty)
      ? Endpoints.chatMessages
      : Endpoints.chat;

  Future<ChatReplyDto> sendMessage({
    required String conversationId,
    required String text,
    Map<String, dynamic>? extra, // optional payload for the model
  }) async {
    final body = <String, dynamic>{
      'conversation_id': conversationId,
      'text': text,
      if (extra != null) ...extra,
    };

    final resp = await _dio.post<Map<String, dynamic>>(_chatUrl, data: body);
    return ChatReplyDto.fromJson(resp.data!);
    // Accepts either { "message": {...}, "action": {...} } or direct message JSON
  }

  Future<List<ChatMessageDto>> loadHistory({
    required String conversationId,
    int? limit,
    String? beforeId,
  }) async {
    final qp = <String, dynamic>{'conversation_id': conversationId};
    if (limit != null) qp['limit'] = limit;
    if (beforeId != null) qp['before_id'] = beforeId;

    final resp = await _dio.get<List<dynamic>>(_chatUrl, queryParameters: qp);
    final data = resp.data ?? const [];
    return data
        .map((e) => ChatMessageDto.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}
