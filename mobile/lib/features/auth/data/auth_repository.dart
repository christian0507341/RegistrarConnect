import '../../../core/services/secure_storage.dart';
import 'auth_api.dart';
import 'models/auth_response.dart';

class AuthRepository {
  AuthRepository({required AuthApi api, required SecureStorageService storage})
    : _api = api,
      _storage = storage;

  final AuthApi _api;
  final SecureStorageService _storage;

  /// Calls /api/token/, saves tokens, and returns the session payload.
  Future<AuthResponse> signIn({
    required String role,
    required String email,
    required String password,
  }) async {
    final res = await _api.login(role: role, email: email, password: password);
    await _storage.saveAccess(res.access);
    await _storage.saveRefresh(res.refresh);
    // Optionally save profile fields if you added helpers:
    // await _storage.saveString('user_role', res.role);
    // await _storage.saveString('user_name', res.name);
    // await _storage.saveString('user_email', res.email);
    return res;
  }

  Future<void> signOut() => _storage.clear();

  Future<bool> hasSession() async {
    final access = await _storage.readAccess();
    final refresh = await _storage.readRefresh();
    return (access != null && access.isNotEmpty) ||
        (refresh != null && refresh.isNotEmpty);
  }
}
