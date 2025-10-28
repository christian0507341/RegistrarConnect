import '../../domain/entities/activity.dart';
import '../../domain/entities/home_data.dart';
import '../../domain/repositories/activity_repository.dart';
import 'package:mobile/core/services/conversation_services.dart';
import 'package:mobile/features/document_requests/data/sources/document_request_api.dart';

class ActivityRepositoryImpl implements IActivityRepository {
  final ConversationService _conversationService = ConversationService();
  final DocumentRequestApi _documentRequestApi = DocumentRequestApi();
  
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
  @override
  Future<HomeData> getHomeData() async {
    try {
      // Fetch real document request data
      final documentRequests = await _documentRequestApi.getDocumentRequests();
      
      // Count document requests by status
      int pendingRequests = documentRequests.where((req) {
        final status = req['status'] as String?;
        return status != null && ['pending', 'on_process', 'awaiting_payment'].contains(status);
      }).length;
      
      int completedRequests = documentRequests.where((req) {
        final status = req['status'] as String?;
        return status != null && ['ready_to_claim', 'completed', 'rejected'].contains(status);
      }).length;
      
      // Count AI chats from conversations
      final conversations = await _conversationService.getConversationHistory();
      int totalChats = conversations.length;
      
      // Home data processed successfully
      
      return HomeData(
        pendingRequests: pendingRequests,
        upcomingAppointments: 2, // Keep mock data for now
        completedRequests: completedRequests,
        aiChats: totalChats,
      recentDocuments: _buildRecentDocuments(documentRequests),
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
    } catch (e) {
      // Error fetching home data - using fallback data
      // Return fallback data if there's an error
      return HomeData(
        pendingRequests: 0,
        upcomingAppointments: 2,
        completedRequests: 0,
        aiChats: 0,
        recentDocuments: [],
        upcomingEvents: [],
        recentActivities: _activities,
      );
    }
  }

  List<DocumentRequest> _buildRecentDocuments(List<Map<String, dynamic>> documentRequests) {
    // Sort by submission date and take the most recent 3
    final sortedRequests = documentRequests
      ..sort((a, b) {
        final dateA = DateTime.tryParse(a['requested_at'] ?? a['created_at'] ?? '') ?? DateTime(1970);
        final dateB = DateTime.tryParse(b['requested_at'] ?? b['created_at'] ?? '') ?? DateTime(1970);
        return dateB.compareTo(dateA);
      });
    
    return sortedRequests.take(3).map((req) {
      final status = req['status'] as String? ?? 'Unknown';
      final documentType = req['document_type'] as String? ?? 'Unknown';
      final submittedDate = DateTime.tryParse(req['requested_at'] ?? req['created_at'] ?? '') ?? DateTime.now();
      
      return DocumentRequest(
        id: req['id']?.toString() ?? '0',
        title: '$documentType Request',
        status: status,
        submittedDate: submittedDate,
        documentType: documentType,
      );
    }).toList();
  }
}
