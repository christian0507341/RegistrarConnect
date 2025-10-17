import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/services/conversation_services.dart';
import 'package:mobile/features/chat/data/sources/chat_api.dart';
import 'package:mobile/features/chat/data/repositories/chat_repository.dart';
import 'package:mobile/features/chat/domain/usecases/load_history.dart';
import 'package:mobile/features/chat/domain/usecases/send_message.dart';
import 'package:mobile/features/chat/domain/entities/chat_message.dart';
import 'package:mobile/features/chat/domain/entities/chat_action.dart';
import 'chat_event.dart';
import 'chat_state.dart';

class ChatBloc extends Bloc<ChatEvent, ChatState> {
  final LoadHistory _loadHistory;
  final SendMessage _sendMessage;
  late String _conversationId;
  final ConversationService _conversationService = ConversationService();

  ChatBloc._(this._loadHistory, this._sendMessage) : super(ChatIdle()) {
    on<ChatInit>(_onInit);
    on<ChatLoadMore>(_onLoadMore);
    on<ChatSendPressed>(_onSendPressed);
    on<ChatActionHandled>(_onActionHandled);
  }

  factory ChatBloc() {
    final api = ChatApi();
    final repo = ChatRepository(api);
    return ChatBloc._(LoadHistory(repo), SendMessage(repo));
  }

  Future<void> _onInit(ChatInit e, Emitter<ChatState> emit) async {
    emit(ChatLoading());
    _conversationId = e.conversationId.isNotEmpty
        ? e.conversationId
        : await _generateOrLoadConversationId();
    try {
      final msgs = await _loadHistory.call(conversationId: _conversationId);
      msgs.sort((a, b) => a.timestamp.compareTo(b.timestamp));
      emit(ChatLoaded(conversationId: _conversationId, messages: msgs));
    } catch (err) {
      emit(ChatError(err.toString()));
    }
  }

  Future<void> _onLoadMore(ChatLoadMore e, Emitter<ChatState> emit) async {
    final current = state;
    if (current is! ChatLoaded) return;
    try {
      final more = await _loadHistory.call(conversationId: _conversationId);
      final merged = _mergeUnique(current.messages, more)
        ..sort((a, b) => a.timestamp.compareTo(b.timestamp));
      emit(current.copyWith(messages: merged));
    } catch (err) {
      emit(ChatError(err.toString()));
    }
  }

  Future<void> _onSendPressed(
    ChatSendPressed e,
    Emitter<ChatState> emit,
  ) async {
    final current = state;
    if (current is! ChatLoaded) return;

    // 1) Show the user message immediately
    final withUser = [...current.messages, _createUserMessage(e.text)];

    // 2) Flip on the typing indicator right away
    emit(current.copyWith(messages: withUser, isTyping: true, action: null));

    final started = DateTime.now();

    try {
      // 3) Ask backend
      final (reply, action) = await _sendMessage(
        conversationId: _conversationId,
        text: e.text,
      );

      // (Optional) adapt reply/action if you keep your fallback logic
      final updatedReply = _handleDocumentRequest(e.text, reply);
      final updatedAction = _handleActionForRequest(e.text, action);

      // 4) Ensure a natural delay for the typing indicator
      final targetDelay = _typingDelayFor(updatedReply.text);
      final elapsed = DateTime.now().difference(started);
      final remaining = targetDelay - elapsed;
      if (remaining.inMilliseconds > 0) {
        await Future.delayed(remaining);
      }

      // 5) Append bot message, turn off typing, push any action
      final withBot = [...withUser, updatedReply];
      emit(
        current.copyWith(
          messages: withBot,
          action: updatedAction,
          isTyping: false,
        ),
      );
    } catch (err) {
      // Turn off typing if error
      emit(ChatError(_handleError(err)));
    }
  }

  void _onActionHandled(ChatActionHandled e, Emitter<ChatState> emit) {
    final current = state;
    if (current is ChatLoaded && current.action != null) {
      if (current.action!.type == 'reset_form') {
        emit(
          ChatLoaded(
            conversationId: _conversationId,
            messages: current.messages,
            isTyping: false,
          ),
        ); // Reset form-related state
      } else {
        emit(current.copyWith(action: null)); // Clear one-shot action
      }
    }
  }

  // --- Helpers --------------------------------------------------------------

  // Simple natural typing delay: base + per-char with min/max caps
  Duration _typingDelayFor(String text) {
    const baseMs = 450; // feels responsive
    const perCharMs = 18; // ~55 wpm vibe
    const minMs = 350; // never shorter than this
    const maxMs = 2400; // don't make it feel stuck
    final total = baseMs + text.length * perCharMs;
    final clamped = total < minMs ? minMs : (total > maxMs ? maxMs : total);
    return Duration(milliseconds: clamped);
  }

  // Fallback for free-text document requests (case-insensitive)
  ChatMessage _handleDocumentRequest(String text, ChatMessage reply) {
    final documentMatch = RegExp(
      r'request\s+(copy_of_grades|copy_of_enrollment|other)',
      caseSensitive: false,
    ).firstMatch(text);
    if (documentMatch != null) {
      final docType = documentMatch.group(1)!;
      return ChatMessage(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        conversationId: _conversationId,
        sender: ChatSender.bot,
        text: "Please upload a receipt for your $docType request.",
        timestamp: DateTime.now(),
      );
    }
    return reply;
  }

  ChatAction? _handleActionForRequest(String text, ChatAction? action) {
    final documentMatch = RegExp(
      r'request\s+(copy_of_grades|copy_of_enrollment|other)',
      caseSensitive: false,
    ).firstMatch(text);
    if (documentMatch != null) {
      return const ChatAction(
        type: 'upload_receipt',
        requestId: null,
        payload: null,
      );
    }
    return action;
  }

  List<ChatMessage> _mergeUnique(List<ChatMessage> a, List<ChatMessage> b) {
    final ids = {for (final m in a) m.id};
    final merged = [...a];
    for (final m in b) {
      if (!ids.contains(m.id)) merged.add(m);
    }
    return merged;
  }

  ChatMessage _createUserMessage(String text) {
    return ChatMessage(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      conversationId: _conversationId,
      sender: ChatSender.student,
      text: text,
      timestamp: DateTime.now(),
    );
  }

  Future<String> _generateOrLoadConversationId() async {
    return await _conversationService.getOrCreate();
  }

  String _handleError(dynamic err) {
    if (err is Exception) {
      return err.toString().contains('401')
          ? 'Authentication failed. Please log in again.'
          : 'Failed to send message: ${err.toString()}';
    }
    return 'An unexpected error occurred.';
  }
}
