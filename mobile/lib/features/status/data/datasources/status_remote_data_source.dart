import 'dart:convert';
import 'package:dio/dio.dart';
import '../../../../core/error/exceptions.dart';
import '../../../../core/services/secure_storage.dart';
import '../models/status_model.dart';

abstract class StatusRemoteDataSource {
  Future<List<StatusModel>> getStatuses();
}

class StatusRemoteDataSourceImpl implements StatusRemoteDataSource {
  final Dio dio;
  final SecureStorageService secureStorage;

  StatusRemoteDataSourceImpl({
    required this.dio,
    required this.secureStorage,
  });

  @override
  Future<List<StatusModel>> getStatuses() async {
    try {
      // ✅ Use the proper method from SecureStorageService
      final token = await secureStorage.readAccess();
      if (token == null) {
        throw ServerException();
      }

      final response = await dio.get(
        'http://10.0.2.2:8000/api/statuses/',
        options: Options(
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $token',
          },
        ),
      );

      if (response.statusCode == 200) {
        // ✅ Ensure the data is parsed correctly
        final List<dynamic> jsonList = response.data is String
            ? jsonDecode(response.data)
            : response.data;

        return jsonList
            .map((json) => StatusModel.fromJson(json))
            .toList();
      } else {
        throw ServerException();
      }
    } catch (e) {
      // Optionally log the error for debugging
      // print('Error fetching statuses: $e');
      throw ServerException();
    }
  }
}
