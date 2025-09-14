import '../entities/activity.dart';

abstract class IActivityRepository {
  Future<List<Activity>> getRecentActivities();
}
