import 'package:mobile/features/chat/domain/entities/chat_action.dart';
import 'package:mobile/features/chat/domain/entities/chat_message.dart';
import 'package:mobile/features/chat/domain/repositories/chat_repository.dart';

class SendMessage {
  final IChatRepository repo;
  const SendMessage(this.repo);

  Future<(ChatMessage, ChatAction?)> call({
    required String conversationId,
    required String text,
  }) {
    return repo.sendMessage(conversationId: conversationId, text: text);
  }
}
