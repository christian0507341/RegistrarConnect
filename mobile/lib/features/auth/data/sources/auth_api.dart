import 'package:dio/dio.dart';
import 'package:mobile/core/constants/endpoints.dart';
import 'package:mobile/features/auth/data/models/auth_response.dart';

class AuthApi {
  AuthApi(this._dio);
  final Dio _dio;

  /// POST /api/token/  Body: { role, email, password }
  Future<AuthResponse> login({
    required String role,
    required String email,
    required String password,
  }) async {
    final resp = await _dio.post<Map<String, dynamic>>(
      Endpoints.token,
      data: {'role': role, 'email': email, 'password': password},
    );
    return AuthResponse.fromJson(resp.data!);
  }

  /// POST /api/token/refresh/  Body: { refresh }
  Future<String> refresh(String refreshToken) async {
    final resp = await _dio.post<Map<String, dynamic>>(
      Endpoints.tokenRefresh,
      data: {'refresh': refreshToken},
    );
    return resp.data!['access'] as String;
  }

  /// GET /api/accounts/me/ - Get current user profile
  Future<AuthResponse> getProfile() async {
    try {
      final resp = await _dio.get<Map<String, dynamic>>(Endpoints.me);
      return AuthResponse.fromJson(resp.data!);
    } on DioException catch (e) {
      // If the server is using the older /api/auth/me/ path, try that as a fallback
      if (e.response?.statusCode == 404) {
        final resp = await _dio.get<Map<String, dynamic>>('/api/auth/me/');
        return AuthResponse.fromJson(resp.data!);
      }
      rethrow;
    }
  }
}
