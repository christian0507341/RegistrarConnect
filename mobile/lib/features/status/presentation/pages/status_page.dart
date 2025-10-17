import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/features/status/presentation/bloc/status_bloc.dart';
import 'package:mobile/features/status/presentation/bloc/status_event.dart';
import 'package:mobile/features/status/presentation/bloc/status_state.dart';
import 'package:mobile/injection_container.dart' as di;
import 'package:mobile/features/theme/presentation/bloc/theme_bloc.dart';
import 'package:mobile/features/theme/presentation/bloc/theme_state.dart';

class StatusPage extends StatelessWidget {
  const StatusPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => di.sl<StatusBloc>()..add(const LoadStatuses()),
      child: BlocBuilder<ThemeBloc, ThemeState>(
        builder: (context, themeState) {
          return Scaffold(
            appBar: AppBar(
              title: const Text(
                'Status',
                style: TextStyle(
                  fontSize: 20.0,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              backgroundColor: const Color(0xFF2196F3), // Green from main.dart
              elevation: 2,
              iconTheme: const IconThemeData(color: Colors.white),
              actions: [
                Container(
                  margin: const EdgeInsets.only(right: 16),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: IconButton(
                    icon: const Icon(Icons.refresh_rounded, color: Colors.white),
                    onPressed: () {
                      context.read<StatusBloc>().add(const LoadStatuses());
                    },
                    tooltip: "Refresh Status",
                  ),
                ),
              ],
            ),
            body: Container(
              color: themeState.isDarkMode ? Colors.grey[900] : Colors.grey[100],
              child: RefreshIndicator(
                onRefresh: () async {
                  context.read<StatusBloc>().add(const LoadStatuses());
                  await Future.delayed(const Duration(seconds: 1));
                },
                child: BlocBuilder<StatusBloc, StatusState>(
                  builder: (context, state) {
                    if (state is StatusLoading) {
                      return const Center(
                        child: CircularProgressIndicator(),
                      );
                    } else if (state is StatusLoaded) {
                      if (state.statuses.isEmpty) {
                        return Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.inbox_outlined,
                                size: 64,
                                color: themeState.isDarkMode ? Colors.white38 : Colors.grey[400],
                              ),
                              const SizedBox(height: 16),
                              Text(
                                'No Status Updates',
                                style: TextStyle(
                                  fontSize: 18.0,
                                  fontWeight: FontWeight.w600,
                                  color: themeState.isDarkMode ? Colors.white70 : Colors.grey[700],
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'You don\'t have any document requests yet.\nSubmit a request to see status updates here.',
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  fontSize: 14.0,
                                  color: themeState.isDarkMode ? Colors.white54 : Colors.grey[500],
                                ),
                              ),
                            ],
                          ),
                        );
                      }
                      return ListView.builder(
                        itemCount: state.statuses.length,
                        itemBuilder: (context, index) {
                          final status = state.statuses[index];
                          final isPaymentComplete = status['payment'] == 't' || status['payment'] == true;
                          final isDocumentReady = status['document'] == 't' || status['document'] == true;
                          final isCompleted = isPaymentComplete && isDocumentReady;
                          final requestStatus = status['status'] ?? 'pending';
                          final appointmentDate = status['appointment_date'];
                          
                          return Card(
                            margin: const EdgeInsets.all(8.0),
                            elevation: 2,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12.0),
                            ),
                            child: Container(
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(12.0),
                                gradient: themeState.isDarkMode
                                    ? LinearGradient(
                                        colors: [
                                          Colors.grey[900]!,
                                          Colors.grey[800]!,
                                        ],
                                        begin: Alignment.topLeft,
                                        end: Alignment.bottomRight,
                                      )
                                    : LinearGradient(
                                        colors: [
                                          Colors.white,
                                          Colors.grey[50]!,
                                        ],
                                        begin: Alignment.topLeft,
                                        end: Alignment.bottomRight,
                                      ),
                              ),
                              child: Padding(
                                padding: const EdgeInsets.all(16.0),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Expanded(
                                          child: Text(
                                            status['title'] ?? 'Unknown Document',
                                            style: TextStyle(
                                              fontSize: 16.0,
                                              fontWeight: FontWeight.bold,
                                              color: themeState.isDarkMode ? Colors.white : Colors.black87,
                                            ),
                                          ),
                                        ),
                                        Container(
                                          padding: const EdgeInsets.symmetric(
                                            horizontal: 12.0,
                                            vertical: 6.0,
                                          ),
                                          decoration: BoxDecoration(
                                            color: _getStatusColor(requestStatus),
                                            borderRadius: BorderRadius.circular(20.0),
                                            boxShadow: [
                                              BoxShadow(
                                                color: _getStatusColor(requestStatus).withValues(alpha: 0.3),
                                                blurRadius: 4,
                                                offset: const Offset(0, 2),
                                              ),
                                            ],
                                          ),
                                          child: Text(
                                            _getStatusText(requestStatus),
                                            style: const TextStyle(
                                              color: Colors.white,
                                              fontSize: 12.0,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                    // Only show payment and document status if request is approved or beyond
                                    if (requestStatus.toLowerCase() != 'pending') ...[
                                      const SizedBox(height: 12.0),
                                      Row(
                                        children: [
                                          Expanded(
                                            child: _buildStatusItem(
                                              icon: Icons.payment,
                                              label: "Payment",
                                              isComplete: isPaymentComplete,
                                              themeState: themeState,
                                            ),
                                          ),
                                          const SizedBox(width: 16.0),
                                          Expanded(
                                            child: _buildStatusItem(
                                              icon: Icons.description,
                                              label: "Document",
                                              isComplete: isDocumentReady,
                                              themeState: themeState,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                    if (requestStatus.toLowerCase() == 'completed') ...[
                                      const SizedBox(height: 12.0),
                                      Container(
                                        padding: const EdgeInsets.all(12.0),
                                        decoration: BoxDecoration(
                                          color: Colors.green.withValues(alpha: 0.1),
                                          borderRadius: BorderRadius.circular(8.0),
                                          border: Border.all(
                                            color: Colors.green.withValues(alpha: 0.3),
                                            width: 1,
                                          ),
                                        ),
                                        child: Row(
                                          children: [
                                            const Icon(
                                              Icons.check_circle,
                                              color: Colors.green,
                                              size: 20,
                                            ),
                                            const SizedBox(width: 8.0),
                                            Expanded(
                                              child: Text(
                                                _getClaimMessage(appointmentDate),
                                                style: TextStyle(
                                                  color: themeState.isDarkMode ? Colors.green[300] : Colors.green[700],
                                                  fontWeight: FontWeight.w500,
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ],
                                ),
                              ),
                            ),
                          );
                        },
                      );
                    } else if (state is StatusError) {
                      return Center(
                        child: Text(
                          state.message,
                          style: TextStyle(
                            color: themeState.isDarkMode ? Colors.red[300] : Colors.red,
                          ),
                        ),
                      );
                    } else {
                      return Center(
                        child: Text(
                          'No data',
                          style: TextStyle(
                            fontSize: 16.0,
                            color: themeState.isDarkMode ? Colors.white70 : Colors.black54,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      );
                    }
                  },
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return Colors.orange;
      case 'approved':
        return Colors.blue;
      case 'completed':
        return Colors.green;
      case 'rejected':
        return Colors.red;
      case 'cancelled':
        return Colors.grey;
      default:
        return Colors.orange;
    }
  }

  String _getStatusText(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Pending';
      case 'approved':
        return 'Approved';
      case 'completed':
        return 'Completed';
      case 'rejected':
        return 'Rejected';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Pending';
    }
  }

  String _getClaimMessage(dynamic appointmentDate) {
    if (appointmentDate != null) {
      try {
        final date = DateTime.parse(appointmentDate);
        final formattedDate = "${date.day}/${date.month}/${date.year}";
        return "Ready To be Claim on $formattedDate";
      } catch (e) {
        // If parsing fails, show static message
        return "Ready To be Claim on TBD";
      }
    } else {
      // For now, show static message since appointment feature is not fully implemented
      return "Ready To be Claim on TBD";
    }
  }

  Widget _buildStatusItem({
    required IconData icon,
    required String label,
    required bool isComplete,
    required ThemeState themeState,
  }) {
    return Container(
      padding: const EdgeInsets.all(12.0),
      decoration: BoxDecoration(
        color: isComplete 
            ? Colors.green.withValues(alpha: 0.1)
            : Colors.grey.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8.0),
        border: Border.all(
          color: isComplete 
              ? Colors.green.withValues(alpha: 0.3)
              : Colors.grey.withValues(alpha: 0.3),
          width: 1,
        ),
      ),
      child: Row(
        children: [
          Icon(
            isComplete ? Icons.check_circle : icon,
            color: isComplete ? Colors.green : Colors.grey[600],
            size: 20,
          ),
          const SizedBox(width: 8.0),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 12.0,
                    color: themeState.isDarkMode ? Colors.white70 : Colors.grey[600],
                    fontWeight: FontWeight.w500,
                  ),
                ),
                Text(
                  isComplete ? "Complete" : "Pending",
                  style: TextStyle(
                    fontSize: 14.0,
                    color: isComplete 
                        ? Colors.green[700]
                        : (themeState.isDarkMode ? Colors.white70 : Colors.grey[600]),
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}