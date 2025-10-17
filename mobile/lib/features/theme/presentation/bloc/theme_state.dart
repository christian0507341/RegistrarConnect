import 'package:equatable/equatable.dart';

class ThemeState extends Equatable {
  final bool isDarkMode;
  final bool isLoading;
  final String? error;

  const ThemeState({
    required this.isDarkMode,
    this.isLoading = false,
    this.error,
  });

  ThemeState copyWith({
    bool? isDarkMode,
    bool? isLoading,
    String? error,
  }) {
    return ThemeState(
      isDarkMode: isDarkMode ?? this.isDarkMode,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }

  @override
  List<Object?> get props => [isDarkMode, isLoading, error];
}

