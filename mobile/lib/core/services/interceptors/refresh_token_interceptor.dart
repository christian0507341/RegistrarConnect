import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../../constants/endpoints.dart';
import '../secure_storage.dart';

/// Transparently refreshes the access token once on a 401, then retries the request.
class RefreshTokenInterceptor extends Interceptor {
  RefreshTokenInterceptor(this._storage, this._baseDio);

  final SecureStorageService _storage;

  /// A plain Dio without interceptors to call the refresh endpoint,
  /// so we don't recurse. Must be created with BaseOptions(baseUrl: Endpoints.baseUrl).
  final Dio _baseDio;

  static const _kRetriedKey = 'x-retried-once';

  bool _isAuthPath(String path) =>
      path.startsWith(Endpoints.token) ||
      path.startsWith(Endpoints.tokenRefresh);

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    final res = err.response;
    final req = err.requestOptions;

    final alreadyRetried = req.extra[_kRetriedKey] == true;

    if (res?.statusCode == 401 && !alreadyRetried && !_isAuthPath(req.path)) {
      final refresh = await _storage.readRefresh();
      if (refresh == null || refresh.isEmpty) {
        return handler.next(err); // no refresh token, bubble up
      }

      try {
        // NOTE: In Dio v5, Options no longer supports `baseUrl`.
        // `_baseDio` must already have `baseUrl` set via BaseOptions.
        final refreshResp = await _baseDio.post(
          Endpoints.tokenRefresh,
          data: {'refresh': refresh},
          options: Options(headers: {'Content-Type': 'application/json'}),
        );

        final newAccess = refreshResp.data['access'] as String?;
        if (newAccess == null || newAccess.isEmpty) {
          return handler.next(err);
        }

        // Persist new access and retry original request with the new header.
        await _storage.saveAccess(newAccess);

        final cloned = await _retryWithNewAccess(newAccess, req);
        return handler.resolve(cloned);
      } catch (e, st) {
        if (kDebugMode) {
          // You might want to log out on refresh failure elsewhere (BLoC / router guard).
          debugPrint('Refresh failed: $e\n$st');
        }
      }
    }

    handler.next(err);
  }

  Future<Response<dynamic>> _retryWithNewAccess(
    String access,
    RequestOptions req,
  ) {
    final dio = Dio()
      ..options = BaseOptions(
        baseUrl: Endpoints.baseUrl,
        sendTimeout: req.sendTimeout,
        connectTimeout: req.connectTimeout,
        receiveTimeout: req.receiveTimeout,
        responseType: req.responseType,
        headers: Map<String, dynamic>.from(req.headers)
          ..['Authorization'] = 'Bearer $access',
      );

    // Mark as retried to avoid infinite loops.
    final extra = Map<String, dynamic>.from(req.extra)..[_kRetriedKey] = true;

    return dio.fetch<dynamic>(req.copyWith(extra: extra));
  }
}
