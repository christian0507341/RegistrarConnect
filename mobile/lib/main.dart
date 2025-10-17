import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:dio/dio.dart';

// Auth
import 'features/auth/presentation/pages/login_page.dart';
import 'features/auth/presentation/bloc/auth_bloc.dart';
import 'features/auth/presentation/bloc/auth_state.dart';
import 'features/auth/presentation/bloc/auth_event.dart';
import 'features/auth/domain/repositories/auth_repository.dart';
import 'features/auth/data/repositories/auth_repository.dart' as data;
import 'features/auth/data/sources/auth_api.dart';
import 'core/services/secure_storage.dart';
import 'features/auth/presentation/pages/register_page.dart';

// Onboarding
import 'features/onboarding/presentation/pages/onboarding_screen.dart';

// Home & Notifications
import 'features/home/presentation/pages/home_container.dart';
import 'features/home/presentation/bloc/home_bloc.dart';
import 'features/home/data/repositories/activity_repository_impl.dart';
import 'features/notifications/presentation/bloc/notification_bloc.dart';
import 'features/notifications/domain/repositories/notification_repository.dart';

// Appointment
import 'features/appointment/presentation/bloc/appointment_bloc.dart';
import 'features/appointment/data/repositories/appointment_repository_impl.dart';
import 'features/appointment/presentation/pages/add_appointment_page.dart';

// Chat
import 'features/chat/presentation/pages/chat_page.dart';
import 'features/chat/presentation/bloc/chat_bloc.dart';

// Settings
import 'features/settings/presentation/pages/settings_page.dart';

// Theme
import 'features/theme/presentation/bloc/theme_bloc.dart';
import 'features/theme/presentation/bloc/theme_event.dart';
import 'features/theme/presentation/bloc/theme_state.dart';

// Status
import 'features/status/presentation/pages/status_page.dart';
import 'features/status/presentation/bloc/status_bloc.dart';

// Global wrapper
import 'core/widgets/global_fab_wrapper.dart';

// Unify network client
import 'core/services/dio_client.dart';
import 'injection_container.dart' as di;

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await di.init();
  final secureStorage = SecureStorageService();
  final dioClient = DioClient(secureStorage);
  final Dio dio = dioClient.dio;
  final authApi = AuthApi(dio);
  final IAuthRepository authRepository = data.AuthRepository(
    api: authApi,
    storage: secureStorage,
  );

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
          create: (_) => AuthBloc(repo: authRepository)..add(const CheckSession()),
        ),
        BlocProvider<AppointmentBloc>(
          create: (_) => AppointmentBloc(repository: AppointmentRepositoryImpl()),
        ),
        BlocProvider<HomeBloc>(
          create: (_) => HomeBloc(repository: ActivityRepositoryImpl()),
        ),
        BlocProvider<NotificationBloc>(
          create: (_) => NotificationBloc(repository: di.sl<INotificationRepository>()),
        ),
        BlocProvider<ChatBloc>(create: (_) => ChatBloc()),
        BlocProvider<StatusBloc>(
          create: (_) => StatusBloc(getStatusesUseCase: di.sl()),
        ),
        BlocProvider<ThemeBloc>(
          create: (_) => di.sl<ThemeBloc>()..add(const LoadTheme()),
        ),
      ],
      child: BlocBuilder<ThemeBloc, ThemeState>(
        builder: (context, themeState) {
          return MaterialApp(
            title: 'RegistrarConnect',
            theme: _buildLightTheme(),
            darkTheme: _buildDarkTheme(),
            themeMode: themeState.isDarkMode ? ThemeMode.dark : ThemeMode.light,
            debugShowCheckedModeBanner: false,
            home: BlocListener<AuthBloc, AuthState>(
              listener: (context, state) {
                if (state is AuthUnauthenticated) {
                  Navigator.of(context, rootNavigator: true)
                      .pushNamedAndRemoveUntil('/login', (route) => false);
                } else if (state is AuthAuthenticated) {
                  if (ModalRoute.of(context)?.settings.name == '/') {
                    Navigator.of(context, rootNavigator: true)
                        .pushNamedAndRemoveUntil('/home', (route) => false);
                  }
                }
              },
              child: const OnboardingScreen(), // Initial widget
            ),
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
                case '/home':
                  page = const HomeContainer();
                  showFab = false;
                  break;
                case '/add_appointment':
                  page = AddAppointmentPage(selectedDate: DateTime.now());
                  break;
                case '/settings':
                  page = const SettingsPage();
                  break;
                case '/chat':
                  page = const ChatPage();
                  showFab = false;
                  break;
                case '/status':
                  page = const StatusPage();
                  break;
                default:
                  page = const Scaffold(
                    body: Center(child: Text("Page not found")),
                  );
              }

              return MaterialPageRoute(
                builder: (_) => GlobalFabWrapper(showFab: showFab, child: page),
                settings: settings,
              );
            },
          );
        },
      ),
    );
  }

  ThemeData _buildLightTheme() {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: const Color(0xFF6366F1), // Modern indigo
        brightness: Brightness.light,
      ),
      scaffoldBackgroundColor: const Color(0xFFF8FAFC),
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.transparent,
        foregroundColor: const Color(0xFF1E293B),
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        shadowColor: Colors.transparent,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF6366F1),
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          elevation: 0,
          shadowColor: Colors.transparent,
        ),
      ),
      cardTheme: CardThemeData(
        color: Colors.white,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: BorderSide(color: Colors.grey.shade200, width: 1),
        ),
        shadowColor: Colors.black.withValues(alpha: 0.05),
      ),
      listTileTheme: ListTileThemeData(
        textColor: const Color(0xFF1E293B),
        iconColor: const Color(0xFF64748B),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.grey.shade50,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: Colors.grey.shade200),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: Colors.grey.shade200),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: Color(0xFF6366F1), width: 2),
        ),
      ),
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: Colors.white,
        selectedItemColor: const Color(0xFF6366F1),
        unselectedItemColor: const Color(0xFF64748B),
        elevation: 0,
        type: BottomNavigationBarType.fixed,
      ),
    );
  }

  ThemeData _buildDarkTheme() {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: const Color(0xFF8B5CF6), // Modern purple
        brightness: Brightness.dark,
      ),
      scaffoldBackgroundColor: const Color(0xFF0F0F23),
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.transparent,
        foregroundColor: Colors.white,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        shadowColor: Colors.transparent,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF8B5CF6),
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          elevation: 0,
          shadowColor: Colors.transparent,
        ),
      ),
      cardTheme: CardThemeData(
        color: const Color(0xFF1A1A2E),
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: BorderSide(color: Colors.white.withValues(alpha: 0.1), width: 1),
        ),
        shadowColor: Colors.black.withValues(alpha: 0.3),
      ),
      listTileTheme: ListTileThemeData(
        textColor: Colors.white,
        iconColor: Colors.white70,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: const Color(0xFF1A1A2E),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.1)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.1)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: Color(0xFF8B5CF6), width: 2),
        ),
      ),
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: const Color(0xFF1A1A2E),
        selectedItemColor: const Color(0xFF8B5CF6),
        unselectedItemColor: Colors.white70,
        elevation: 0,
        type: BottomNavigationBarType.fixed,
      ),
    );
  }
}