import 'package:mobile/features/chat/domain/entities/chat_action.dart';
import 'package:mobile/features/chat/domain/entities/chat_message.dart';

abstract class ChatState {}

class ChatIdle extends ChatState {}

class ChatLoading extends ChatState {}

class ChatLoaded extends ChatState {
  final String conversationId;
  final List<ChatMessage> messages; // ascending by time
  final ChatAction? action; // non-null only when a new action arrived
  final bool isTyping; // show a typing indicator for the bot

  ChatLoaded({
    required this.conversationId,
    required this.messages,
    this.action,
    this.isTyping = false,
  });

  ChatLoaded copyWith({
    String? conversationId,
    List<ChatMessage>? messages,
    ChatAction? action, // pass null to clear
    bool? isTyping,
  }) {
    return ChatLoaded(
      conversationId: conversationId ?? this.conversationId,
      messages: messages ?? this.messages,
      action: action,
      isTyping: isTyping ?? this.isTyping,
    );
  }
}

class ChatError extends ChatState {
  final String message;
  ChatError(this.message);
}
