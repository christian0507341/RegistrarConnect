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
    try {
      final hasSession = await _repo.hasSession();
      if (hasSession) {
        // Try to get user profile to verify the session is still valid
        try {
          final user = await _repo.getCurrentUser();
          emit(AuthAuthenticated(user));
        } catch (e) {
          // If getting user profile fails, the session might be expired
          // Try to refresh the token
          try {
            await _repo.refresh();
            final user = await _repo.getCurrentUser();
            emit(AuthAuthenticated(user));
          } catch (refreshError) {
            // If refresh also fails, clear the session and show login
            await _repo.signOut();
            emit(const AuthUnauthenticated());
          }
        }
      } else {
        emit(const AuthUnauthenticated());
      }
    } catch (e) {
      // If any error occurs during session check, assume unauthenticated
      emit(const AuthUnauthenticated());
    }
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
