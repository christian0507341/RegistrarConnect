import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import 'theme_service.dart';

// Events
abstract class ThemeEvent extends Equatable {
  const ThemeEvent();

  @override
  List<Object> get props => [];
}

class ThemeToggled extends ThemeEvent {}

class ThemeLoaded extends ThemeEvent {
  final bool isDarkMode;

  const ThemeLoaded({required this.isDarkMode});

  @override
  List<Object> get props => [isDarkMode];
}

// States
abstract class ThemeState extends Equatable {
  const ThemeState();

  @override
  List<Object> get props => [];
}

class ThemeInitial extends ThemeState {}

class ThemeLoadedState extends ThemeState {
  final bool isDarkMode;

  const ThemeLoadedState({required this.isDarkMode});

  @override
  List<Object> get props => [isDarkMode];
}

// Bloc
class ThemeBloc extends Bloc<ThemeEvent, ThemeState> {
  final ThemeService _themeService;

  ThemeBloc({required ThemeService themeService})
      : _themeService = themeService,
        super(ThemeInitial()) {
    on<ThemeToggled>(_onThemeToggled);
    on<ThemeLoaded>(_onThemeLoaded);
  }

  Future<void> _onThemeToggled(ThemeToggled event, Emitter<ThemeState> emit) async {
    final currentState = state;
    if (currentState is ThemeLoadedState) {
      final newTheme = !currentState.isDarkMode;
      await _themeService.saveTheme(newTheme);
      emit(ThemeLoadedState(isDarkMode: newTheme));
    }
  }

  void _onThemeLoaded(ThemeLoaded event, Emitter<ThemeState> emit) {
    emit(ThemeLoadedState(isDarkMode: event.isDarkMode));
  }

  Future<void> loadTheme() async {
    final isDarkMode = await _themeService.getTheme();
    add(ThemeLoaded(isDarkMode: isDarkMode));
  }
}
