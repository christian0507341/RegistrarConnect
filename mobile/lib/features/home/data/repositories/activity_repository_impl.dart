import '../../domain/entities/activity.dart';
import '../../domain/entities/home_data.dart';
import '../../domain/repositories/activity_repository.dart';

class ActivityRepositoryImpl implements IActivityRepository {
  final List<Activity> _activities = [
    Activity(title: "OTR Request Submitted", timestamp: DateTime.now().subtract(const Duration(hours: 2))),
    Activity(title: "Appointment Confirmed", timestamp: DateTime.now().subtract(const Duration(days: 1))),
    Activity(title: "COG Request Approved", timestamp: DateTime.now().subtract(const Duration(days: 2))),
    Activity(title: "COE Request Processing", timestamp: DateTime.now().subtract(const Duration(days: 3))),
    Activity(title: "Chat with AI Assistant", timestamp: DateTime.now().subtract(const Duration(hours: 4))),
  ];

  @override
  Future<List<Activity>> getRecentActivities() async {
    await Future.delayed(const Duration(milliseconds: 200)); // simulate delay
    return _activities;
  }

  // New method to get comprehensive home data
  Future<HomeData> getHomeData() async {
    await Future.delayed(const Duration(milliseconds: 300)); // simulate delay
    
    return HomeData(
      pendingRequests: 3,
      upcomingAppointments: 2,
      completedRequests: 12,
      aiChats: 5,
      recentDocuments: [
        DocumentRequest(
          id: "1",
          title: "OTR Request",
          status: "Pending",
          submittedDate: DateTime.now().subtract(const Duration(days: 1)),
          documentType: "OTR",
        ),
        DocumentRequest(
          id: "2",
          title: "COG Request",
          status: "Approved",
          submittedDate: DateTime.now().subtract(const Duration(days: 3)),
          documentType: "COG",
        ),
        DocumentRequest(
          id: "3",
          title: "COE Request",
          status: "Processing",
          submittedDate: DateTime.now().subtract(const Duration(days: 5)),
          documentType: "COE",
        ),
      ],
      upcomingEvents: [
        Appointment(
          id: "1",
          title: "Document Review Meeting",
          date: DateTime.now().add(const Duration(days: 1)),
          time: "2:00 PM",
          type: "Meeting",
        ),
        Appointment(
          id: "2",
          title: "Appointment with Registrar",
          date: DateTime.now().add(const Duration(days: 5)),
          time: "10:00 AM",
          type: "Appointment",
        ),
      ],
      recentActivities: _activities,
    );
  }
}
