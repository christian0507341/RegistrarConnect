import 'package:dio/dio.dart';
import 'package:mobile/core/constants/endpoints.dart';
import 'package:mobile/core/services/dio_client.dart';
import 'package:mobile/core/services/secure_storage.dart';
import 'package:mobile/features/chat/data/models/chat_dtos.dart';

class ChatApi {
  ChatApi({Dio? dio}) : _dio = dio ?? DioClient(SecureStorageService()).dio;

  final Dio _dio;

  String get _sendUrl => Endpoints.chat;

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

    // Loading chat history for conversation

    final resp = await _dio.get(_historyUrl, queryParameters: qp);

    // Response received

    final raw = resp.data;
    List<dynamic> list;

    if (raw is List) {
      list = raw;
    } else if (raw is Map<String, dynamic>) {
      // Handle common shapes: { messages: [...] } or { results: [...] }
      if (raw['messages'] is List) {
        list = raw['messages'] as List<dynamic>;
      } else if (raw['results'] is List) {
        list = raw['results'] as List<dynamic>;
      } else {
        list = const [];
      }
    } else {
      list = const [];
    }

    return list
        .map((e) => ChatMessageDto.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<List<Map<String, dynamic>>> getChatHistory() async {
    final resp = await _dio.get(Endpoints.chatHistory);
    final raw = resp.data;
    
    if (raw is List) {
      return raw.cast<Map<String, dynamic>>();
    }
    return [];
  }

  Future<void> deleteChatHistory(String conversationId) async {
    await _dio.delete('${Endpoints.chatHistory}$conversationId/');
  }
}
