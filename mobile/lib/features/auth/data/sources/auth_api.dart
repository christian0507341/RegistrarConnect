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
}
