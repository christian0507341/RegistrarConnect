import 'package:mobile/features/chat/data/models/chat_dtos.dart';
import 'package:mobile/features/chat/data/sources/chat_api.dart';
import 'package:mobile/features/chat/domain/entities/chat_action.dart';
import 'package:mobile/features/chat/domain/entities/chat_message.dart';
import 'package:mobile/features/chat/domain/repositories/chat_repository.dart';

class ChatRepository implements IChatRepository {
  ChatRepository(this._api);
  final ChatApi _api;

  ChatMessage _toEntity(ChatMessageDto dto) => ChatMessage(
    id: dto.id,
    conversationId: dto.conversationId,
    sender: dto.sender == 'bot' ? ChatSender.bot : ChatSender.student,
    text: dto.text,
    timestamp: DateTime.parse(dto.timestamp),
  );

  ChatAction? _actionFrom(Map<String, dynamic>? a) {
    if (a == null) return null;
    return ChatAction(
      type: a['type'] as String,
      requestId: a['request_id'] as String?,
      payload: a,
    );
    // You can normalize different server keys here if needed.
  }

  @override
  Future<(ChatMessage, ChatAction?)> sendMessage({
    required String conversationId,
    required String text,
  }) async {
    final reply = await _api.sendMessage(
      conversationId: conversationId,
      text: text,
    );
    return (_toEntity(reply.message), _actionFrom(reply.action));
  }

  @override
  Future<List<ChatMessage>> loadHistory({
    required String conversationId,
  }) async {
    final list = await _api.loadHistory(conversationId: conversationId);
    return list.map(_toEntity).toList();
  }
}
