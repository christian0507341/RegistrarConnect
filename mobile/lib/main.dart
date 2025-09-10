import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:dio/dio.dart';

import 'features/auth/presentation/pages/login_page.dart';
import 'features/auth/presentation/bloc/auth_bloc.dart';
import 'features/auth/domain/repositories/auth_repository.dart';
import 'features/auth/data/repositories/auth_repository.dart' as data;
import 'features/auth/data/sources/auth_api.dart';
import 'core/services/secure_storage.dart';

// Import Onboarding
import 'features/onboarding/presentation/pages/onboarding_screen.dart';

void main() {
  final dio = Dio(BaseOptions(
    baseUrl: "http://localhost:8000",
    connectTimeout: const Duration(seconds: 5),
    receiveTimeout: const Duration(seconds: 5),
  ));

  final authApi = AuthApi(dio);
  final secureStorage = SecureStorageService();

  final IAuthRepository authRepository =
      data.AuthRepository(api: authApi, storage: secureStorage);

  runApp(MyApp(authRepository: authRepository));
}

class MyApp extends StatelessWidget {
  final IAuthRepository authRepository;
  const MyApp({super.key, required this.authRepository});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider<AuthBloc>(
          create: (_) => AuthBloc(repo: authRepository),
        ),
      ],
      child: MaterialApp(
        title: 'RegistrarConnect',
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        ),
        debugShowCheckedModeBanner: false,
        home: const OnboardingScreen(), // 👈 start with onboarding
        routes: {
          '/login': (context) => const LoginPage(), // 👈 define login route
          '/chat': (context) => const Scaffold(
                body: Center(child: Text("Chat Page")),
              ),
        },
      ),
    );
  }
}
