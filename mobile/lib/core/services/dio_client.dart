import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../constants/endpoints.dart';
import 'interceptors/auth_interceptor.dart';
import 'interceptors/refresh_token_interceptor.dart';
import 'secure_storage.dart';

class DioClient {
  DioClient(this._storage)
    : dio = Dio(
        BaseOptions(
          baseUrl: Endpoints.baseUrl,
          connectTimeout: const Duration(seconds: 10),
          receiveTimeout: const Duration(seconds: 20),
          headers: const {'Content-Type': 'application/json'},
          responseType: ResponseType.json,
        ),
      ) {
    // A bare Dio (no interceptors) only for hitting the refresh endpoint
    final bare = Dio(BaseOptions(baseUrl: Endpoints.baseUrl));

    dio.interceptors.addAll([
      AuthInterceptor(_storage),
      RefreshTokenInterceptor(_storage, bare),
      if (kDebugMode) _prettyLogger(),
    ]);
  }

  final SecureStorageService _storage;
  final Dio dio;

  Interceptor _prettyLogger() {
    // Minimal logger without extra dependency; feel free to swap for pretty_dio_logger
    return InterceptorsWrapper(
      onRequest: (options, handler) {
        debugPrint('--> ${options.method} ${options.baseUrl}${options.path}');
        if (options.data != null) debugPrint('Payload: ${options.data}');
        handler.next(options);
      },
      onResponse: (response, handler) {
        debugPrint(
          '<-- ${response.statusCode} ${response.requestOptions.path}',
        );
        handler.next(response);
      },
      onError: (e, handler) {
        debugPrint(
          'xxx ${e.response?.statusCode} ${e.requestOptions.path} :: ${e.message}',
        );
        handler.next(e);
      },
    );
  }
}
