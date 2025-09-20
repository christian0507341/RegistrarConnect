import 'dart:math';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:dio/dio.dart';

class ConversationService {
  static const _key = 'conversation_id';
  final FlutterSecureStorage storage;
  final Dio dio;

  ConversationService({Dio? dioInstance, FlutterSecureStorage? s})
    : dio = dioInstance ??
        Dio(BaseOptions(
          baseUrl: "http://192.168.68.115:8000/api", // your backend API
          connectTimeout: const Duration(milliseconds: 5000),
          receiveTimeout: const Duration(milliseconds: 5000), 
        )),
      storage = s ?? const FlutterSecureStorage();


  Future<String> getOrCreate() async {
    final existing = await storage.read(key: _key);
    if (existing != null && existing.isNotEmpty) return existing;

    final id = _generateId();
    await storage.write(key: _key, value: id);
    return id;
  }

  String _generateId() {
    final rand = Random();
    final r = rand.nextInt(0x7fffffff);
    final ts = DateTime.now().millisecondsSinceEpoch;
    return 'm-$ts-$r';
  }

  Future<String> sendMessage(String conversationId, String message) async {
    final response = await dio.post(
      "/ai/chat/",
      data: {
        "conversation_id": conversationId,
        "text": message,
      },
    );

    if (response.statusCode == 200) {
      final msgData = response.data["message"];
      return msgData?["text"] ?? "No reply from server";
    } else {
      throw Exception("Failed to send message");
    }
  }
}
