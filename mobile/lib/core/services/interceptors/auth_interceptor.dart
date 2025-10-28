import 'package:dio/dio.dart';
import '../../constants/endpoints.dart';
import '../secure_storage.dart';

/// Adds `Authorization: Bearer <access>` to outgoing requests (except auth endpoints).
class AuthInterceptor extends Interceptor {
  AuthInterceptor(this._storage);

  final SecureStorageService _storage;

  bool _isPublicAuthPath(String path) =>
      path.startsWith(Endpoints.token) ||
      path.startsWith(Endpoints.tokenRefresh) ||
      path.startsWith(Endpoints.register);

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    if (!_isPublicAuthPath(options.path)) {
      final token = await _storage.readAccess();
      if (token != null && token.isNotEmpty) {
        options.headers['Authorization'] = 'Bearer $token';
      }
    }
    handler.next(options);
  }
}
