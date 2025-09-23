// lib/features/chat/presentation/bloc/chat_event.dart
abstract class ChatEvent {}

class ChatInit extends ChatEvent {
  final String conversationId;
  ChatInit(this.conversationId);
}

class ChatLoadMore extends ChatEvent {}

class ChatSendPressed extends ChatEvent {
  final String text;
  ChatSendPressed(this.text);
}

class ChatActionHandled extends ChatEvent {}

class ChatRequestDocument extends ChatEvent {
  final String documentType;
  final String? studentId;
  ChatRequestDocument(this.documentType, {this.studentId});
}
