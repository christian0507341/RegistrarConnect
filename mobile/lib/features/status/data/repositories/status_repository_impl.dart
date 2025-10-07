import 'package:dio/dio.dart';
import 'package:mobile/features/status/domain/repositories/status_repository.dart';
import 'package:mobile/core/services/secure_storage.dart';

class StatusRepositoryImpl implements StatusRepository {
  final Dio _dio;
  final SecureStorageService _storage;

  StatusRepositoryImpl({required Dio dioClient, required SecureStorageService storage})
      : _dio = dioClient,
        _storage = storage;

  @override
  Future<List<Map<String, dynamic>>> getStatuses() async {
    final accessToken = await _storage.readAccess();
    if (accessToken == null || accessToken.isEmpty) {
      throw Exception('No access token available');
    }

    try {
      final response = await _dio.get(
        '/api/document-requests/statuses/',
        options: Options(
          headers: {'Authorization': 'Bearer $accessToken'},
        ),
      );
      return List<Map<String, dynamic>>.from(response.data);
    } catch (e) {
      throw Exception('Failed to load statuses: $e');
    }
  }
}