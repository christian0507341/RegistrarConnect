import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/services/secure_storage.dart';
import 'package:mobile/features/auth/presentation/pages/login_page.dart';
import 'package:mobile/features/chat/presentation/bloc/chat_bloc.dart';
import 'package:mobile/features/chat/presentation/bloc/chat_event.dart';
import 'package:mobile/features/chat/presentation/bloc/chat_state.dart';

class ChatPage extends StatefulWidget {
  const ChatPage({
    super.key,
    required this.conversationId,
    this.title = 'Registrar Bot',
  });
  final String conversationId;
  final String title;

  @override
  State<ChatPage> createState() => _ChatPageState();
}

class _ChatPageState extends State<ChatPage> {
  late final ChatBloc bloc = ChatBloc();
  final controller = TextEditingController();
  final scroll = ScrollController();

  // ---- make sure this method is properly closed ----
  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!scroll.hasClients) return;
      scroll.jumpTo(scroll.position.maxScrollExtent);
    });
  } // <--- THIS closing brace must exist

  @override
  void initState() {
    super.initState();
    _ensureAuthThenLoad(); // <-- now fine to call
  }

  // ---- this must be at class level, not inside another method ----
  Future<void> _ensureAuthThenLoad() async {
    final s = SecureStorageService();
    final a = await s.readAccess();
    final r = await s.readRefresh();
    final hasSession = (a?.isNotEmpty == true) || (r?.isNotEmpty == true);

    if (!hasSession) {
      if (!mounted) return;
      Navigator.of(
        context,
      ).pushReplacement(MaterialPageRoute(builder: (_) => const LoginPage()));
      return;
    }

    // Auth OK -> load history
    bloc.add(ChatInit(widget.conversationId));
  }

  @override
  void dispose() {
    controller.dispose();
    scroll.dispose();
    bloc.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider.value(
      value: bloc,
      child: Scaffold(
        appBar: AppBar(title: Text(widget.title)),
        body: Column(
          children: [
            Expanded(
              child: BlocBuilder<ChatBloc, ChatState>(
                builder: (context, state) {
                  if (state is ChatLoading)
                    return const Center(child: CircularProgressIndicator());
                  if (state is ChatError)
                    return Center(child: Text(state.message));
                  if (state is ChatLoaded) {
                    _scrollToBottom();
                    // ... your list view here ...
                    return const SizedBox.shrink();
                  }
                  return const SizedBox.shrink();
                },
              ),
            ),
            // ... input row here ...
          ],
        ),
      ),
    );
  }
}
