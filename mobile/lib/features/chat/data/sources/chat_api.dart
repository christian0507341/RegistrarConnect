import 'package:dio/dio.dart';
import 'package:mobile/features/chat/domain/entities/chat_message.dart';

class ChatApi {
  final Dio _dio = Dio(
    BaseOptions(baseUrl: "http://10.0.2.2:8000/api/ai"), // Emulator localhost
  );

  Future<List<ChatMessage>> loadHistory(String conversationId) async {
    final res = await _dio.get(
      "/chat",
      queryParameters: {"conversation_id": conversationId},
      options: Options(
        headers: {"Authorization": "Bearer YOUR_TOKEN"}, // TODO: plug in auth token
      ),
    );
    final data = res.data as List;
    return data.map((json) => ChatMessage.fromJson(json)).toList();
  }

  Future<(ChatMessage, Map<String, dynamic>?)> sendMessage({
    required String conversationId,
    required String text,
  }) async {
    final res = await _dio.post(
      "/chat",
      data: {"conversation_id": conversationId, "text": text},
      options: Options(
        headers: {"Authorization": "Bearer YOUR_TOKEN"}, // TODO: plug in auth token
      ),
    );

    final data = res.data;
    final msg = ChatMessage.fromJson(data["message"]);
    final action = data["action"];
    return (msg, action);
  }
}
