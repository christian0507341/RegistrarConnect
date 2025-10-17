import 'package:get_it/get_it.dart';
import 'package:flutter/foundation.dart';
import 'package:mobile/features/status/domain/usecases/get_statuses.dart';
import 'package:mobile/features/status/presentation/bloc/status_bloc.dart';
import 'package:mobile/features/status/data/repositories/status_repository_impl.dart';
import 'package:mobile/features/status/domain/repositories/status_repository.dart';
import 'package:mobile/core/services/dio_client.dart';
import 'package:mobile/core/services/secure_storage.dart';
import 'package:mobile/core/services/theme_service.dart';
import 'package:mobile/features/theme/presentation/bloc/theme_bloc.dart';
import 'package:mobile/core/services/notification_service.dart';
import 'package:mobile/features/notifications/data/repositories/notification_repository_impl.dart';
import 'package:mobile/features/notifications/domain/repositories/notification_repository.dart';

final sl = GetIt.instance;

Future<void> init() async {
  // External
  final secureStorage = SecureStorageService();
  sl.registerLazySingleton(() => secureStorage);
  sl.registerLazySingleton(() => DioClient(secureStorage).dio);
  
  // Services
  sl.registerLazySingleton(() => ThemeService());
  sl.registerLazySingleton(() => NotificationService());
  
  // Initialize notification service
  await sl<NotificationService>().initialize();
  // Request permissions (with error handling)
  try {
    await sl<NotificationService>().requestPermissions();
  } catch (e) {
    debugPrint('Failed to request notification permissions: $e');
    // Continue app initialization even if permissions fail
  }
  
  // Bloc
  sl.registerFactory(() => StatusBloc(getStatusesUseCase: sl()));
  sl.registerFactory(() => ThemeBloc(themeService: sl()));

  // Use Cases
  sl.registerLazySingleton(() => GetStatusesUseCase(sl()));

  // Repository
  sl.registerLazySingleton<StatusRepository>(
    () => StatusRepositoryImpl(dioClient: sl(), storage: sl()),
  );
  
  sl.registerLazySingleton<INotificationRepository>(
    () => NotificationRepositoryImpl(
      dio: sl(),
      notificationService: sl(),
    ),
  );
}