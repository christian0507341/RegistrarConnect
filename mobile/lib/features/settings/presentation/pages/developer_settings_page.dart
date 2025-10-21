import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/theme/theme_bloc.dart';
import 'package:mobile/core/widgets/animated_gradient_background.dart';
import 'package:mobile/core/services/local_notification_service.dart';

class DeveloperSettingsPage extends StatefulWidget {
  const DeveloperSettingsPage({super.key});

  @override
  State<DeveloperSettingsPage> createState() => _DeveloperSettingsPageState();
}

class _DeveloperSettingsPageState extends State<DeveloperSettingsPage> {
  final LocalNotificationService _localNotificationService = LocalNotificationService();
  bool _isTestingNotification = false;

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ThemeBloc, ThemeState>(
      builder: (context, themeState) {
        final isDarkMode = themeState is ThemeLoadedState ? themeState.isDarkMode : false;
        
        return Scaffold(
          appBar: AppBar(
            title: Text(
              "🛠️ Developer Settings",
              style: TextStyle(
                fontWeight: FontWeight.w800,
                fontSize: 24,
                letterSpacing: 0.5,
                color: isDarkMode ? Colors.white : const Color(0xFF1F2937),
              ),
            ),
            elevation: 0,
            backgroundColor: Colors.transparent,
            foregroundColor: isDarkMode ? Colors.white : Colors.grey[800],
            centerTitle: true,
            flexibleSpace: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: isDarkMode 
                    ? [const Color(0xFF1a1a1a), const Color(0xFF2d2d2d)]
                    : [Colors.white, Colors.grey[50]!],
                ),
              ),
            ),
          ),
          body: AnimatedGradientBackground(
            isDarkMode: isDarkMode,
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // Warning banner
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.orange.withAlpha(26),
                    border: Border.all(color: Colors.orange, width: 2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.warning_amber_rounded,
                        color: Colors.orange,
                        size: 32,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          'Developer Mode: These features are for testing purposes only.',
                          style: TextStyle(
                            color: Colors.orange[800],
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                Text(
                  "Notification Testing",
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: isDarkMode ? Colors.white : Colors.black87,
                  ),
                ),
                const SizedBox(height: 12),

                // Test notification buttons
                _buildNotificationTestCard(
                  context,
                  isDarkMode,
                  'Document Status Update',
                  'Test document status change notification',
                  Icons.description,
                  Colors.blue,
                  () => _sendTestNotification('document_status'),
                ),
                const SizedBox(height: 12),

                _buildNotificationTestCard(
                  context,
                  isDarkMode,
                  'Appointment Scheduled',
                  'Test appointment scheduling notification',
                  Icons.event,
                  Colors.green,
                  () => _sendTestNotification('appointment'),
                ),
                const SizedBox(height: 12),

                _buildNotificationTestCard(
                  context,
                  isDarkMode,
                  'Payment Approved',
                  'Test payment approval notification',
                  Icons.payment,
                  Colors.purple,
                  () => _sendTestNotification('payment'),
                ),
                const SizedBox(height: 12),

                _buildNotificationTestCard(
                  context,
                  isDarkMode,
                  'Receipt Uploaded',
                  'Test receipt upload notification',
                  Icons.receipt,
                  Colors.teal,
                  () => _sendTestNotification('receipt'),
                ),
                const SizedBox(height: 12),

                _buildNotificationTestCard(
                  context,
                  isDarkMode,
                  'Document Ready to Claim',
                  'Test ready to claim notification',
                  Icons.check_circle,
                  Colors.orange,
                  () => _sendTestNotification('ready_to_claim'),
                ),
                const SizedBox(height: 12),

                _buildNotificationTestCard(
                  context,
                  isDarkMode,
                  'Document Rejected',
                  'Test rejection notification',
                  Icons.cancel,
                  Colors.red,
                  () => _sendTestNotification('rejected'),
                ),
                const SizedBox(height: 12),

                _buildNotificationTestCard(
                  context,
                  isDarkMode,
                  'System Announcement',
                  'Test system announcement notification',
                  Icons.announcement,
                  Colors.indigo,
                  () => _sendTestNotification('system'),
                ),
                const SizedBox(height: 24),

                // Send all notifications button
                Card(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  elevation: 8,
                  child: ListTile(
                    leading: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [Colors.blue, Colors.purple],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(
                        Icons.notifications_active,
                        color: Colors.white,
                      ),
                    ),
                    title: const Text(
                      'Send All Test Notifications',
                      style: TextStyle(fontWeight: FontWeight.w600),
                    ),
                    subtitle: const Text(
                      'Trigger all notification types at once',
                      style: TextStyle(fontSize: 12),
                    ),
                    trailing: _isTestingNotification
                        ? const SizedBox(
                            width: 24,
                            height: 24,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.send),
                    onTap: _isTestingNotification ? null : _sendAllTestNotifications,
                  ),
                ),
                const SizedBox(height: 40),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildNotificationTestCard(
    BuildContext context,
    bool isDarkMode,
    String title,
    String subtitle,
    IconData icon,
    Color color,
    VoidCallback onTap,
  ) {
    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      elevation: 8,
      shadowColor: color.withAlpha(51),
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: color.withAlpha(26),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(
            icon,
            color: color,
          ),
        ),
        title: Text(
          title,
          style: TextStyle(
            fontWeight: FontWeight.w600,
            color: isDarkMode ? Colors.white : Colors.black87,
          ),
        ),
        subtitle: Text(
          subtitle,
          style: TextStyle(
            fontSize: 12,
            color: isDarkMode ? Colors.white70 : Colors.black54,
          ),
        ),
        trailing: Icon(
          Icons.send,
          color: color,
        ),
        onTap: onTap,
      ),
    );
  }

  Future<void> _sendTestNotification(String type) async {
    setState(() {
      _isTestingNotification = true;
    });

    try {
      // Request notification permissions first
      final hasPermission = await _requestNotificationPermissions();
      if (!hasPermission) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Row(
                children: [
                  const Icon(Icons.error, color: Colors.white),
                  const SizedBox(width: 8),
                  const Expanded(
                    child: Text('Notification permission denied. Please enable it in your phone settings.'),
                  ),
                ],
              ),
              backgroundColor: Colors.red,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              duration: const Duration(seconds: 4),
            ),
          );
        }
        setState(() {
          _isTestingNotification = false;
        });
        return;
      }

      final now = DateTime.now();
      // Use a smaller ID that fits in 32-bit integer (0 to 2147483647)
      final notificationId = (now.millisecondsSinceEpoch % 2147483647).toInt();
      
      debugPrint('🧪 Sending test notification: $type (ID: $notificationId)');
      
      // Use LocalNotificationService directly to bypass settings checks
      switch (type) {
        case 'document_status':
          await _localNotificationService.showDocumentStatusNotification(
            documentType: 'OTR',
            oldStatus: 'pending',
            newStatus: 'on_process',
            requestId: notificationId,
          );
          break;
        
        case 'appointment':
          await _localNotificationService.showAppointmentNotification(
            documentType: 'COE',
            facultyName: 'Test Faculty',
            schedule: now.add(const Duration(days: 2)),
            appointmentId: notificationId,
          );
          break;
        
        case 'payment':
          await _localNotificationService.showPaymentNotification(
            documentType: 'COG',
            isApproved: true,
            requestId: notificationId,
          );
          break;
        
        case 'receipt':
          await _localNotificationService.showReceiptNotification(
            documentType: 'OTR',
            requestId: notificationId,
          );
          break;
        
        case 'ready_to_claim':
          await _localNotificationService.showNotification(
            id: notificationId,
            title: '✅ Document Ready to Claim',
            body: 'Your OTR is ready to claim! Please visit the registrar office with your receipt.',
            payload: 'ready_to_claim_${notificationId}_OTR_Test Student',
          );
          break;
        
        case 'rejected':
          await _localNotificationService.showNotification(
            id: notificationId,
            title: '❌ Request Rejected',
            body: 'Your COE request was rejected: Incomplete requirements - Please submit valid ID',
            payload: 'rejected_${notificationId}_COE',
          );
          break;
        
        case 'system':
          await _localNotificationService.showSystemAnnouncement(
            title: 'System Maintenance',
            message: 'The system will undergo maintenance on Dec 25, 2024 from 2:00 AM to 6:00 AM',
            announcementId: notificationId,
          );
          break;
      }

      debugPrint('✅ Test notification sent successfully: $type');
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.check_circle, color: Colors.white),
                const SizedBox(width: 8),
                Expanded(
                  child: Text('Test notification sent: $type\nCheck your notification bar!'),
                ),
              ],
            ),
            backgroundColor: Colors.green,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            duration: const Duration(seconds: 3),
          ),
        );
      }
    } catch (e) {
      debugPrint('❌ Failed to send test notification: $e');
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.error, color: Colors.white),
                const SizedBox(width: 8),
                Expanded(
                  child: Text('Failed to send notification: $e'),
                ),
              ],
            ),
            backgroundColor: Colors.red,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isTestingNotification = false;
        });
      }
    }
  }

  Future<bool> _requestNotificationPermissions() async {
    try {
      // This will trigger the permission dialog
      await _localNotificationService.initialize();
      debugPrint('✅ Notification permissions initialized');
      return true;
    } catch (e) {
      debugPrint('❌ Failed to request notification permissions: $e');
      return false;
    }
  }

  Future<void> _sendAllTestNotifications() async {
    setState(() {
      _isTestingNotification = true;
    });

    final types = [
      'document_status',
      'appointment',
      'payment',
      'receipt',
      'ready_to_claim',
      'rejected',
      'system',
    ];

    for (final type in types) {
      await _sendTestNotification(type);
      await Future.delayed(const Duration(milliseconds: 500));
    }

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.check_circle, color: Colors.white),
              const SizedBox(width: 8),
              Text('Sent ${types.length} test notifications!'),
            ],
          ),
          backgroundColor: Colors.green,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          duration: const Duration(seconds: 3),
        ),
      );
    }

    setState(() {
      _isTestingNotification = false;
    });
  }
}

