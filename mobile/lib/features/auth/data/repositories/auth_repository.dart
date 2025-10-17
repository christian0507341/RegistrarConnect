import 'package:dio/dio.dart';
import 'package:mobile/core/services/secure_storage.dart';
import 'package:mobile/features/auth/data/models/auth_response.dart';
import 'package:mobile/features/auth/data/sources/auth_api.dart';
import 'package:mobile/features/auth/domain/entities/auth_user.dart';
import 'package:mobile/features/auth/domain/repositories/auth_repository.dart'
    as domain;

class AuthRepository implements domain.IAuthRepository {
  final AuthApi _api;
  final SecureStorageService _storage;

  AuthRepository({required AuthApi api, required SecureStorageService storage})
    : _api = api,
      _storage = storage;

  @override
  Future<AuthUser> signIn({
    required String role,
    required String email,
    required String password,
  }) async {
    try {
      final AuthResponse res = await _api.login(
        role: role,
        email: email,
        password: password,
      );

      // Persist tokens using YOUR storage API
      await _storage.saveAccess(res.access);
      await _storage.saveRefresh(res.refresh);

      // Map to domain entity expected by your use case
      return AuthUser(role: res.role, name: res.name, email: res.email);
    } on DioException catch (e) {
      String message = 'Login failed';
      final data = e.response?.data;
      if (data is Map<String, dynamic>) {
        // Common DRF/SimpleJWT error shapes
        if (data['detail'] is String) {
          message = data['detail'] as String;
        } else if (data['non_field_errors'] is List && (data['non_field_errors'] as List).isNotEmpty) {
          final first = (data['non_field_errors'] as List).first;
          if (first is String && first.trim().isNotEmpty) message = first;
        } else {
          // Fallback: find first string value in payload
          for (final value in data.values) {
            if (value is String && value.trim().isNotEmpty) {
              message = value; break;
            }
            if (value is List && value.isNotEmpty && value.first is String) {
              message = value.first; break;
            }
          }
        }
      } else if (e.type == DioExceptionType.connectionTimeout ||
                 e.type == DioExceptionType.receiveTimeout ||
                 e.type == DioExceptionType.sendTimeout) {
        message = 'Network timeout. Please try again.';
      } else if (e.type == DioExceptionType.connectionError) {
        message = 'Cannot connect to server. Check your internet or server status.';
      } else if (e.message != null && e.message!.isNotEmpty) {
        message = e.message!;
      }
      throw Exception(message);
    }
  }

  @override
  Future<void> signOut() => _storage.clear();

  @override
  Future<bool> hasSession() async {
    final access = await _storage.readAccess();
    final refresh = await _storage.readRefresh();
    return (access != null && access.isNotEmpty) ||
        (refresh != null && refresh.isNotEmpty);
  }

  @override
  Future<String> refresh() async {
    final refreshToken = await _storage.readRefresh();
    if (refreshToken == null || refreshToken.isEmpty) {
      throw Exception('No refresh token available');
    }
    final newAccess = await _api.refresh(refreshToken);
    await _storage.saveAccess(newAccess);
    return newAccess;
  }
}
