import '../../domain/entities/activity.dart';
import '../../domain/repositories/activity_repository.dart';

class ActivityRepositoryImpl implements IActivityRepository {
  final List<Activity> _activities = [
    Activity(title: "Request Updated", timestamp: DateTime.now().subtract(const Duration(hours: 2))),
    Activity(title: "Appointment Confirmed", timestamp: DateTime.now().subtract(const Duration(days: 1))),
    Activity(title: "Request Approved", timestamp: DateTime.now().subtract(const Duration(days: 2))),
  ];

  @override
  Future<List<Activity>> getRecentActivities() async {
    await Future.delayed(const Duration(milliseconds: 200)); // simulate delay
    return _activities;
  }
}
