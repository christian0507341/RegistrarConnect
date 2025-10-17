import 'package:mobile/features/chat/data/sources/chat_api.dart';
import 'package:mobile/features/chat/domain/entities/chat_action.dart';
import 'package:mobile/features/chat/domain/entities/chat_message.dart';
import 'package:mobile/features/chat/domain/repositories/chat_repository.dart';

class ChatRepository implements IChatRepository {
  final ChatApi _api;

  ChatRepository(this._api);

  @override
  Future<(ChatMessage botReply, ChatAction? action)> sendMessage({
    required String conversationId,
    required String text,
  }) async {
    final replyDto = await _api.sendMessage(
      conversationId: conversationId,
      text: text,
    );

    final botReply = ChatMessage.fromDto(replyDto.botMessage);
    
    ChatAction? action;
    if (replyDto.action != null) {
      action = ChatAction(
        type: replyDto.action!['type'] ?? '',
        requestId: replyDto.action!['request_id'],
        payload: replyDto.action!['payload'],
      );
    }

    return (botReply, action);
  }

  @override
  Future<List<ChatMessage>> loadHistory({required String conversationId}) async {
    final messageDtos = await _api.loadHistory(conversationId: conversationId);
    return messageDtos.map((dto) => ChatMessage.fromDto(dto)).toList();
  }
}
