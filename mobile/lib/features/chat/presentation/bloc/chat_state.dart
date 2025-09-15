import 'package:mobile/features/chat/domain/entities/chat_message.dart';

abstract class ChatState {}

class ChatIdle extends ChatState {}

class ChatLoading extends ChatState {}

class ChatLoaded extends ChatState {
  final String conversationId;
  final List<ChatMessage> messages; // ascending by time
  ChatLoaded({required this.conversationId, required this.messages});
}

class ChatError extends ChatState {
  final String message;
  ChatError(this.message);
}
