import 'dart:io';
import 'package:dio/dio.dart';
import 'package:mobile/core/constants/endpoints.dart';

class ReceiptApi {
  ReceiptApi(this._dio);
  final Dio _dio;

  Future<bool> upload({
    required String requestId,
    required String filePath,
  }) async {
    final file = File(filePath);
    final form = FormData.fromMap({
      'request_id': requestId,
      'image': await MultipartFile.fromFile(file.path),
    });

    await _dio.post(Endpoints.receipts, data: form);
    return true; // If no error, assume ok; adjust if your API returns a flag.
  }
}
