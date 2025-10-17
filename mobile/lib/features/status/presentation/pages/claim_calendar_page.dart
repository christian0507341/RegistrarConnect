import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:table_calendar/table_calendar.dart';
import 'package:mobile/features/status/presentation/bloc/status_bloc.dart';
import 'package:mobile/features/status/presentation/bloc/status_event.dart';
import 'package:mobile/features/status/presentation/bloc/status_state.dart';
import 'package:mobile/injection_container.dart' as di;
import 'package:mobile/features/theme/presentation/bloc/theme_bloc.dart';
import 'package:mobile/features/theme/presentation/bloc/theme_state.dart';

class ClaimCalendarPage extends StatefulWidget {
  const ClaimCalendarPage({super.key});

  @override
  State<ClaimCalendarPage> createState() => _ClaimCalendarPageState();
}

class _ClaimCalendarPageState extends State<ClaimCalendarPage> {
  DateTime _focusedDay = DateTime.now();
  DateTime _selectedDay = DateTime.now();

  @override
  void initState() {
    super.initState();
    context.read<StatusBloc>().add(const LoadStatuses());
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ThemeBloc, ThemeState>(
      builder: (context, themeState) {
        return Scaffold(
          appBar: AppBar(
            title: const Text(
              'Claim Calendar',
              style: TextStyle(
                fontSize: 20.0,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            backgroundColor: const Color(0xFF2196F3),
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
                  tooltip: "Refresh Calendar",
                ),
              ),
            ],
          ),
          body: Container(
            color: themeState.isDarkMode ? Colors.grey[900] : Colors.grey[100],
            child: Column(
              children: [
                // Calendar Widget
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Card(
                    elevation: 3,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: TableCalendar<String>(
                      firstDay: DateTime.utc(2020, 1, 1),
                      lastDay: DateTime.utc(2030, 12, 31),
                      focusedDay: _focusedDay,
                      selectedDayPredicate: (day) => isSameDay(_selectedDay, day),
                      onDaySelected: (selectedDay, focusedDay) {
                        setState(() {
                          _selectedDay = selectedDay;
                          _focusedDay = focusedDay;
                        });
                      },
                      calendarStyle: CalendarStyle(
                        todayDecoration: BoxDecoration(
                          color: Colors.blue.shade100,
                          shape: BoxShape.circle,
                        ),
                        selectedDecoration: const BoxDecoration(
                          color: Colors.blue,
                          shape: BoxShape.circle,
                        ),
                        weekendTextStyle: const TextStyle(color: Colors.redAccent),
                      ),
                      headerStyle: HeaderStyle(
                        titleCentered: true,
                        titleTextStyle: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                        leftChevronIcon: const Icon(Icons.chevron_left, color: Colors.blue),
                        rightChevronIcon: const Icon(Icons.chevron_right, color: Colors.blue),
                      ),
                      eventLoader: (day) {
                        return _getEventsForDay(day);
                      },
                    ),
                  ),
                ),

                // Selected Day Info
                Expanded(
                  child: BlocBuilder<StatusBloc, StatusState>(
                    builder: (context, state) {
                      if (state is StatusLoading) {
                        return const Center(child: CircularProgressIndicator());
                      } else if (state is StatusLoaded) {
                        final claimableDocuments = _getClaimableDocumentsForDay(state.statuses, _selectedDay);
                        
                        if (claimableDocuments.isEmpty) {
                          return Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.calendar_today,
                                  size: 64,
                                  color: themeState.isDarkMode ? Colors.white38 : Colors.grey[400],
                                ),
                                const SizedBox(height: 16),
                                Text(
                                  'No documents to claim on this day',
                                  style: TextStyle(
                                    fontSize: 18.0,
                                    fontWeight: FontWeight.w600,
                                    color: themeState.isDarkMode ? Colors.white70 : Colors.grey[700],
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'Select a different date to see claimable documents',
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
                          padding: const EdgeInsets.all(16.0),
                          itemCount: claimableDocuments.length,
                          itemBuilder: (context, index) {
                            final document = claimableDocuments[index];
                            return Card(
                              margin: const EdgeInsets.only(bottom: 8.0),
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
                                  child: Row(
                                    children: [
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
                                        child: const Icon(
                                          Icons.description,
                                          color: Colors.green,
                                          size: 24,
                                        ),
                                      ),
                                      const SizedBox(width: 16.0),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              document['title'] ?? 'Unknown Document',
                                              style: TextStyle(
                                                fontSize: 16.0,
                                                fontWeight: FontWeight.bold,
                                                color: themeState.isDarkMode ? Colors.white : Colors.black87,
                                              ),
                                            ),
                                            const SizedBox(height: 4.0),
                                            Text(
                                              'Ready to claim',
                                              style: TextStyle(
                                                fontSize: 14.0,
                                                color: Colors.green[700],
                                                fontWeight: FontWeight.w500,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 12.0,
                                          vertical: 6.0,
                                        ),
                                        decoration: BoxDecoration(
                                          color: Colors.green,
                                          borderRadius: BorderRadius.circular(20.0),
                                        ),
                                        child: const Text(
                                          'Claim',
                                          style: TextStyle(
                                            color: Colors.white,
                                            fontSize: 12.0,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ),
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
                        return const Center(child: Text("No data"));
                      }
                    },
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  List<String> _getEventsForDay(DateTime day) {
    // This would be populated with actual claim dates from the status data
    // For now, return empty list - can be enhanced later
    return [];
  }

  List<Map<String, dynamic>> _getClaimableDocumentsForDay(
    List<Map<String, dynamic>> statuses,
    DateTime day,
  ) {
    return statuses.where((status) {
      final requestStatus = status['status'] ?? 'pending';
      final appointmentDate = status['appointment_date'];
      
      // Show documents that are completed and have claim dates matching the selected day
      if (requestStatus.toLowerCase() == 'completed') {
        if (appointmentDate != null) {
          try {
            final claimDate = DateTime.parse(appointmentDate);
            return isSameDay(claimDate, day);
          } catch (e) {
            // If no specific date, show as claimable
            return true;
          }
        }
        // If no appointment date but completed, show as claimable
        return true;
      }
      return false;
    }).toList();
  }
}
