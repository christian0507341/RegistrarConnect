import 'package:equatable/equatable.dart';

abstract class AuthEvent extends Equatable {
  const AuthEvent();
  @override
  List<Object?> get props => [];
}

class CheckSession extends AuthEvent {
  const CheckSession();
}

class LoginRequested extends AuthEvent {
  final String role; // "student"
  final String email;
  final String password;
  const LoginRequested({
    required this.role,
    required this.email,
    required this.password,
  });

  @override
  List<Object?> get props => [role, email, password];
}

class LogoutRequested extends AuthEvent {
  const LogoutRequested();
}
