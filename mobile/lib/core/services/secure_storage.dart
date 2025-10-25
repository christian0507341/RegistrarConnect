import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Small wrapper around secure storage so the rest of the app never touches raw keys.
class SecureStorageService {
  static const _kAccessKey = 'access_token';
  static const _kRefreshKey = 'refresh_token';
  static const _kIsLoggedInKey = 'is_logged_in';
  static const _kCachedProfileKey = 'cached_profile_json';

  final FlutterSecureStorage _storage;

  SecureStorageService([FlutterSecureStorage? storage])
    : _storage = storage ?? const FlutterSecureStorage();

  // Save
  Future<void> saveAccess(String token) =>
      _storage.write(key: _kAccessKey, value: token);

  Future<void> saveRefresh(String token) =>
      _storage.write(key: _kRefreshKey, value: token);

  // Read
  Future<String?> readAccess() => _storage.read(key: _kAccessKey);
  Future<String?> readRefresh() => _storage.read(key: _kRefreshKey);

  // Clear everything (or clear specific keys if you prefer)
  Future<void> clear() => _storage.deleteAll();
  
  // Clear only auth tokens (keep other data if needed)
  Future<void> clearAuth() async {
    await _storage.delete(key: _kAccessKey);
    await _storage.delete(key: _kRefreshKey);
    await _storage.delete(key: _kIsLoggedInKey);
    await _storage.delete(key: _kCachedProfileKey);
  }

  // Save/read simple logged-in flag
  Future<void> saveIsLoggedIn(bool value) =>
      _storage.write(key: _kIsLoggedInKey, value: value ? '1' : '0');

  Future<bool> readIsLoggedIn() async {
    final v = await _storage.read(key: _kIsLoggedInKey);
    return v == '1';
  }

  // Cached profile JSON (string) so the app can show authenticated UI when
  // the backend is temporarily unreachable.
  Future<void> saveCachedProfile(String json) =>
      _storage.write(key: _kCachedProfileKey, value: json);

  Future<String?> readCachedProfile() => _storage.read(key: _kCachedProfileKey);
}
