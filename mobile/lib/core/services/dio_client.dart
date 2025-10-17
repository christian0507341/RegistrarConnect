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
          connectTimeout: const Duration(seconds: 30),
          receiveTimeout: const Duration(seconds: 60),
          sendTimeout: const Duration(seconds: 30),
          headers: const {'Content-Type': 'application/json'},
          responseType: ResponseType.json,
          followRedirects: true,
          maxRedirects: 3,
        ),
      ) {
    // A bare Dio (no interceptors) only for hitting the refresh endpoint to avoid recursion
    final bare = Dio(BaseOptions(
      baseUrl: Endpoints.baseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 60),
      sendTimeout: const Duration(seconds: 30),
    ));

    dio.interceptors.addAll([
      AuthInterceptor(_storage),
      RefreshTokenInterceptor(_storage, bare),
      if (kDebugMode)
        LogInterceptor(
          // Don’t log headers to avoid exposing tokens
          request: true,
          requestHeader: false,
          requestBody: true,
          responseHeader: false,
          responseBody: true,
          error: true,
          logPrint: (obj) => debugPrint(obj.toString()),
        ),
    ]);
  }

  final SecureStorageService _storage;
  final Dio dio;
}
