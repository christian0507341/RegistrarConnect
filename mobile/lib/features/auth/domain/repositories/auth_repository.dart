import 'package:mobile/features/auth/domain/entities/auth_user.dart';

abstract class IAuthRepository {
  /// Returns AuthUser on success; throws on failure.
  Future<AuthUser> signIn({
    required String role,
    required String email,
    required String password,
  });

  Future<void> signOut();

  Future<bool> hasSession();
}
