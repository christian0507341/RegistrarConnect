class ChatMessageDto {
  final String id;
  final String conversationId;
  final String sender; // 'student' | 'bot'
  final String text;
  final String timestamp; // ISO8601

  ChatMessageDto({
    required this.id,
    required this.conversationId,
    required this.sender,
    required this.text,
    required this.timestamp,
  });

  factory ChatMessageDto.fromJson(Map<String, dynamic> json) {
    // Be tolerant to different backend key variants
    final id = (json['id'] ?? json['_id'] ?? '').toString();
    final convId =
        (json['conversation_id'] ??
                json['conversationId'] ??
                json['room_id'] ??
                '')
            .toString();
    final sender = (json['sender'] ?? json['role'] ?? 'bot') as String;
    final text =
        (json['text'] ?? json['content'] ?? json['message'] ?? '') as String;
    final ts =
        (json['timestamp'] ??
                json['created_at'] ??
                json['time'] ??
                DateTime.now().toIso8601String())
            as String;

    return ChatMessageDto(
      id: id,
      conversationId: convId,
      sender: sender,
      text: text,
      timestamp: ts,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'conversation_id': conversationId,
    'sender': sender,
    'text': text,
    'timestamp': timestamp,
  };
}

class ChatReplyDto {
  final ChatMessageDto message;
  final Map<String, dynamic>?
  action; // e.g. {type:'upload_receipt', request_id:'...'}

  ChatReplyDto({required this.message, this.action});

  factory ChatReplyDto.fromJson(Map<String, dynamic> json) {
    // Accept either {"message": {...}, "action": {...}} or direct message object
    final rawMessage = (json['message'] ?? json) as Map<String, dynamic>;
    return ChatReplyDto(
      message: ChatMessageDto.fromJson(rawMessage),
      action: json['action'] as Map<String, dynamic>?,
    );
  }

  Map<String, dynamic> toJson() => {
    'message': message.toJson(),
    'action': action,
  };
}
