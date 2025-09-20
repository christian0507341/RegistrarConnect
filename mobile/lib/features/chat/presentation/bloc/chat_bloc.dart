import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/services/conversation_services.dart';
import 'package:mobile/features/chat/domain/entities/chat_message.dart';
import 'chat_event.dart';
import 'chat_state.dart';

class ChatBloc extends Bloc<ChatEvent, ChatState> {
  final ConversationService _convService;
  late String _conversationId;

  ChatBloc({ConversationService? convService})
      : _convService = convService ?? ConversationService(),
        super(ChatIdle()) {
    on<ChatInit>(_onInit);
    on<ChatSendPressed>(_onSendPressed);
    on<ChatActionHandled>(_onActionHandled);
  }

  Future<void> _onInit(ChatInit e, Emitter<ChatState> emit) async {
    emit(ChatLoading());
    _conversationId = e.conversationId;
    emit(ChatLoaded(conversationId: _conversationId, messages: []));
  }

  Future<void> _onSendPressed(ChatSendPressed e, Emitter<ChatState> emit) async {
    final current = state;
    if (current is! ChatLoaded) return;

    final userMsg = ChatMessage(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      conversationId: _conversationId,
      sender: "user",
      text: e.text,
      timestamp: DateTime.now(),
    );

    emit(current.copyWith(
      messages: [...current.messages, userMsg],
      isTyping: true,
      error: null,
    ));

    try {
      final replyText = await _convService.sendMessage(_conversationId, e.text);

      final botMsg = ChatMessage(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        conversationId: _conversationId,
        sender: "bot",
        text: replyText,
        timestamp: DateTime.now(),
      );

      emit(current.copyWith(
        messages: [...current.messages, userMsg, botMsg],
        isTyping: false,
        error: null,
      ));
    } catch (_) {
      emit(current.copyWith(
        isTyping: false,
        error: "Hmm, something went wrong. Try again.",
      ));
    }
  }

  void _onActionHandled(ChatActionHandled e, Emitter<ChatState> emit) {
    final current = state;
    if (current is ChatLoaded && current.action != null) {
      emit(current.copyWith(action: null));
    }
  }
}
