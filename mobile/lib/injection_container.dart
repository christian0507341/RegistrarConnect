import 'package:get_it/get_it.dart';
import 'package:dio/dio.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'core/services/secure_storage.dart';
import 'core/services/dio_client.dart';
import 'core/network/network_info.dart';
import 'features/status/data/datasources/status_remote_data_source.dart';
import 'features/status/data/repositories/status_repository_impl.dart';
import 'features/status/domain/repositories/status_repository.dart';
import 'features/status/domain/usecases/get_statuses_use_case.dart';
import 'features/status/presentation/bloc/status_bloc.dart';

final sl = GetIt.instance;

Future<void> init() async {
  final secureStorage = SecureStorageService();
  final dioClient = DioClient(secureStorage);
  
  sl.registerLazySingleton(() => StatusBloc(getStatusesUseCase: sl()));
  sl.registerLazySingleton(() => GetStatusesUseCase(sl()));
  sl.registerLazySingleton<StatusRepository>(() => StatusRepositoryImpl(
        remoteDataSource: sl(),
        networkInfo: sl(),
      ));
  sl.registerLazySingleton<StatusRemoteDataSource>(
      () => StatusRemoteDataSourceImpl(dio: sl(), secureStorage: sl()));
  sl.registerLazySingleton<NetworkInfo>(() => NetworkInfoImpl(sl()));
  sl.registerLazySingleton(() => dioClient.dio);
  sl.registerLazySingleton(() => secureStorage);
  sl.registerLazySingleton(() => Connectivity());
}