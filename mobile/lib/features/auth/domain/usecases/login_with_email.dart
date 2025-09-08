import 'package:mobile/features/auth/domain/entities/auth_user.dart';
import 'package:mobile/features/auth/domain/repositories/auth_repository.dart';

class LoginWithEmail {
  final IAuthRepository repo;
  const LoginWithEmail(this.repo);

  Future<AuthUser> call({
    required String role,
    required String email,
    required String password,
  }) {
    return repo.signIn(role: role, email: email, password: password);
  }
}
