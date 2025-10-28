abstract class HomeEvent {}

class LoadActivities extends HomeEvent {
  final bool showLoading;
  
  LoadActivities({this.showLoading = true});
}

class LoadHomeData extends HomeEvent {
  final bool showLoading;
  
  LoadHomeData({this.showLoading = true});
}