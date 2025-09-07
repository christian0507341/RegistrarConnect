import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Small wrapper around secure storage so the rest of the app never touches raw keys.
class SecureStorageService {
  static const _kAccessKey = 'access_token';
  static const _kRefreshKey = 'refresh_token';

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
}
