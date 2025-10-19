import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/theme/theme_bloc.dart';
import 'package:mobile/core/widgets/animated_gradient_background.dart';
import 'package:mobile/core/constants/endpoints.dart';
import 'package:mobile/core/services/dio_client.dart';
import 'package:mobile/core/services/secure_storage.dart';
import 'package:mobile/features/notifications/presentation/bloc/notification_bloc.dart';
import 'package:mobile/features/notifications/presentation/bloc/notification_event.dart';
import 'package:dio/dio.dart';

class StatusPage extends StatefulWidget {
  const StatusPage({super.key});

  @override
  State<StatusPage> createState() => _StatusPageState();
}

class _StatusPageState extends State<StatusPage> {
  List<Map<String, dynamic>> _transactions = [];
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadTransactions();
    // Set up periodic refresh every 30 seconds
    _startPeriodicRefresh();
  }

  void _startPeriodicRefresh() {
    Future.delayed(const Duration(seconds: 30), () {
      if (mounted) {
        _loadTransactions(silent: true);
        _startPeriodicRefresh(); // Schedule next refresh
      }
    });
  }

  void _showStatusChangeNotification(String documentType, String oldStatus, String newStatus) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              Icon(
                Icons.notifications_active,
                color: Colors.white,
                size: 20,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'Status Update',
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      '$documentType: $oldStatus → $newStatus',
                      style: const TextStyle(
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          backgroundColor: Colors.blue[600],
          duration: const Duration(seconds: 4),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      );
    }
  }

  void _triggerLocalNotification(String documentType, String oldStatus, String newStatus, int requestId) {
    // Trigger local notification through NotificationBloc
    final notificationBloc = BlocProvider.of<NotificationBloc>(context);
    notificationBloc.add(ShowDocumentStatusNotification(
      documentType: documentType,
      oldStatus: oldStatus,
      newStatus: newStatus,
      requestId: requestId,
    ));
  }

  void _triggerPaymentNotification(String documentType, bool isApproved, int requestId) {
    // Trigger payment notification through NotificationBloc
    final notificationBloc = BlocProvider.of<NotificationBloc>(context);
    notificationBloc.add(ShowPaymentNotification(
      documentType: documentType,
      isApproved: isApproved,
      requestId: requestId,
    ));
  }

  void _triggerReceiptNotification(String documentType, int requestId) {
    // Trigger receipt notification through NotificationBloc
    final notificationBloc = BlocProvider.of<NotificationBloc>(context);
    notificationBloc.add(ShowReceiptNotification(
      documentType: documentType,
      requestId: requestId,
    ));
  }

  Future<void> _loadTransactions({bool silent = false}) async {
    if (!silent) {
      setState(() {
        _isLoading = true;
        _errorMessage = null;
      });
    }
    
    try {
      // Initialize Dio client with authentication
      final secureStorage = SecureStorageService();
      final dioClient = DioClient(secureStorage);
      final dio = dioClient.dio;
      
      // Make API call to fetch student transactions
      final response = await dio.get(
        '${Endpoints.baseUrl}${Endpoints.studentTransactions}',
        options: Options(
          headers: {
            'Content-Type': 'application/json',
          },
        ),
      );
      
      if (response.statusCode == 200) {
        final data = response.data;
        final newTransactions = List<Map<String, dynamic>>.from(data['transactions'] ?? []);
        
        // Check if there are any changes and track specific status changes
        bool hasChanges = false;
        List<Map<String, String>> statusChanges = [];
        
        if (newTransactions.length != _transactions.length) {
          hasChanges = true;
        } else {
          for (int i = 0; i < newTransactions.length; i++) {
            final oldTransaction = _transactions[i];
            final newTransaction = newTransactions[i];
            
            if (oldTransaction['status'] != newTransaction['status'] ||
                oldTransaction['payment_approved'] != newTransaction['payment_approved'] ||
                oldTransaction['document_approved'] != newTransaction['document_approved'] ||
                oldTransaction['current_status'] != newTransaction['current_status'] ||
                oldTransaction['last_updated'] != newTransaction['last_updated']) {
              hasChanges = true;
              
              // Track specific status changes
              if (oldTransaction['status'] != newTransaction['status']) {
                statusChanges.add({
                  'document_type': newTransaction['document_type'],
                  'old_status': oldTransaction['status'],
                  'new_status': newTransaction['status'],
                });
              }
            }
          }
        }
        
        setState(() {
          _transactions = newTransactions;
          _isLoading = false;
          _errorMessage = null;
        });
        
        // Show notifications for specific changes
        if (hasChanges && !silent && mounted) {
          if (statusChanges.isNotEmpty) {
            // Show specific status change notifications
            for (final change in statusChanges) {
              _showStatusChangeNotification(
                change['document_type']!,
                change['old_status']!,
                change['new_status']!,
              );
              
              // Trigger local notification
              _triggerLocalNotification(
                change['document_type']!,
                change['old_status']!,
                change['new_status']!,
                int.tryParse(change['request_id']?.toString() ?? '0') ?? 0,
              );
            }
          } else {
            // Check for payment/document approval changes
            for (int i = 0; i < newTransactions.length; i++) {
              final oldTransaction = _transactions[i];
              final newTransaction = newTransactions[i];
              
              // Check for payment approval changes
              if (oldTransaction['payment_approved'] != newTransaction['payment_approved']) {
                _triggerPaymentNotification(
                  newTransaction['document_type'],
                  newTransaction['payment_approved'],
                  newTransaction['id'],
                );
              }
              
              // Check for document approval changes
              if (oldTransaction['document_approved'] != newTransaction['document_approved']) {
                _triggerReceiptNotification(
                  newTransaction['document_type'],
                  newTransaction['id'],
                );
              }
            }
            
            // Show general update notification
            _showUpdateNotification();
          }
        }
      } else {
        throw Exception('Failed to load transactions: ${response.statusCode}');
      }
    } catch (e) {
      setState(() {
        _isLoading = false;
        _errorMessage = e.toString();
      });
      
      // Show error message only if it's not a silent update
      if (!silent && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                Icon(
                  Icons.error_outline,
                  color: Colors.white,
                  size: 20,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Failed to load transactions: ${e.toString()}',
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
            backgroundColor: Colors.red[600],
            duration: const Duration(seconds: 4),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
        );
      }
    }
  }

  void _showUpdateNotification() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(
              Icons.update,
              color: Colors.white,
              size: 20,
            ),
            const SizedBox(width: 8),
            const Text(
              'Transaction status updated!',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
        backgroundColor: Colors.green[600],
        duration: const Duration(seconds: 3),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
    );
  }

  String _getStatusText(Map<String, dynamic> transaction) {
    final status = transaction['status'] as String;
    final currentStatus = transaction['current_status'] as String? ?? status;
    final paymentApproved = transaction['payment_approved'] as bool? ?? false;
    final documentApproved = transaction['document_approved'] as bool? ?? false;

    // Use current_status from action table if available, otherwise fall back to main status
    final effectiveStatus = currentStatus;

    // Check for rejected status first (both in current_status and main status)
    if (effectiveStatus == 'rejected' || status == 'rejected') {
      return '❌ REJECTED - You can request another document';
    } else if (effectiveStatus == 'cancelled' || status == 'cancelled') {
      return 'Cancelled';
    } else if (effectiveStatus == 'ready_to_claim' && paymentApproved && documentApproved) {
      return '✅ Ready to Claim';
    } else if (effectiveStatus == 'ready_to_claim') {
      return '✅ Ready to Claim';
    } else if (effectiveStatus == 'on_process') {
      return '⏳ Processing Document';
    } else if (effectiveStatus == 'pending') {
      if (paymentApproved && documentApproved) {
        return '✅ Both Approved - Processing';
      } else if (paymentApproved && !documentApproved) {
        return '✅ Payment Approved - Document Pending';
      } else if (!paymentApproved && documentApproved) {
        return '✅ Document Approved - Payment Pending';
      } else {
        return '⏳ Pending Review';
      }
    }
    
    return 'Processing';
  }

  Color _getStatusColor(Map<String, dynamic> transaction) {
    final status = transaction['status'] as String;
    final currentStatus = transaction['current_status'] as String? ?? status;
    final paymentApproved = transaction['payment_approved'] as bool? ?? false;
    final documentApproved = transaction['document_approved'] as bool? ?? false;

    // Use current_status from action table if available
    final effectiveStatus = currentStatus;

    // Check for rejected status first (both in current_status and main status)
    if (effectiveStatus == 'rejected' || status == 'rejected') {
      return Colors.red[600] ?? Colors.red;
    } else if (effectiveStatus == 'cancelled' || status == 'cancelled') {
      return Colors.grey;
    } else if (effectiveStatus == 'ready_to_claim') {
      return Colors.green;
    } else if (effectiveStatus == 'on_process') {
      return Colors.orange;
    } else if (effectiveStatus == 'pending') {
      if (paymentApproved || documentApproved) {
        return Colors.orange;
      }
      return Colors.blue;
    }
    
    return Colors.grey;
  }

  IconData _getStatusIcon(Map<String, dynamic> transaction) {
    final status = transaction['status'] as String;
    final currentStatus = transaction['current_status'] as String? ?? status;
    final paymentApproved = transaction['payment_approved'] as bool? ?? false;
    final documentApproved = transaction['document_approved'] as bool? ?? false;

    // Use current_status from action table if available
    final effectiveStatus = currentStatus;

    // Check for rejected status first (both in current_status and main status)
    if (effectiveStatus == 'rejected' || status == 'rejected') {
      return Icons.cancel;
    } else if (effectiveStatus == 'cancelled' || status == 'cancelled') {
      return Icons.cancel_outlined;
    } else if (effectiveStatus == 'ready_to_claim') {
      return Icons.check_circle;
    } else if (effectiveStatus == 'on_process') {
      return Icons.hourglass_empty;
    } else if (effectiveStatus == 'pending') {
      if (paymentApproved || documentApproved) {
        return Icons.hourglass_empty;
      }
      return Icons.pending;
    }
    
    return Icons.info;
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ThemeBloc, ThemeState>(
      builder: (context, themeState) {
        final isDarkMode = themeState is ThemeLoadedState ? themeState.isDarkMode : false;
        
        return Scaffold(
          backgroundColor: Colors.transparent,
          appBar: AppBar(
            title: const Text(
              "Transaction Status",
              style: TextStyle(fontWeight: FontWeight.w600),
            ),
            elevation: 0,
            backgroundColor: Colors.transparent,
            foregroundColor: Theme.of(context).primaryColor,
            actions: [
              IconButton(
                icon: const Icon(Icons.refresh),
                onPressed: _loadTransactions,
              ),
            ],
          ),
          body: AnimatedGradientBackground(
            isDarkMode: isDarkMode,
            child: _isLoading
                ? const Center(
                    child: CircularProgressIndicator(),
                  )
                : _errorMessage != null
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.error_outline,
                              size: 64,
                              color: Colors.red.withValues(alpha: 0.7),
                            ),
                            const SizedBox(height: 16),
                            Text(
                              "Failed to load transactions",
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w500,
                                color: Theme.of(context).textTheme.bodyLarge?.color,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              _errorMessage!,
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 14,
                                color: Theme.of(context).textTheme.bodyMedium?.color,
                              ),
                            ),
                            const SizedBox(height: 16),
                            ElevatedButton.icon(
                              onPressed: () => _loadTransactions(),
                              icon: const Icon(Icons.refresh),
                              label: const Text('Retry'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Theme.of(context).primaryColor,
                                foregroundColor: Colors.white,
                              ),
                            ),
                          ],
                        ),
                      )
                    : _transactions.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.inbox_outlined,
                                  size: 64,
                                  color: Theme.of(context).primaryColor.withValues(alpha: 0.5),
                                ),
                                const SizedBox(height: 16),
                                Text(
                                  "No transactions found",
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.w500,
                                    color: Theme.of(context).textTheme.bodyLarge?.color,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  "Your document requests will appear here",
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: Theme.of(context).textTheme.bodyMedium?.color,
                                  ),
                                ),
                                const SizedBox(height: 16),
                                ElevatedButton.icon(
                                  onPressed: () => _loadTransactions(),
                                  icon: const Icon(Icons.refresh),
                                  label: const Text('Refresh'),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Theme.of(context).primaryColor,
                                    foregroundColor: Colors.white,
                                  ),
                                ),
                              ],
                            ),
                          )
                        : RefreshIndicator(
                            onRefresh: () => _loadTransactions(),
                            child: Column(
                              children: [
                                // Show rejected requests banner if any
                                if (_transactions.any((t) => 
                                    t['current_status'] == 'rejected' || t['status'] == 'rejected'))
                                  Container(
                                    margin: const EdgeInsets.all(16),
                                    padding: const EdgeInsets.all(12),
                                    decoration: BoxDecoration(
                                      color: Colors.red[50],
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(color: Colors.red[200] ?? Colors.red),
                                    ),
                                    child: Row(
                                      children: [
                                        Icon(Icons.info_outline, color: Colors.red[600], size: 20),
                                        const SizedBox(width: 8),
                                        Expanded(
                                          child: Text(
                                            'Some requests were rejected. You can request new documents of the same type.',
                                            style: TextStyle(
                                              color: Colors.red[700],
                                              fontSize: 14,
                                              fontWeight: FontWeight.w500,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                // Transactions list
                                Expanded(
                                  child: ListView.builder(
                                    padding: const EdgeInsets.all(16),
                                    itemCount: _transactions.length,
                                    itemBuilder: (context, index) {
                            final transaction = _transactions[index];
                            final statusText = _getStatusText(transaction);
                            final statusColor = _getStatusColor(transaction);
                            final statusIcon = _getStatusIcon(transaction);

                            // Check if this is a rejected request
                            final isRejected = (transaction['current_status'] == 'rejected' || 
                                               transaction['status'] == 'rejected');
                            
                            return Container(
                              margin: const EdgeInsets.only(bottom: 16),
                              decoration: BoxDecoration(
                                gradient: isRejected 
                                    ? LinearGradient(
                                        colors: [
                                          Colors.red[50] ?? Colors.red.withValues(alpha: 0.1),
                                          Colors.red[100] ?? Colors.red.withValues(alpha: 0.2),
                                        ],
                                        begin: Alignment.topLeft,
                                        end: Alignment.bottomRight,
                                      )
                                    : LinearGradient(
                                        colors: isDarkMode
                                            ? [
                                                const Color(0xFF1E1E1E),
                                                const Color(0xFF2A2A2A),
                                              ]
                                            : [
                                                Colors.white,
                                                const Color(0xFFF8F9FA),
                                              ],
                                        begin: Alignment.topLeft,
                                        end: Alignment.bottomRight,
                                      ),
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(
                                  color: isRejected 
                                      ? Colors.red[300] ?? Colors.red
                                      : statusColor.withValues(alpha: 0.3),
                                  width: isRejected ? 2.0 : 1.5,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: isRejected 
                                        ? Colors.red.withValues(alpha: 0.2)
                                        : statusColor.withValues(alpha: 0.1),
                                    blurRadius: isRejected ? 16 : 12,
                                    offset: const Offset(0, 4),
                                    spreadRadius: isRejected ? 3 : 2,
                                  ),
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: isDarkMode ? 0.3 : 0.1),
                                    blurRadius: 8,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                              ),
                              child: Padding(
                                padding: const EdgeInsets.all(16),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.all(8),
                                          decoration: BoxDecoration(
                                            color: statusColor.withValues(alpha: 0.1),
                                            borderRadius: BorderRadius.circular(8),
                                          ),
                                          child: Icon(
                                            statusIcon,
                                            color: statusColor,
                                            size: 20,
                                          ),
                                        ),
                                        const SizedBox(width: 12),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                transaction['document_type'],
                                                style: TextStyle(
                                                  fontSize: 16,
                                                  fontWeight: FontWeight.w600,
                                                  color: Theme.of(context).textTheme.bodyLarge?.color,
                                                ),
                                              ),
                                              const SizedBox(height: 4),
                                              Text(
                                                statusText,
                                                style: TextStyle(
                                                  fontSize: 14,
                                                  color: statusColor,
                                                  fontWeight: FontWeight.w500,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                          decoration: BoxDecoration(
                                            color: statusColor.withValues(alpha: 0.1),
                                            borderRadius: BorderRadius.circular(12),
                                          ),
                                          child: Text(
                                            statusText.split(' ').first,
                                            style: TextStyle(
                                              fontSize: 12,
                                              fontWeight: FontWeight.w500,
                                              color: statusColor,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 12),
                                    Row(
                                      children: [
                                        Icon(
                                          Icons.payment,
                                          size: 16,
                                          color: transaction['payment_approved'] 
                                              ? Colors.green 
                                              : Colors.grey,
                                        ),
                                        const SizedBox(width: 4),
                                        Text(
                                          'Payment: ${transaction['payment_approved'] ? 'Approved' : 'Pending'}',
                                          style: TextStyle(
                                            fontSize: 12,
                                            color: transaction['payment_approved'] 
                                                ? Colors.green 
                                                : Colors.grey,
                                            fontWeight: FontWeight.w500,
                                          ),
                                        ),
                                        const SizedBox(width: 16),
                                        Icon(
                                          Icons.description,
                                          size: 16,
                                          color: transaction['document_approved'] 
                                              ? Colors.green 
                                              : Colors.grey,
                                        ),
                                        const SizedBox(width: 4),
                                        Text(
                                          'Document: ${transaction['document_approved'] ? 'Approved' : 'Pending'}',
                                          style: TextStyle(
                                            fontSize: 12,
                                            color: transaction['document_approved'] 
                                                ? Colors.green 
                                                : Colors.grey,
                                            fontWeight: FontWeight.w500,
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 8),
                                    Row(
                                      children: [
                                        Icon(
                                          Icons.access_time,
                                          size: 14,
                                          color: Theme.of(context).textTheme.bodyMedium?.color,
                                        ),
                                        const SizedBox(width: 4),
                                        Text(
                                          'Requested: ${transaction['requested_at']}',
                                          style: TextStyle(
                                            fontSize: 12,
                                            color: Theme.of(context).textTheme.bodyMedium?.color,
                                          ),
                                        ),
                                        const SizedBox(width: 16),
                                        Icon(
                                          Icons.update,
                                          size: 14,
                                          color: Theme.of(context).textTheme.bodyMedium?.color,
                                        ),
                                        const SizedBox(width: 4),
                                        Text(
                                          'Updated: ${transaction['last_updated'] ?? 'N/A'}',
                                          style: TextStyle(
                                            fontSize: 12,
                                            color: Theme.of(context).textTheme.bodyMedium?.color,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                                    ),
                                  ),
                                ],
                              ),
                            ),
          ),
        );
      },
    );
  }
}
