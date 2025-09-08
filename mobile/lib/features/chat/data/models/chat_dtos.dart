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

  factory ChatMessageDto.fromJson(Map<String, dynamic> json) => ChatMessageDto(
    id: json['id'] as String,
    conversationId:
        json['conversation_id'] as String? ??
        json['conversationId'] as String, // accept either
    sender: json['sender'] as String,
    text: json['text'] as String,
    timestamp: json['timestamp'] as String,
  );

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

  factory ChatReplyDto.fromJson(Map<String, dynamic> json) => ChatReplyDto(
    message: ChatMessageDto.fromJson(json['message'] as Map<String, dynamic>),
    action: json['action'] as Map<String, dynamic>?,
  );

  Map<String, dynamic> toJson() => {
    'message': message.toJson(),
    'action': action,
  };
}
