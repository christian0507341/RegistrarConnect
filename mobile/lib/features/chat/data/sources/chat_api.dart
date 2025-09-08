import 'package:dio/dio.dart';
import 'package:mobile/core/constants/endpoints.dart';
import 'package:mobile/features/chat/data/models/chat_dtos.dart';

class ChatApi {
  ChatApi(this._dio);
  final Dio _dio;

  Future<ChatReplyDto> sendMessage({
    required String conversationId,
    required String text,
  }) async {
    final resp = await _dio.post<Map<String, dynamic>>(
      Endpoints.chat,
      data: {'conversation_id': conversationId, 'text': text},
    );
    return ChatReplyDto.fromJson(resp.data!);
  }

  Future<List<ChatMessageDto>> loadHistory({
    required String conversationId,
  }) async {
    final resp = await _dio.get<List<dynamic>>(
      Endpoints.chat,
      queryParameters: {'conversation_id': conversationId},
    );
    final data = resp.data ?? const [];
    return data
        .map((e) => ChatMessageDto.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}
