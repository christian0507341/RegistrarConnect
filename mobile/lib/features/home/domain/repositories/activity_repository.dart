import '../entities/activity.dart';
import '../entities/home_data.dart';

abstract class IActivityRepository {
  Future<List<Activity>> getRecentActivities();
  Future<HomeData> getHomeData();
}
