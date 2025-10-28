import 'package:mobile/features/chat/domain/entities/chat_message.dart';
import 'package:mobile/features/chat/domain/repositories/chat_repository.dart';

class LoadHistory {
  final IChatRepository repo;
  const LoadHistory(this.repo);

  Future<List<ChatMessage>> call({required String conversationId}) {
    return repo.loadHistory(conversationId: conversationId);
  }
}
