import 'package:flutter/material.dart';
import 'package:mobile/core/services/secure_storage.dart';
import 'package:mobile/features/home/presentation/pages/home_container.dart';
import 'package:mobile/features/auth/presentation/pages/login_page.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const RegistrarApp());
}

class RegistrarApp extends StatelessWidget {
  const RegistrarApp({super.key});

  Future<bool> _hasSession() async {
    final s = SecureStorageService();
    final a = await s.readAccess();
    final r = await s.readRefresh();
    return (a != null && a.isNotEmpty) || (r != null && r.isNotEmpty);
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'RegistrarConnect',
      home: FutureBuilder<bool>(
        future: _hasSession(),
        builder: (context, snap) {
          if (!snap.hasData) {
            return const Scaffold(
              body: Center(child: CircularProgressIndicator()),
            );
          }
          return snap.data! ? const HomeContainer() : const LoginPage();
        },
      ),
    );
  }
}
