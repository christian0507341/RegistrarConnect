import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/features/chat/data/sources/chat_api.dart';
import 'package:mobile/features/chat/data/repositories/chat_repository.dart'
    as data_impl;
import 'package:mobile/features/chat/domain/usecases/load_history.dart';
import 'package:mobile/features/chat/domain/usecases/send_message.dart';
import 'package:mobile/features/chat/domain/entities/chat_message.dart';
import 'chat_event.dart';
import 'chat_state.dart';

class ChatBloc extends Bloc<ChatEvent, ChatState> {
  final LoadHistory _loadHistory;
  final SendMessage _sendMessage;
  late final String _conversationId;

  ChatBloc._(this._loadHistory, this._sendMessage) : super(ChatIdle()) {
    on<ChatInit>(_onInit);
    on<ChatLoadMore>(_onLoadMore);
    on<ChatSendPressed>(_onSendPressed);
  }

  factory ChatBloc() {
    final api = ChatApi();
    final repo = data_impl.ChatRepository(api);
    return ChatBloc._(LoadHistory(repo), SendMessage(repo));
  }

  Future<void> _onInit(ChatInit e, Emitter<ChatState> emit) async {
    emit(ChatLoading());
    _conversationId = e.conversationId;
    try {
      final msgs = await _loadHistory(conversationId: _conversationId);
      // Ensure ascending by time
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
      // Optional: implement pagination when backend supports before_id
      final more = await _loadHistory(conversationId: _conversationId);
      final dedup = _mergeUnique(current.messages, more);
      dedup.sort((a, b) => a.timestamp.compareTo(b.timestamp));
      emit(ChatLoaded(conversationId: _conversationId, messages: dedup));
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
    try {
      final (reply, _action) = await _sendMessage(
        conversationId: _conversationId,
        text: e.text,
      );
      final updated = [...current.messages, reply];
      emit(ChatLoaded(conversationId: _conversationId, messages: updated));
      // TODO: if you want to act on _action (e.g., navigate to receipt upload), handle it in the UI with BlocListener.
    } catch (err) {
      emit(ChatError(err.toString()));
    }
  }

  List<ChatMessage> _mergeUnique(List<ChatMessage> a, List<ChatMessage> b) {
    final ids = {for (final m in a) m.id};
    final merged = [...a];
    for (final m in b) {
      if (!ids.contains(m.id)) merged.add(m);
    }
    return merged;
  }
}
