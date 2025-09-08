enum ChatSender { student, bot }

class ChatMessage {
  final String id; // server id or local temp id
  final String conversationId; // server conversation/session id
  final ChatSender sender;
  final String text;
  final DateTime timestamp;

  const ChatMessage({
    required this.id,
    required this.conversationId,
    required this.sender,
    required this.text,
    required this.timestamp,
  });
}
