abstract class ChatEvent {}

class ChatInit extends ChatEvent {
  final String conversationId;
  ChatInit(this.conversationId);
}

class ChatLoadMore extends ChatEvent {
  final String beforeId;
  ChatLoadMore(this.beforeId);
}

class ChatSendPressed extends ChatEvent {
  final String text;
  ChatSendPressed(this.text);
}
