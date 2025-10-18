import 'activity.dart';

class HomeData {
  final int pendingRequests;
  final int upcomingAppointments;
  final int completedRequests;
  final int aiChats;
  final List<DocumentRequest> recentDocuments;
  final List<Appointment> upcomingEvents;
  final List<Activity> recentActivities;

  HomeData({
    required this.pendingRequests,
    required this.upcomingAppointments,
    required this.completedRequests,
    required this.aiChats,
    required this.recentDocuments,
    required this.upcomingEvents,
    required this.recentActivities,
  });
}

class DocumentRequest {
  final String id;
  final String title;
  final String status;
  final DateTime submittedDate;
  final String documentType;

  DocumentRequest({
    required this.id,
    required this.title,
    required this.status,
    required this.submittedDate,
    required this.documentType,
  });
}

class Appointment {
  final String id;
  final String title;
  final DateTime date;
  final String time;
  final String type;

  Appointment({
    required this.id,
    required this.title,
    required this.date,
    required this.time,
    required this.type,
  });
}
