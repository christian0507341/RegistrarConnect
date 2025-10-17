import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Service to manage theme preferences using secure storage
class ThemeService {
  static const String _kThemeKey = 'theme_mode';
  
  final FlutterSecureStorage _storage;

  ThemeService([FlutterSecureStorage? storage])
      : _storage = storage ?? const FlutterSecureStorage();

  /// Save theme mode preference
  Future<void> saveThemeMode(bool isDarkMode) async {
    await _storage.write(key: _kThemeKey, value: isDarkMode.toString());
  }

  /// Get current theme mode preference
  Future<bool> getThemeMode() async {
    final String? themeMode = await _storage.read(key: _kThemeKey);
    return themeMode == 'true';
  }

  /// Clear theme preference
  Future<void> clearThemeMode() async {
    await _storage.delete(key: _kThemeKey);
  }
}

