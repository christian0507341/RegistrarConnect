import 'dart:math';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ConversationService {
  static const _key = 'conversation_id';
  final FlutterSecureStorage storage;

  ConversationService([FlutterSecureStorage? s])
    : storage = s ?? const FlutterSecureStorage();

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
}
