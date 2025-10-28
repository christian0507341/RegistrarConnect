import 'package:mobile/features/chat/domain/entities/chat_action.dart';
import 'package:mobile/features/chat/domain/entities/chat_message.dart';

abstract class IChatRepository {
  Future<(ChatMessage botReply, ChatAction? action)> sendMessage({
    required String conversationId,
    required String text,
  });

  Future<List<ChatMessage>> loadHistory({required String conversationId});
}
