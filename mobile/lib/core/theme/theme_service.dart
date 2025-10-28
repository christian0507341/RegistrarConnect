import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ThemeService {
  static const String _themeKey = 'is_dark_mode';
  final FlutterSecureStorage _storage;

  ThemeService({FlutterSecureStorage? storage})
      : _storage = storage ?? const FlutterSecureStorage();

  Future<bool> getTheme() async {
    final themeValue = await _storage.read(key: _themeKey);
    return themeValue == 'true';
  }

  Future<void> saveTheme(bool isDarkMode) async {
    await _storage.write(key: _themeKey, value: isDarkMode.toString());
  }
}
