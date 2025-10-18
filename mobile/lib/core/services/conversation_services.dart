import 'dart:math';
import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ConversationService {
  static const _key = 'conversation_id';
  static const _historyKey = 'conversation_history';
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

  Future<String> createNewConversation() async {
    final id = _generateId();
    await storage.write(key: _key, value: id);
    
    // Add to history
    await _addToHistory(id);
    
    return id;
  }

  Future<void> _addToHistory(String conversationId) async {
    try {
      final historyJson = await storage.read(key: _historyKey);
      List<Map<String, dynamic>> history = [];
      
      if (historyJson != null) {
        final List<dynamic> decoded = jsonDecode(historyJson);
        history = decoded.cast<Map<String, dynamic>>();
      }
      
      // Add new conversation to history
      history.insert(0, {
        'id': conversationId,
        'timestamp': DateTime.now().toIso8601String(),
        'lastMessage': null,
        'messageCount': 0,
      });
      
      // Keep only last 50 conversations
      if (history.length > 50) {
        history = history.take(50).toList();
      }
      
      await storage.write(key: _historyKey, value: jsonEncode(history));
    } catch (e) {
      // Handle error silently for now
      print('Error adding to history: $e');
    }
  }

  Future<List<Map<String, dynamic>>> getConversationHistory() async {
    try {
      final historyJson = await storage.read(key: _historyKey);
      if (historyJson == null) return [];
      
      final List<dynamic> decoded = jsonDecode(historyJson);
      return decoded.cast<Map<String, dynamic>>().map((item) {
        return {
          'id': item['id'],
          'timestamp': DateTime.parse(item['timestamp']),
          'lastMessage': item['lastMessage'],
          'messageCount': item['messageCount'] ?? 0,
        };
      }).toList();
    } catch (e) {
      print('Error loading history: $e');
      return [];
    }
  }

  Future<void> updateConversationLastMessage(String conversationId, String message) async {
    try {
      final historyJson = await storage.read(key: _historyKey);
      if (historyJson == null) return;
      
      final List<dynamic> decoded = jsonDecode(historyJson);
      final List<Map<String, dynamic>> history = decoded.cast<Map<String, dynamic>>();
      
      final index = history.indexWhere((item) => item['id'] == conversationId);
      if (index != -1) {
        history[index]['lastMessage'] = message;
        history[index]['messageCount'] = (history[index]['messageCount'] ?? 0) + 1;
        history[index]['timestamp'] = DateTime.now().toIso8601String();
        
        await storage.write(key: _historyKey, value: jsonEncode(history));
      }
    } catch (e) {
      print('Error updating conversation: $e');
    }
  }

  Future<void> deleteConversation(String conversationId) async {
    try {
      final historyJson = await storage.read(key: _historyKey);
      if (historyJson == null) return;
      
      final List<dynamic> decoded = jsonDecode(historyJson);
      final List<Map<String, dynamic>> history = decoded.cast<Map<String, dynamic>>();
      
      history.removeWhere((item) => item['id'] == conversationId);
      
      await storage.write(key: _historyKey, value: jsonEncode(history));
    } catch (e) {
      print('Error deleting conversation: $e');
    }
  }

  String _generateId() {
    final rand = Random();
    final r = rand.nextInt(0x7fffffff);
    final ts = DateTime.now().millisecondsSinceEpoch;
    return 'conv-$ts-$r';
  }
}
