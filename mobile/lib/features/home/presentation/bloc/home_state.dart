import '../../domain/entities/activity.dart';

abstract class HomeState {}

class HomeInitial extends HomeState {}

class HomeLoading extends HomeState {}

class HomeLoaded extends HomeState {
  final List<Activity> activities;
  HomeLoaded(this.activities);
}

class HomeError extends HomeState {
  final String message;
  HomeError(this.message);
}
