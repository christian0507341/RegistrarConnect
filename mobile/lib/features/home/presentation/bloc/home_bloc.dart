import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/repositories/activity_repository.dart';
import 'home_event.dart';
import 'home_state.dart';

class HomeBloc extends Bloc<HomeEvent, HomeState> {
  final IActivityRepository repository;

  HomeBloc({required this.repository}) : super(HomeInitial()) {
    on<LoadActivities>((event, emit) async {
      // Only show loading screen on initial load, not on refresh
      if (event.showLoading) {
        emit(HomeLoading());
      }
      
      try {
        final activities = await repository.getRecentActivities();
        emit(HomeLoaded(activities));
      } catch (e) {
        emit(HomeError(e.toString()));
      }
    });

    on<LoadHomeData>((event, emit) async {
      // Only show loading screen on initial load, not on refresh
      if (event.showLoading) {
        emit(HomeLoading());
      }
      
      try {
        final homeData = await repository.getHomeData();
        emit(HomeDataLoaded(homeData));
      } catch (e) {
        emit(HomeError(e.toString()));
      }
    });
  }
}
