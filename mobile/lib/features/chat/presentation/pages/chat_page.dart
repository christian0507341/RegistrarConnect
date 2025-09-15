import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/features/chat/presentation/bloc/chat_bloc.dart';
import 'package:mobile/features/chat/presentation/bloc/chat_event.dart';
import 'package:mobile/features/chat/presentation/bloc/chat_state.dart';
// ↓ Import your entity to access ChatSender enum
import 'package:mobile/features/chat/domain/entities/chat_message.dart';

class ChatPage extends StatefulWidget {
  final String conversationId;
  final String title;
  const ChatPage({
    super.key,
    required this.conversationId,
    this.title = 'Registrar Bot',
  });

  @override
  State<ChatPage> createState() => _ChatPageState();
}

class _ChatPageState extends State<ChatPage> {
  late final ChatBloc bloc = ChatBloc()..add(ChatInit(widget.conversationId));
  final controller = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return BlocProvider.value(
      value: bloc,
      child: Scaffold(
        appBar: AppBar(title: Text(widget.title)),
        body: Column(
          children: [
            Expanded(
              child: BlocConsumer<ChatBloc, ChatState>(
                listener: (context, state) {
                  // handle actions later with a separate event if needed
                },
                builder: (context, state) {
                  if (state is ChatLoading) {
                    return const Center(child: CircularProgressIndicator());
                  }
                  if (state is ChatError) {
                    return Center(child: Text(state.message));
                  }
                  if (state is ChatLoaded) {
                    return ListView.builder(
                      padding: const EdgeInsets.all(12),
                      itemCount: state.messages.length,
                      itemBuilder: (_, i) {
                        final m = state.messages[i];
                        final bool isUser = (m.sender == ChatSender.student);
                        return Align(
                          alignment: isUser
                              ? Alignment.centerRight
                              : Alignment.centerLeft,
                          child: Container(
                            margin: const EdgeInsets.symmetric(vertical: 4),
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: isUser
                                  ? Colors.blue.shade100
                                  : Colors.grey.shade200,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(m.text),
                          ),
                        );
                      },
                    );
                  }
                  return const SizedBox.shrink();
                },
              ),
            ),
            SafeArea(
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: controller,
                      decoration: const InputDecoration(
                        hintText: 'Type a message…',
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.send),
                    onPressed: () {
                      final text = controller.text.trim();
                      if (text.isNotEmpty) {
                        context.read<ChatBloc>().add(ChatSendPressed(text));
                        controller.clear();
                      }
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
