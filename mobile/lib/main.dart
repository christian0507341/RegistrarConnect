import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:dio/dio.dart';

// Auth
import 'features/auth/presentation/pages/login_page.dart';
import 'features/auth/presentation/bloc/auth_bloc.dart';
import 'features/auth/domain/repositories/auth_repository.dart';
import 'features/auth/data/repositories/auth_repository.dart' as data;
import 'features/auth/data/sources/auth_api.dart';
import 'core/services/secure_storage.dart';
import 'features/auth/presentation/pages/register_page.dart';

// Onboarding
import 'features/onboarding/presentation/pages/onboarding_screen.dart';

// Home & Notifications
import 'features/home/presentation/pages/home_page.dart';
import 'features/home/presentation/pages/home_container.dart';
import 'features/home/presentation/bloc/home_bloc.dart';
import 'features/home/data/repositories/activity_repository_impl.dart';
import 'features/notifications/presentation/pages/notification_page.dart';
import 'features/notifications/presentation/bloc/notification_bloc.dart';
import 'features/notifications/data/repositories/notification_repository_impl.dart';

// Appointment
import 'features/appointment/presentation/bloc/appointment_bloc.dart';
import 'features/appointment/data/repositories/appointment_repository_impl.dart';
import 'features/appointment/presentation/pages/calendar_page.dart';
import 'features/appointment/presentation/pages/add_appointment_page.dart';

// Global wrapper
import 'core/widgets/global_fab_wrapper.dart';

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
        BlocProvider<AppointmentBloc>(
          create: (_) => AppointmentBloc(repository: AppointmentRepositoryImpl()),
        ),
        BlocProvider<HomeBloc>(
          create: (_) => HomeBloc(repository: ActivityRepositoryImpl()),
        ),
        BlocProvider<NotificationBloc>(
          create: (_) => NotificationBloc(repository: NotificationRepositoryImpl()),
        ),
      ],
      child: MaterialApp(
        title: 'RegistrarConnect',
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        ),
        debugShowCheckedModeBanner: false,
        home: const HomeContainer(),
        onGenerateRoute: (settings) {
          late Widget page;
          bool showFab = true;

          switch (settings.name) {
            case '/':
              page = const OnboardingScreen();
              showFab = false;
              break;
            case '/login':
              page = const LoginPage();
              showFab = false;
              break;
            case '/register':
              page = const RegisterPage();
              showFab = false;
              break;
            case '/add_appointment':
              page = AddAppointmentPage(selectedDate: DateTime.now());
              break;
            default:
              page = const Scaffold(
                body: Center(child: Text("Page not found")),
              );
          }

          return MaterialPageRoute(
            builder: (_) => GlobalFabWrapper(
              child: page,
              showFab: showFab,
            ),
            settings: settings,
          );
        },
      ),
    );
  }
}
