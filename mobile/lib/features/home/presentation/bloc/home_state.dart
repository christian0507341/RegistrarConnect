import '../../domain/entities/activity.dart';
import '../../domain/entities/home_data.dart';

abstract class HomeState {}

class HomeInitial extends HomeState {}

class HomeLoading extends HomeState {}

class HomeLoaded extends HomeState {
  final List<Activity> activities;
  HomeLoaded(this.activities);
}

class HomeDataLoaded extends HomeState {
  final HomeData homeData;
  HomeDataLoaded(this.homeData);
}

class HomeError extends HomeState {
  final String message;
  HomeError(this.message);
}
