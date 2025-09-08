import 'package:mobile/core/services/secure_storage.dart';
import 'package:mobile/features/auth/data/models/auth_response.dart';
import 'package:mobile/features/auth/data/sources/auth_api.dart';
import 'package:mobile/features/auth/domain/entities/auth_user.dart';
import 'package:mobile/features/auth/domain/repositories/auth_repository.dart'
    as domain;

class AuthRepository implements domain.IAuthRepository {
  AuthRepository({required AuthApi api, required SecureStorageService storage})
    : _api = api,
      _storage = storage;

  final AuthApi _api;
  final SecureStorageService _storage;

  AuthUser _toEntity(AuthResponse dto) =>
      AuthUser(name: dto.name, email: dto.email, role: dto.role);

  @override
  Future<AuthUser> signIn({
    required String role,
    required String email,
    required String password,
  }) async {
    final res = await _api.login(role: role, email: email, password: password);
    await _storage.saveAccess(res.access);
    await _storage.saveRefresh(res.refresh);
    return _toEntity(res);
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
}
