class ChatMessage {
  final String id;
  final String conversationId;
  final String sender;
  final String text;
  final DateTime timestamp;

  ChatMessage({
    required this.id,
    required this.conversationId,
    required this.sender,
    required this.text,
    required this.timestamp,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: json["id"] as String,
      conversationId: json["conversation_id"] as String,
      sender: json["sender"] as String,
      text: json["text"] as String,
      timestamp: DateTime.parse(json["timestamp"]),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      "id": id,
      "conversation_id": conversationId,
      "sender": sender,
      "text": text,
      "timestamp": timestamp.toIso8601String(),
    };
  }
}
