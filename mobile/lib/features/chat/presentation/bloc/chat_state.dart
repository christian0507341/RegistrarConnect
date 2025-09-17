import 'package:mobile/features/chat/domain/entities/chat_message.dart';
import 'package:mobile/features/chat/domain/entities/chat_action.dart';

abstract class ChatState {}

class ChatIdle extends ChatState {}

class ChatLoading extends ChatState {}

class ChatLoaded extends ChatState {
  final String conversationId;
  final List<ChatMessage> messages; // ascending by time
  final ChatAction? action; // non-null only when a new action arrived

  ChatLoaded({
    required this.conversationId,
    required this.messages,
    this.action,
  });

  ChatLoaded copyWith({
    String? conversationId,
    List<ChatMessage>? messages,
    ChatAction? action, // pass null to clear the action
  }) {
    return ChatLoaded(
      conversationId: conversationId ?? this.conversationId,
      messages: messages ?? this.messages,
      action: action,
    );
  }
}

class ChatError extends ChatState {
  final String message;
  ChatError(this.message);
}
