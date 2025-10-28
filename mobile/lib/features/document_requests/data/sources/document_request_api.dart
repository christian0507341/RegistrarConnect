import 'package:dio/dio.dart';
import 'package:mobile/core/constants/endpoints.dart';
import 'package:mobile/core/services/dio_client.dart';
import 'package:mobile/core/services/secure_storage.dart';

class DocumentRequestApi {
  DocumentRequestApi({Dio? dio}) : _dio = dio ?? DioClient(SecureStorageService()).dio;

  final Dio _dio;

  Future<List<Map<String, dynamic>>> getDocumentRequests() async {
    try {
      // Fetching document requests
      final response = await _dio.get(Endpoints.documentRequests);
      
      if (response.data is List) {
        return response.data.cast<Map<String, dynamic>>();
      } else if (response.data is Map<String, dynamic>) {
        final data = response.data as Map<String, dynamic>;
        if (data['results'] is List) {
          return (data['results'] as List).cast<Map<String, dynamic>>();
        }
      }
      return [];
    } catch (e) {
      // Error fetching document requests
      return [];
    }
  }

  Future<List<Map<String, dynamic>>> getStudentTransactions() async {
    try {
      // Fetching student transactions
      final response = await _dio.get(Endpoints.studentTransactions);
      
      if (response.data is List) {
        return response.data.cast<Map<String, dynamic>>();
      } else if (response.data is Map<String, dynamic>) {
        final data = response.data as Map<String, dynamic>;
        if (data['results'] is List) {
          return (data['results'] as List).cast<Map<String, dynamic>>();
        }
      }
      return [];
    } catch (e) {
      // Error fetching student transactions
      return [];
    }
  }
}
