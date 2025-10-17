enum ChatSender {
  student,
  bot,
}

class ChatMessage {
  final String id;
  final String conversationId;
  final ChatSender sender;
  final String text;
  final DateTime timestamp;

  ChatMessage({
    required this.id,
    required this.conversationId,
    required this.sender,
    required this.text,
    required this.timestamp,
  });

  factory ChatMessage.fromDto(dynamic dto) {
    // Handle both ChatMessageDto and Map<String, dynamic>
    String id, conversationId, text, timestampStr;
    String senderStr;
    
    if (dto is Map<String, dynamic>) {
      id = (dto['id'] ?? '').toString();
      conversationId = (dto['conversation_id'] ?? dto['conversationId'] ?? '').toString();
      senderStr = (dto['sender'] ?? 'bot').toString();
      text = (dto['text'] ?? dto['content'] ?? dto['message'] ?? '').toString();
      timestampStr = (dto['timestamp'] ?? dto['created_at'] ?? dto['time'] ?? DateTime.now().toIso8601String()).toString();
    } else {
      // Assume it's a ChatMessageDto
      id = dto.id;
      conversationId = dto.conversationId;
      senderStr = dto.sender;
      text = dto.text;
      timestampStr = dto.timestamp;
    }

    final sender = senderStr == 'student' ? ChatSender.student : ChatSender.bot;
    final timestamp = DateTime.tryParse(timestampStr) ?? DateTime.now();

    return ChatMessage(
      id: id,
      conversationId: conversationId,
      sender: sender,
      text: text,
      timestamp: timestamp,
    );
  }
}
