import 'package:mobile/features/chat/domain/entities/chat_message.dart';
import 'package:mobile/features/chat/domain/entities/chat_action.dart';

abstract class ChatState {}

class ChatIdle extends ChatState {}

class ChatLoading extends ChatState {}

class ChatLoaded extends ChatState {
  final String conversationId;
  final List<ChatMessage> messages;
  final dynamic action;
  final bool isTyping;
  final String? error;

  ChatLoaded({
    required this.conversationId,
    required this.messages,
    this.action,
    this.isTyping = false,
    this.error,
  });

  ChatLoaded copyWith({
    String? conversationId,
    List<ChatMessage>? messages,
    dynamic action,
    bool? isTyping,
    String? error,
  }) {
    return ChatLoaded(
      conversationId: conversationId ?? this.conversationId,
      messages: messages ?? this.messages,
      action: action,
      isTyping: isTyping ?? this.isTyping,
      error: error ?? this.error,
    );
  }
}

class ChatError extends ChatState {
  final String message;
  ChatError(this.message);
}
