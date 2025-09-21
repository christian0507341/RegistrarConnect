import 'package:dio/dio.dart';
import 'package:mobile/core/constants/endpoints.dart';
import 'package:mobile/core/services/dio_client.dart';
import 'package:mobile/core/services/secure_storage.dart';
import 'package:mobile/features/chat/data/models/chat_dtos.dart';

class ChatApi {
  ChatApi({Dio? dio}) : _dio = dio ?? DioClient(SecureStorageService()).dio;

  final Dio _dio;

  // Always send messages to /api/chat/
  String get _sendUrl => Endpoints.chat;

  // Use /api/chat/messages/ only if it exists; else fall back to /api/chat/
  String get _historyUrl => (Endpoints.chatMessages.isNotEmpty)
      ? Endpoints.chatMessages
      : Endpoints.chat;

  Future<ChatReplyDto> sendMessage({
    required String conversationId,
    required String text,
  }) async {
    final body = <String, dynamic>{
      'conversation_id': conversationId,
      'text': text,
    };

    final resp = await _dio.post<Map<String, dynamic>>(_sendUrl, data: body);
    return ChatReplyDto.fromJson(resp.data!);
  }

  Future<List<ChatMessageDto>> loadHistory({
    required String conversationId,
    int? limit,
    String? beforeId,
  }) async {
    final qp = <String, dynamic>{'conversation_id': conversationId};
    if (limit != null) qp['limit'] = limit;
    if (beforeId != null) qp['before_id'] = beforeId;

    final resp = await _dio.get<List<dynamic>>(
      _historyUrl,
      queryParameters: qp,
    );
    final data = resp.data ?? const [];
    return data
        .map((e) => ChatMessageDto.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}
