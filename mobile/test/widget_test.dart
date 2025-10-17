// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/main.dart';
import 'package:mobile/features/auth/domain/repositories/auth_repository.dart';
import 'package:mobile/features/auth/data/repositories/auth_repository.dart' as data;
import 'package:mobile/core/services/secure_storage.dart';
import 'package:mobile/core/services/dio_client.dart';
import 'package:mobile/features/auth/data/sources/auth_api.dart';
import 'package:dio/dio.dart';

void main() {
  testWidgets('App loads without crashing', (WidgetTester tester) async {
    // Create mock dependencies for testing
    final secureStorage = SecureStorageService();
    final dioClient = DioClient(secureStorage);
    final Dio dio = dioClient.dio;
    final authApi = AuthApi(dio);
    final IAuthRepository authRepository = data.AuthRepository(
      api: authApi,
      storage: secureStorage,
    );

    // Build our app and trigger a frame.
    await tester.pumpWidget(MyApp(authRepository: authRepository));

    // Verify that the app loads (we expect to see onboarding or login screen)
    expect(find.byType(MaterialApp), findsOneWidget);
  });
}
