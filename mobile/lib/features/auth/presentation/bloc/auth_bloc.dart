import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/features/auth/domain/repositories/auth_repository.dart';
import 'package:mobile/features/auth/domain/usecases/login_with_email.dart';

import 'auth_event.dart';
import 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  AuthBloc({required IAuthRepository repo})
    : _repo = repo,
      _login = LoginWithEmail(repo),
      super(const AuthInitial()) {
    on<CheckSession>(_onCheckSession);
    on<LoginRequested>(_onLoginRequested);
    on<LogoutRequested>(_onLogoutRequested);
  }

  final IAuthRepository _repo;
  final LoginWithEmail _login;

  Future<void> _onCheckSession(
    CheckSession event,
    Emitter<AuthState> emit,
  ) async {
    final has = await _repo.hasSession();
    emit(has ? const AuthUnauthenticated() : const AuthUnauthenticated());
    // (When you add a profile endpoint, you can emit AuthAuthenticated with cached user.)
  }

  Future<void> _onLoginRequested(
    LoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoading());
    try {
      final user = await _login(
        role: event.role,
        email: event.email,
        password: event.password,
      );
      emit(AuthAuthenticated(user));
    } catch (e) {
      emit(AuthError(e.toString()));
      emit(const AuthUnauthenticated());
    }
  }

  Future<void> _onLogoutRequested(
    LogoutRequested event,
    Emitter<AuthState> emit,
  ) async {
    await _repo.signOut();
    emit(const AuthUnauthenticated());
  }
}
