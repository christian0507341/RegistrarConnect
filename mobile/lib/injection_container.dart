import 'package:get_it/get_it.dart';
import 'package:mobile/features/status/domain/usecases/get_statuses.dart';
import 'package:mobile/features/status/presentation/bloc/status_bloc.dart';
import 'package:mobile/features/status/data/repositories/status_repository_impl.dart';
import 'package:mobile/features/status/domain/repositories/status_repository.dart';
import 'package:mobile/core/services/dio_client.dart';
import 'package:mobile/core/services/secure_storage.dart';

final sl = GetIt.instance;

Future<void> init() async {
  // Bloc
  sl.registerFactory(() => StatusBloc(getStatusesUseCase: sl()));

  // Use Cases
  sl.registerLazySingleton(() => GetStatusesUseCase(sl()));

  // Repository
  sl.registerLazySingleton<StatusRepository>(
    () => StatusRepositoryImpl(dioClient: sl(), storage: sl()),
  );

  // External
  final secureStorage = SecureStorageService();
  sl.registerLazySingleton(() => secureStorage);
  sl.registerLazySingleton(() => DioClient(secureStorage).dio);
}