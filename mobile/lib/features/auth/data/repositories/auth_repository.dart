import 'dart:convert';
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
  await _storage.saveIsLoggedIn(true);

      // Save cached profile JSON so we can restore UI when offline
      final profileMap = AuthResponse(
        access: res.access,
        refresh: res.refresh,
        role: res.role,
        name: res.name,
        email: res.email,
      ).toJson();
      await _storage.saveCachedProfile(jsonEncode(profileMap));

      // Map to domain entity expected by your use case
      return AuthUser(role: res.role, name: res.name, email: res.email);
    } on DioException catch (e) {
      final serverMsg = e.response?.data is Map<String, dynamic>
          ? (e.response!.data['detail'] ?? e.message)
          : e.message;
      throw Exception(serverMsg ?? 'Login failed');
    }
  }

  @override
  Future<void> signOut() => _storage.clearAuth();

  @override
  Future<bool> hasSession() async {
  final access = await _storage.readAccess();
  final refresh = await _storage.readRefresh();
  final flag = await _storage.readIsLoggedIn();
  return flag || (access != null && access.isNotEmpty) ||
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

  @override
  Future<AuthUser> getCurrentUser() async {
    try {
      final userProfile = await _api.getProfile();
      // Update cached profile
      final profileMap = AuthResponse(
        access: await _storage.readAccess() ?? '',
        refresh: await _storage.readRefresh() ?? '',
        role: userProfile.role,
        name: userProfile.name,
        email: userProfile.email,
      ).toJson();
      await _storage.saveCachedProfile(jsonEncode(profileMap));

      return AuthUser(
        role: userProfile.role,
        name: userProfile.name,
        email: userProfile.email,
      );
    } on DioException catch (e) {
      // On network errors or 5xx, try to return cached profile if available
      final cached = await _storage.readCachedProfile();
      if (cached != null && cached.isNotEmpty) {
        try {
          final Map<String, dynamic> map = jsonDecode(cached) as Map<String, dynamic>;
          final role = map['role'] as String? ?? '';
          final name = map['name'] as String? ?? 'User';
          final email = map['email'] as String? ?? '';
          return AuthUser(role: role, name: name, email: email);
        } catch (_) {
          // fall through to throwing below
        }
      }

      final serverMsg = e.response?.data is Map<String, dynamic>
          ? (e.response!.data['detail'] ?? e.message)
          : e.message;
      throw Exception(serverMsg ?? 'Failed to get user profile');
    }
  }

  @override
  Future<AuthUser?> getCachedUser() async {
    final cached = await _storage.readCachedProfile();
    if (cached == null || cached.isEmpty) return null;
    try {
      final Map<String, dynamic> map = jsonDecode(cached) as Map<String, dynamic>;
      final role = map['role'] as String? ?? '';
      final name = map['name'] as String? ?? 'User';
      final email = map['email'] as String? ?? '';
      return AuthUser(role: role, name: name, email: email);
    } catch (_) {
      return null;
    }
  }
}
