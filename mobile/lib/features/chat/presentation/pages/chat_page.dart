import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';

import 'package:mobile/core/services/conversation_services.dart';
import 'package:mobile/features/chat/domain/entities/chat_message.dart';
import 'package:mobile/core/widgets/animated_gradient_background.dart';

import '../bloc/chat_bloc.dart';
import '../bloc/chat_event.dart';
import '../bloc/chat_state.dart';

class ChatPage extends StatefulWidget {
  const ChatPage({super.key});

  @override
  State<ChatPage> createState() => _ChatPageState();
}

class _ChatPageState extends State<ChatPage> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final ConversationService _conversationService = ConversationService();
  final ImagePicker _picker = ImagePicker();

  File? _receiptImage;
  bool _showUploadButton = false;
  bool _isInitialized = false;
  String? _conversationStatus;
  bool _isConversationLocked = false;

  @override
  void initState() {
    super.initState();
    // Don't access context here - wait for didChangeDependencies
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_isInitialized) {
      _initializeChat();
    }
  }

  Future<void> _initializeChat() async {
    if (_isInitialized) return;
    
    // Get conversation ID from arguments or create new one
    final arguments = ModalRoute.of(context)?.settings.arguments;
    String conversationId;
    
    if (arguments != null && arguments is Map<String, dynamic>) {
      conversationId = arguments['conversationId'] as String? ?? '';
      _conversationStatus = arguments['status'] as String?;
    } else {
      conversationId = '';
    }
    
    // If no conversation ID provided, get or create one
    if (conversationId.isEmpty) {
      conversationId = await _conversationService.getOrCreate();
    }
    
    // Check if conversation is locked
    _checkConversationStatus(conversationId);
    
    // Initialize chat with the conversation ID
    if (mounted) {
      _isInitialized = true;
      context.read<ChatBloc>().add(ChatInit(conversationId));
    }
  }

  Future<void> _checkConversationStatus(String conversationId) async {
    try {
      // Get conversation history to check status
      final history = await _conversationService.getConversationHistory();
      final conversation = history.firstWhere(
        (conv) => conv['id'] == conversationId,
        orElse: () => <String, dynamic>{},
      );
      
      if (conversation.isNotEmpty) {
        final status = conversation['status'] as String?;
        _conversationStatus = status;
        
        // Check if conversation is locked
        final lockedStatuses = ['pending', 'on_process', 'ready_to_claim', 'rejected'];
        _isConversationLocked = status != null && lockedStatuses.contains(status);
        
        if (mounted) {
          setState(() {});
        }
      }
    } catch (e) {
      // Error checking conversation status
    }
  }

  void _sendMessage() {
    // Check if conversation is locked
    if (_isConversationLocked) {
      _showLockedMessage();
      return;
    }
    
    final text = _messageController.text.trim();
    if (text.isNotEmpty) {
      context.read<ChatBloc>().add(ChatSendPressed(text));
      _messageController.clear();
      _scrollToBottom();
      
      // Update conversation history with the new message
      _conversationService.getOrCreate().then((conversationId) {
        _conversationService.updateConversationLastMessage(conversationId, text);
      });
    }
  }

  void _showLockedMessage() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'This conversation is locked. You cannot send new messages while your request is being processed.',
        ),
        backgroundColor: Colors.orange,
        duration: const Duration(seconds: 3),
        action: SnackBarAction(
          label: 'OK',
          textColor: Colors.white,
          onPressed: () {},
        ),
      ),
    );
  }

  String _getStatusText(String status) {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'DRAFT';
      case 'pending':
        return 'PENDING';
      case 'on_process':
        return 'PROCESSING';
      case 'ready_to_claim':
        return 'READY';
      case 'rejected':
        return 'REJECTED';
      default:
        return status.toUpperCase();
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_scrollController.hasClients) return;
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    });
  }

  Future<void> _createNewConversation() async {
    try {
      final newConversationId = await _conversationService.createNewConversation();
      
      if (mounted) {
        // Clear the current conversation and start fresh
        _messageController.clear();
        
        // Reset the chat bloc with the new conversation
        context.read<ChatBloc>().add(ChatInit(newConversationId));
        
        // Show success message
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Row(
              children: [
                Icon(Icons.check_circle, color: Colors.white),
                SizedBox(width: 8),
                Text('New conversation started!'),
              ],
            ),
            backgroundColor: Colors.green,
            duration: Duration(seconds: 2),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.error, color: Colors.white),
                const SizedBox(width: 8),
                Text('Failed to create new conversation: $e'),
              ],
            ),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _pickReceiptImage() async {
    final pickedFile = await _picker.pickImage(source: ImageSource.gallery);
    if (pickedFile != null) {
      setState(() {
        _receiptImage = File(pickedFile.path);
      });
    }
  }

  void _uploadReceipt() {
    if (_receiptImage != null) {
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text("Confirm Upload"),
          content: const Text("Are you sure you want to upload this receipt?"),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text("Cancel"),
            ),
            TextButton(
              onPressed: () async {
                final scaffoldMessenger = ScaffoldMessenger.of(context);
                final chatBloc = context.read<ChatBloc>();
                Navigator.pop(context);
                try {
                  // Simulate successful upload
                  await Future.delayed(const Duration(seconds: 1));
                  
                  if (mounted) {
                    scaffoldMessenger.showSnackBar(
                  const SnackBar(
                        content: Text("Receipt uploaded successfully!"),
                        backgroundColor: Colors.green,
                  ),
                );
                    
                setState(() {
                  _receiptImage = null;
                  _showUploadButton = false;
                });
                    chatBloc.add(ChatActionHandled());
                  }
                } catch (e) {
                  if (mounted) {
                    scaffoldMessenger.showSnackBar(
                      SnackBar(
                        content: Text("Upload failed: $e"),
                        backgroundColor: Colors.red,
                      ),
                    );
                  }
                }
              },
              child: const Text("Upload"),
            ),
          ],
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    
    return Scaffold(
      backgroundColor: Colors.transparent,
      body: AnimatedGradientBackground(
        isDarkMode: isDarkMode,
        child: SafeArea(
        child: Column(
          children: [
            // Modern Header
            Container(
              margin: const EdgeInsets.all(16),
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    Theme.of(context).primaryColor,
                    Theme.of(context).primaryColor.withValues(alpha: 0.8),
                    Theme.of(context).primaryColor.withValues(alpha: 0.6),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(
                  color: Theme.of(context).primaryColor.withValues(alpha: 0.3),
                  width: 1.5,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Theme.of(context).primaryColor.withValues(alpha: 0.4),
                    blurRadius: 20,
                    offset: const Offset(0, 8),
                    spreadRadius: 4,
                  ),
                  BoxShadow(
                    color: Theme.of(context).primaryColor.withValues(alpha: 0.2),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: IconButton(
                      icon: const Icon(Icons.arrow_back_ios, color: Colors.white, size: 20),
                    onPressed: () => Navigator.pop(context),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.smart_toy, color: Colors.white, size: 24),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                  const Text(
                          "AI Assistant",
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                            letterSpacing: 0.5,
                          ),
                        ),
                        Text(
                          "Always here to help",
                          style: TextStyle(
                            color: Colors.white.withValues(alpha: 0.8),
                            fontSize: 14,
                            fontWeight: FontWeight.w400,
                          ),
                        ),
                        if (_conversationStatus != null) ...[
                          const SizedBox(height: 4),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: _isConversationLocked 
                                  ? Colors.orange.withValues(alpha: 0.8)
                                  : Colors.green.withValues(alpha: 0.8),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              _getStatusText(_conversationStatus!),
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 10,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: PopupMenuButton<String>(
                      icon: const Icon(Icons.more_vert, color: Colors.white, size: 20),
                      onSelected: (value) {
                        if (value == 'new_conversation') {
                          _createNewConversation();
                        } else if (value == 'chat_history') {
                          Navigator.pushNamed(context, '/chat-history');
                        }
                      },
                      itemBuilder: (context) => [
                        const PopupMenuItem(
                          value: 'new_conversation',
                          child: Row(
                            children: [
                              Icon(Icons.add, color: Colors.blue),
                              SizedBox(width: 8),
                              Text('New Conversation'),
                            ],
                          ),
                        ),
                        const PopupMenuItem(
                          value: 'chat_history',
                          child: Row(
                            children: [
                              Icon(Icons.history, color: Colors.green),
                              SizedBox(width: 8),
                              Text('Chat History'),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Chat list
            Expanded(
              child: BlocListener<ChatBloc, ChatState>(
                listener: (context, state) {
                  if (state is ChatLoaded) {
                    _scrollToBottom();
                    if (state.action?.type == 'upload_receipt') {
                      setState(() {
                        _showUploadButton = true;
                      });
                    } else if (state.action?.type == 'reset_form') {
                      setState(() {
                        _showUploadButton = false;
                        _receiptImage = null;
                      });
                      context.read<ChatBloc>().add(ChatActionHandled());
                    }
                  }
                },
                child: BlocBuilder<ChatBloc, ChatState>(
                  builder: (context, state) {
                    if (state is ChatLoading) {
                      return const Center(child: CircularProgressIndicator());
                    } else if (state is ChatLoaded) {
                      final itemCount =
                          state.messages.length + (state.isTyping ? 1 : 0);

                      return ListView.builder(
                        controller: _scrollController,
                        padding: const EdgeInsets.all(8),
                        itemCount: itemCount,
                        itemBuilder: (context, index) {
                          return AnimatedContainer(
                            duration: Duration(milliseconds: 300 + (index * 100)),
                            curve: Curves.easeOutCubic,
                            child: _buildMessageItem(context, state, index, itemCount),
                          );
                        },
                      );
                    } else if (state is ChatError) {
                      return Center(child: Text(state.message));
                    } else {
                      return const Center(child: Text("Chat will appear here"));
                    }
                  },
                ),
              ),
            ),

            // New Conversation FAB (only show when conversation might be locked)
            _buildNewConversationButton(),

            // Modern Input area
            Container(
              margin: const EdgeInsets.all(16),
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Theme.of(context).cardColor,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(
                  color: Theme.of(context).primaryColor.withValues(alpha: 0.2),
                  width: 1.5,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Theme.of(context).primaryColor.withValues(alpha: 0.1),
                    blurRadius: 20,
                    offset: const Offset(0, 8),
                    spreadRadius: 4,
                  ),
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Container(
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(24),
                            boxShadow: [
                              BoxShadow(
                                color: Theme.of(context).primaryColor.withValues(alpha: 0.1),
                                blurRadius: 8,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                        child: TextField(
                          controller: _messageController,
                          enabled: !_isConversationLocked,
                          decoration: InputDecoration(
                            hintText: _isConversationLocked 
                                ? "Conversation locked - cannot send messages"
                                : "Ask Anything...",
                              hintStyle: TextStyle(
                                color: Theme.of(context).textTheme.bodyMedium?.color?.withValues(alpha: 0.6),
                              ),
                            border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(24),
                                borderSide: BorderSide(
                                  color: Theme.of(context).primaryColor.withValues(alpha: 0.3),
                                  width: 1.5,
                                ),
                              ),
                              enabledBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(24),
                                borderSide: BorderSide(
                                  color: Theme.of(context).primaryColor.withValues(alpha: 0.3),
                                  width: 1.5,
                                ),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(24),
                                borderSide: BorderSide(
                                  color: Theme.of(context).primaryColor,
                                  width: 2,
                                ),
                              ),
                              filled: true,
                              fillColor: Theme.of(context).cardColor,
                              contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                            ),
                            style: TextStyle(
                              fontSize: 16,
                              color: Theme.of(context).textTheme.bodyLarge?.color,
                            ),
                            onSubmitted: (_) => _sendMessage(),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              Theme.of(context).primaryColor,
                              Theme.of(context).primaryColor.withValues(alpha: 0.8),
                            ],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(24),
                          boxShadow: [
                            BoxShadow(
                              color: Theme.of(context).primaryColor.withValues(alpha: 0.4),
                              blurRadius: 12,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: IconButton(
                          icon: Icon(
                            Icons.send, 
                            color: _isConversationLocked 
                                ? Colors.grey 
                                : Colors.white
                          ),
                        onPressed: _isConversationLocked ? null : _sendMessage,
                          iconSize: 24,
                        ),
                      ),
                    ],
                  ),
                  if (_showUploadButton && _receiptImage == null)
                    Padding(
                      padding: const EdgeInsets.only(top: 12),
                      child: Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              Theme.of(context).primaryColor.withValues(alpha: 0.1),
                              Theme.of(context).primaryColor.withValues(alpha: 0.05),
                            ],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: Theme.of(context).primaryColor.withValues(alpha: 0.3),
                            width: 1.5,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Theme.of(context).primaryColor.withValues(alpha: 0.2),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Material(
                          color: Colors.transparent,
                          child: InkWell(
                            borderRadius: BorderRadius.circular(20),
                            onTap: _pickReceiptImage,
                            child: Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(
                                    Icons.upload_file,
                                    color: Theme.of(context).primaryColor,
                                    size: 20,
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    "Upload Receipt",
                                    style: TextStyle(
                                      color: Theme.of(context).primaryColor,
                                      fontWeight: FontWeight.w600,
                                      fontSize: 16,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  // Show "New Conversation" button when conversation is locked
                  BlocBuilder<ChatBloc, ChatState>(
                    builder: (context, state) {
                      bool showNewConvButton = false;
                      
                      if (state is ChatLoaded && state.messages.isNotEmpty) {
                        final lastMessage = state.messages.last;
                        if (lastMessage.sender == ChatSender.bot) {
                          final text = lastMessage.text.toLowerCase();
                          showNewConvButton = text.contains('locked') || 
                                            text.contains('new conversation') ||
                                            text.contains('start a new');
                        }
                      }
                      
                      if (!showNewConvButton) return const SizedBox.shrink();
                      
                      return Padding(
                        padding: const EdgeInsets.only(top: 12),
                        child: Container(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [
                                Theme.of(context).primaryColor,
                                Theme.of(context).primaryColor.withValues(alpha: 0.8),
                              ],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: Theme.of(context).primaryColor.withValues(alpha: 0.3),
                              width: 1.5,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: Theme.of(context).primaryColor.withValues(alpha: 0.2),
                                blurRadius: 8,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: Material(
                            color: Colors.transparent,
                            child: InkWell(
                              borderRadius: BorderRadius.circular(20),
                              onTap: _createNewConversation,
                              child: Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Icon(
                                      Icons.add,
                                      color: Colors.white,
                                      size: 20,
                                    ),
                                    const SizedBox(width: 8),
                                    const Text(
                                      "Start New Conversation",
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontWeight: FontWeight.w600,
                                        fontSize: 16,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                  
                  if (_receiptImage != null)
                    Padding(
                      padding: const EdgeInsets.only(top: 12),
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              Theme.of(context).primaryColor.withValues(alpha: 0.1),
                              Theme.of(context).primaryColor.withValues(alpha: 0.05),
                            ],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: Theme.of(context).primaryColor.withValues(alpha: 0.3),
                            width: 1.5,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Theme.of(context).primaryColor.withValues(alpha: 0.2),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                      child: Row(
                        children: [
                            Icon(
                              Icons.image,
                              color: Theme.of(context).primaryColor,
                              size: 20,
                            ),
                            const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              "Selected: ${_receiptImage!.path.split('/').last}",
                                style: TextStyle(
                                  fontSize: 14,
                                  color: Theme.of(context).textTheme.bodyLarge?.color,
                                  fontWeight: FontWeight.w500,
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Container(
                              decoration: BoxDecoration(
                                color: Colors.green,
                                borderRadius: BorderRadius.circular(20),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.green.withValues(alpha: 0.3),
                                    blurRadius: 4,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                              ),
                              child: IconButton(
                                icon: const Icon(Icons.check, color: Colors.white),
                            onPressed: _uploadReceipt,
                                iconSize: 20,
                              ),
                            ),
                            const SizedBox(width: 4),
                            Container(
                              decoration: BoxDecoration(
                                color: Colors.red,
                                borderRadius: BorderRadius.circular(20),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.red.withValues(alpha: 0.3),
                                    blurRadius: 4,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                              ),
                              child: IconButton(
                                icon: const Icon(Icons.clear, color: Colors.white),
                                onPressed: () => setState(() => _receiptImage = null),
                                iconSize: 20,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
      ),
    );
  }

  Widget _buildMessageItem(BuildContext context, ChatLoaded state, int index, int itemCount) {
    // If last item and typing -> show typing bubble
    final isTypingItem = state.isTyping && index == itemCount - 1;
    if (isTypingItem) {
      return const _TypingBubble();
    }

    final msg = state.messages[index];
    final isBot = msg.sender == ChatSender.bot;
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    
    return AnimatedContainer(
      duration: Duration(milliseconds: 300 + (index * 100)),
      curve: Curves.easeOutCubic,
      child: Align(
        alignment: isBot ? Alignment.centerLeft : Alignment.centerRight,
        child: Container(
          margin: const EdgeInsets.symmetric(vertical: 6, horizontal: 16),
          constraints: BoxConstraints(
            maxWidth: MediaQuery.of(context).size.width * 0.8,
          ),
          child: Column(
            crossAxisAlignment: isBot ? CrossAxisAlignment.start : CrossAxisAlignment.end,
            children: [
              // Message bubble
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: isBot
                        ? [
                            isDarkMode 
                                ? const Color(0xFF2A2A2A)
                                : const Color(0xFFF8F9FA),
                            isDarkMode
                                ? const Color(0xFF1E1E1E)
                                : const Color(0xFFF0F0F0),
                          ]
                        : [
                            Theme.of(context).primaryColor,
                            Theme.of(context).primaryColor.withValues(alpha: 0.8),
                          ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.only(
                    topLeft: const Radius.circular(24),
                    topRight: const Radius.circular(24),
                    bottomLeft: isBot ? const Radius.circular(8) : const Radius.circular(24),
                    bottomRight: isBot ? const Radius.circular(24) : const Radius.circular(8),
                  ),
                  border: Border.all(
                    color: isBot 
                        ? Theme.of(context).primaryColor.withValues(alpha: 0.2)
                        : Theme.of(context).primaryColor.withValues(alpha: 0.3),
                    width: 1.0,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: isBot 
                          ? Theme.of(context).primaryColor.withValues(alpha: 0.1)
                          : Theme.of(context).primaryColor.withValues(alpha: 0.2),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                      spreadRadius: 2,
                    ),
                    BoxShadow(
                      color: Colors.black.withValues(alpha: isDarkMode ? 0.3 : 0.1),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Enhanced message text with better formatting
                    _buildFormattedMessage(msg.text, isBot, context),
                    const SizedBox(height: 8),
                    // Enhanced sender info
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(4),
                          decoration: BoxDecoration(
                            color: isBot 
                                ? Theme.of(context).primaryColor.withValues(alpha: 0.1)
                                : Colors.white.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Icon(
                            isBot ? Icons.smart_toy : Icons.person,
                            size: 12,
                            color: isBot 
                                ? Theme.of(context).primaryColor
                                : Colors.white,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          isBot ? "AI Assistant" : "You",
                          style: TextStyle(
                            color: isBot 
                                ? Theme.of(context).primaryColor.withValues(alpha: 0.7)
                                : Colors.white.withValues(alpha: 0.8),
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            letterSpacing: 0.3,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              // Timestamp
              Padding(
                padding: const EdgeInsets.only(top: 4, left: 8, right: 8),
                child: Text(
                  _formatTimestamp(msg.timestamp),
                  style: TextStyle(
                    color: Theme.of(context).textTheme.bodySmall?.color?.withValues(alpha: 0.6),
                    fontSize: 10,
                    fontWeight: FontWeight.w400,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFormattedMessage(String text, bool isBot, BuildContext context) {
    // Enhanced text formatting for better readability
    return RichText(
      text: TextSpan(
        children: _parseMessageText(text, isBot, context),
        style: TextStyle(
          color: isBot 
              ? Theme.of(context).textTheme.bodyLarge?.color
              : Colors.white,
          fontSize: 16,
          fontWeight: FontWeight.w500,
          height: 1.5,
          letterSpacing: 0.2,
        ),
      ),
    );
  }

  List<TextSpan> _parseMessageText(String text, bool isBot, BuildContext context) {
    List<TextSpan> spans = [];
    final lines = text.split('\n');
    
    for (int i = 0; i < lines.length; i++) {
      final line = lines[i];
      
      // Handle bold text (**text**)
      final boldRegex = RegExp(r'\*\*(.*?)\*\*');
      final matches = boldRegex.allMatches(line);
      
      if (matches.isEmpty) {
        spans.add(TextSpan(text: line));
      } else {
        int lastIndex = 0;
        for (final match in matches) {
          // Add text before the match
          if (match.start > lastIndex) {
            spans.add(TextSpan(text: line.substring(lastIndex, match.start)));
          }
          
          // Add bold text
          spans.add(TextSpan(
            text: match.group(1),
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: isBot 
                  ? Theme.of(context).primaryColor
                  : Colors.white,
            ),
          ));
          
          lastIndex = match.end;
        }
        
        // Add remaining text
        if (lastIndex < line.length) {
          spans.add(TextSpan(text: line.substring(lastIndex)));
        }
      }
      
      // Add line break if not the last line
      if (i < lines.length - 1) {
        spans.add(const TextSpan(text: '\n'));
      }
    }
    
    return spans;
  }

  String _formatTimestamp(DateTime timestamp) {
    final now = DateTime.now();
    final difference = now.difference(timestamp);
    
    if (difference.inMinutes < 1) {
      return 'Just now';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes}m ago';
    } else if (difference.inHours < 24) {
      return '${difference.inHours}h ago';
    } else {
      return '${timestamp.day}/${timestamp.month} ${timestamp.hour.toString().padLeft(2, '0')}:${timestamp.minute.toString().padLeft(2, '0')}';
    }
  }

  Widget _buildNewConversationButton() {
    return BlocBuilder<ChatBloc, ChatState>(
      builder: (context, state) {
        bool shouldShow = false;
        
        if (state is ChatLoaded && state.messages.isNotEmpty) {
          final lastMessage = state.messages.last;
          if (lastMessage.sender == ChatSender.bot) {
            final text = lastMessage.text.toLowerCase();
            shouldShow = text.contains('locked') || 
                        text.contains('new conversation') ||
                        text.contains('start a new');
          }
        }
        
        if (!shouldShow) return const SizedBox.shrink();
        
        return Positioned(
          top: 100,
          right: 16,
          child: FloatingActionButton(
            onPressed: _createNewConversation,
            backgroundColor: Theme.of(context).primaryColor,
            tooltip: 'Start New Conversation',
            child: const Icon(Icons.add, color: Colors.white),
          ),
        );
      },
    );
  }
}

/// Enhanced typing bubble with smooth animations
class _TypingBubble extends StatefulWidget {
  const _TypingBubble();

  @override
  State<_TypingBubble> createState() => _TypingBubbleState();
}

class _TypingBubbleState extends State<_TypingBubble>
    with TickerProviderStateMixin {
  late final AnimationController _pulseController;
  late final AnimationController _dotsController;
  late final Animation<double> _pulseAnimation;
  late final Animation<double> _dotsAnimation;

  @override
  void initState() {
    super.initState();
    
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);
    
    _dotsController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat();
    
    _pulseAnimation = Tween<double>(
      begin: 0.8,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _pulseController,
      curve: Curves.easeInOut,
    ));
    
    _dotsAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _dotsController,
      curve: Curves.easeInOut,
    ));
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _dotsController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 6, horizontal: 16),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.8,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Enhanced typing bubble
            AnimatedBuilder(
              animation: _pulseAnimation,
              builder: (context, child) {
                return Transform.scale(
                  scale: _pulseAnimation.value,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          isDarkMode 
                              ? const Color(0xFF2A2A2A)
                              : const Color(0xFFF8F9FA),
                          isDarkMode
                              ? const Color(0xFF1E1E1E)
                              : const Color(0xFFF0F0F0),
                        ],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: const BorderRadius.only(
                        topLeft: Radius.circular(24),
                        topRight: Radius.circular(24),
                        bottomLeft: Radius.circular(8),
                        bottomRight: Radius.circular(24),
                      ),
                      border: Border.all(
                        color: Theme.of(context).primaryColor.withValues(alpha: 0.2),
                        width: 1.0,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Theme.of(context).primaryColor.withValues(alpha: 0.1),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                          spreadRadius: 2,
                        ),
                        BoxShadow(
                          color: Colors.black.withValues(alpha: isDarkMode ? 0.3 : 0.1),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Enhanced AI icon with subtle animation
                        Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [
                                Theme.of(context).primaryColor.withValues(alpha: 0.1),
                                Theme.of(context).primaryColor.withValues(alpha: 0.05),
                              ],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: Theme.of(context).primaryColor.withValues(alpha: 0.2),
                              width: 1,
                            ),
                          ),
                          child: Icon(
                            Icons.smart_toy,
                            size: 16,
                            color: Theme.of(context).primaryColor,
                          ),
                        ),
                        const SizedBox(width: 12),
                        // Enhanced typing indicator
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'AI Assistant is thinking',
                              style: TextStyle(
                                color: Theme.of(context).textTheme.bodyLarge?.color,
                                fontSize: 16,
                                fontWeight: FontWeight.w500,
                                letterSpacing: 0.2,
                              ),
                            ),
                            const SizedBox(height: 4),
                            _buildTypingDots(),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
            // Subtle timestamp
            Padding(
              padding: const EdgeInsets.only(top: 4, left: 8),
              child: Text(
                'Just now',
                style: TextStyle(
                  color: Theme.of(context).textTheme.bodySmall?.color?.withValues(alpha: 0.6),
                  fontSize: 10,
                  fontWeight: FontWeight.w400,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTypingDots() {
    return AnimatedBuilder(
      animation: _dotsAnimation,
      builder: (context, child) {
        return Row(
          mainAxisSize: MainAxisSize.min,
          children: List.generate(3, (index) {
            final delay = index * 0.2;
            final animationValue = (_dotsAnimation.value + delay) % 1.0;
            final opacity = (animationValue < 0.5) 
                ? animationValue * 2 
                : (1.0 - animationValue) * 2;
            
            return Container(
              margin: EdgeInsets.only(right: index < 2 ? 4 : 0),
              child: Opacity(
                opacity: opacity.clamp(0.3, 1.0),
                child: Container(
                  width: 6,
                  height: 6,
                  decoration: BoxDecoration(
                    color: Theme.of(context).primaryColor,
                    shape: BoxShape.circle,
                  ),
                ),
              ),
            );
          }),
        );
      },
    );
  }
}
