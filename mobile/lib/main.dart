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
import 'features/home/presentation/pages/home_container.dart';
import 'features/home/presentation/bloc/home_bloc.dart';
import 'features/home/data/repositories/activity_repository_impl.dart';
import 'features/notifications/presentation/bloc/notification_bloc.dart';
import 'features/notifications/data/repositories/notification_repository_impl.dart';

// Appointment
import 'features/appointment/presentation/bloc/appointment_bloc.dart';
import 'features/appointment/data/repositories/appointment_repository_impl.dart';

// Chat
import 'features/chat/presentation/pages/chat_page.dart';
import 'features/chat/presentation/bloc/chat_bloc.dart';

// Settings
import 'features/settings/presentation/pages/settings_page.dart';

// Global wrapper
import 'core/widgets/global_fab_wrapper.dart';

// ✅ Unify network client
import 'core/services/dio_client.dart';

// Theme
import 'core/theme/theme_bloc.dart';
import 'core/theme/theme_service.dart';
import 'core/theme/app_themes.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  final secureStorage = SecureStorageService();
  final themeService = ThemeService();

  final dioClient = DioClient(secureStorage);
  final Dio dio = dioClient.dio;

  final authApi = AuthApi(dio);
  final IAuthRepository authRepository = data.AuthRepository(
    api: authApi,
    storage: secureStorage,
  );

  runApp(MyApp(
    authRepository: authRepository, 
    dioClient: dioClient,
    themeService: themeService,
  ));
}

class MyApp extends StatelessWidget {
  final IAuthRepository authRepository;
  final DioClient dioClient;
  final ThemeService themeService;
  
  const MyApp({
    super.key, 
    required this.authRepository, 
    required this.dioClient,
    required this.themeService,
  });

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider<AuthBloc>(create: (_) => AuthBloc(repo: authRepository)),
        BlocProvider<AppointmentBloc>(
          create: (_) =>
              AppointmentBloc(repository: AppointmentRepositoryImpl(dioClient)),
        ),
        BlocProvider<HomeBloc>(
          create: (_) => HomeBloc(repository: ActivityRepositoryImpl()),
        ),
        BlocProvider<NotificationBloc>(
          create: (_) =>
              NotificationBloc(repository: NotificationRepositoryImpl()),
        ),
        BlocProvider<ChatBloc>(create: (_) => ChatBloc()),
        BlocProvider<ThemeBloc>(
          create: (_) => ThemeBloc(themeService: themeService)..loadTheme(),
        ),
      ],
      child: BlocBuilder<ThemeBloc, ThemeState>(
        builder: (context, themeState) {
          final isDarkMode = themeState is ThemeLoadedState ? themeState.isDarkMode : false;
          
          return MaterialApp(
            title: 'RegistrarConnect',
            theme: AppThemes.lightTheme,
            darkTheme: AppThemes.darkTheme,
            themeMode: isDarkMode ? ThemeMode.dark : ThemeMode.light,
            debugShowCheckedModeBanner: false,
            initialRoute: '/',
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
                  showFab =
                      false; // 🔧 Turn off global FAB; HomePage has its own FAB
                  break;
                case '/settings':
                  page = const SettingsPage();
                  break;
                case '/chat':
                  page = const ChatPage();
                  showFab = false;
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
}
