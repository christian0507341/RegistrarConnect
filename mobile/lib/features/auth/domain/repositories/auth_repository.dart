import 'package:mobile/features/auth/domain/entities/auth_user.dart';

abstract class IAuthRepository {
  Future<AuthUser> signIn({
    required String role,
    required String email,
    required String password,
  });

  Future<void> signOut();
  Future<bool> hasSession();

  /// Optional but useful if you ever call refresh outside the interceptor.
  Future<String> refresh();
}
