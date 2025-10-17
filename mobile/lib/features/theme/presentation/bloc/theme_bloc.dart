import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/services/theme_service.dart';
import 'package:mobile/features/theme/presentation/bloc/theme_event.dart';
import 'package:mobile/features/theme/presentation/bloc/theme_state.dart';

class ThemeBloc extends Bloc<ThemeEvent, ThemeState> {
  final ThemeService _themeService;

  ThemeBloc({required ThemeService themeService})
      : _themeService = themeService,
        super(const ThemeState(isDarkMode: false, isLoading: true)) {
    on<LoadTheme>(_onLoadTheme);
    on<ToggleTheme>(_onToggleTheme);
    on<SetTheme>(_onSetTheme);
  }

  Future<void> _onLoadTheme(LoadTheme event, Emitter<ThemeState> emit) async {
    try {
      emit(state.copyWith(isLoading: true, error: null));
      final isDarkMode = await _themeService.getThemeMode();
      emit(state.copyWith(isDarkMode: isDarkMode, isLoading: false));
    } catch (e) {
      emit(state.copyWith(
        isLoading: false,
        error: 'Failed to load theme preference: $e',
      ));
    }
  }

  Future<void> _onToggleTheme(ToggleTheme event, Emitter<ThemeState> emit) async {
    try {
      final newThemeMode = !state.isDarkMode;
      await _themeService.saveThemeMode(newThemeMode);
      emit(state.copyWith(isDarkMode: newThemeMode));
    } catch (e) {
      emit(state.copyWith(error: 'Failed to toggle theme: $e'));
    }
  }

  Future<void> _onSetTheme(SetTheme event, Emitter<ThemeState> emit) async {
    try {
      await _themeService.saveThemeMode(event.isDarkMode);
      emit(state.copyWith(isDarkMode: event.isDarkMode));
    } catch (e) {
      emit(state.copyWith(error: 'Failed to set theme: $e'));
    }
  }
}

