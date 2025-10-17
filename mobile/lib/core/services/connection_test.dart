import 'package:dio/dio.dart';
import '../constants/endpoints.dart';

class ConnectionTest {
  static Future<bool> testBackendConnection() async {
    try {
      final dio = Dio();
      final response = await dio.get(
        '${Endpoints.baseUrl}/api/',
        options: Options(
          connectTimeout: const Duration(seconds: 10),
          receiveTimeout: const Duration(seconds: 10),
        ),
      );
      return response.statusCode == 200;
    } catch (e) {
      print('Connection test failed: $e');
      return false;
    }
  }

  static Future<void> printConnectionInfo() async {
    print('🔍 Testing backend connection...');
    print('📍 Base URL: ${Endpoints.baseUrl}');
    
    final isConnected = await testBackendConnection();
    if (isConnected) {
      print('✅ Backend connection successful!');
    } else {
      print('❌ Backend connection failed!');
      print('💡 Make sure your Django server is running:');
      print('   cd backend && python manage.py runserver 0.0.0.0:8000');
    }
  }
}