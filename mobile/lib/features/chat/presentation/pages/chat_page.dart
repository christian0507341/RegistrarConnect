import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/services/conversation_services.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import 'package:mobile/features/chat/domain/entities/chat_message.dart';
import '../bloc/chat_bloc.dart';
import '../bloc/chat_event.dart';
import '../bloc/chat_state.dart';

// New event for structured document requests
class ChatRequestDocument extends ChatEvent {
  final String documentType;
  final String? studentId;

  ChatRequestDocument(this.documentType, {this.studentId});
}

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

  @override
  void initState() {
    super.initState();
    _conversationService.getOrCreate().then((id) {
      context.read<ChatBloc>().add(ChatInit(id));
    });
  }

  void _sendMessage() {
    final text = _messageController.text.trim();
    if (text.isNotEmpty) {
      context.read<ChatBloc>().add(ChatSendPressed(text));
      _messageController.clear();
      _scrollToBottom();
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    });
  }

  void _requestDocument() {
    String? selectedDocType;
    String? studentId;

    showModalBottomSheet(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => Container(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                "Request a Document",
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                decoration: const InputDecoration(labelText: "Document Type"),
                items: const [
                  DropdownMenuItem(
                    value: "copy_of_grades",
                    child: Text("Copy of Grades"),
                  ),
                  DropdownMenuItem(
                    value: "copy_of_enrollment",
                    child: Text("Copy of Enrollment"),
                  ),
                  DropdownMenuItem(value: "other", child: Text("Other")),
                ],
                onChanged: (value) => setState(() => selectedDocType = value),
                value: selectedDocType,
              ),
              TextField(
                decoration: const InputDecoration(labelText: "Student ID"),
                onChanged: (value) => studentId = value,
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed:
                    selectedDocType != null && studentId?.isNotEmpty == true
                    ? () {
                        context.read<ChatBloc>().add(
                          ChatRequestDocument(
                            selectedDocType!,
                            studentId: studentId,
                          ),
                        );
                        Navigator.pop(context);
                      }
                    : null,
                child: const Text("Submit Request"),
              ),
              const SizedBox(height: 8),
              ElevatedButton(
                onPressed: () => Navigator.pop(context),
                child: const Text("Close"),
              ),
            ],
          ),
        ),
      ),
    );
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
              onPressed: () {
                Navigator.pop(context);
                // TODO: Implement API call to upload receipt (placeholder)
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text("Receipt uploaded (placeholder)"),
                  ),
                );
                setState(() {
                  _receiptImage = null;
                  _showUploadButton = false;
                });
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
    return Scaffold(
      backgroundColor: const Color(0xFFE3F2FD), // light blue theme
      body: SafeArea(
        child: Column(
          children: [
            // 🔹 Header with Back + Profile + Name
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF2196F3), Color(0xFF1976D2)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              child: Row(
                children: [
                  // Back Button
                  IconButton(
                    icon: const Icon(Icons.arrow_back, color: Colors.white),
                    onPressed: () => Navigator.pop(context),
                  ),
                  const CircleAvatar(
                    backgroundColor: Colors.white,
                    child: Icon(Icons.smart_toy, color: Color(0xFF2196F3)),
                  ),
                  const SizedBox(width: 10),
                  const Text(
                    "Registrar Bot",
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),

            // 🔹 Chat area
            Expanded(
              child: BlocListener<ChatBloc, ChatState>(
                listener: (context, state) {
                  if (state is ChatLoaded) {
                    _scrollToBottom();
                    if (state.action?.type == 'upload_receipt') {
                      setState(() {
                        _showUploadButton = true;
                      });
                    }
                  }
                },
                child: BlocBuilder<ChatBloc, ChatState>(
                  builder: (context, state) {
                    if (state is ChatLoading) {
                      return const Center(child: CircularProgressIndicator());
                    } else if (state is ChatLoaded) {
                      return ListView.builder(
                        controller: _scrollController,
                        padding: const EdgeInsets.all(8),
                        itemCount: state.messages.length,
                        itemBuilder: (context, index) {
                          final msg = state.messages[index];
                          final isBot = msg.sender == ChatSender.bot;
                          return Align(
                            alignment: isBot
                                ? Alignment.centerLeft
                                : Alignment.centerRight,
                            child: Container(
                              margin: const EdgeInsets.symmetric(vertical: 4),
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: isBot
                                    ? Colors.blue[100]
                                    : Colors.green[100],
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(msg.text),
                            ),
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

            // 🔹 Input and Action area
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.grey[100],
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    offset: const Offset(0, -1),
                    blurRadius: 4,
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _messageController,
                          decoration: InputDecoration(
                            hintText: "Ask Anything...",
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            filled: true,
                            fillColor: Colors.white,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      IconButton(
                        icon: const Icon(Icons.send, color: Color(0xFF2196F3)),
                        onPressed: _sendMessage,
                      ),
                      IconButton(
                        icon: const Icon(
                          Icons.request_page,
                          color: Color(0xFF2196F3),
                        ),
                        onPressed: _requestDocument,
                      ),
                    ],
                  ),
                  if (_showUploadButton && _receiptImage == null)
                    Padding(
                      padding: const EdgeInsets.only(top: 8),
                      child: ElevatedButton.icon(
                        onPressed: _pickReceiptImage,
                        icon: const Icon(Icons.upload_file),
                        label: const Text("Upload Receipt"),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Color(0xFF2196F3),
                        ),
                      ),
                    ),
                  if (_receiptImage != null)
                    Padding(
                      padding: const EdgeInsets.only(top: 8),
                      child: Row(
                        children: [
                          Expanded(
                            child: Text(
                              "Selected: ${_receiptImage!.path.split('/').last}",
                              style: TextStyle(fontSize: 12),
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.check, color: Colors.green),
                            onPressed: _uploadReceipt,
                          ),
                          IconButton(
                            icon: const Icon(Icons.clear, color: Colors.red),
                            onPressed: () =>
                                setState(() => _receiptImage = null),
                          ),
                        ],
                      ),
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
