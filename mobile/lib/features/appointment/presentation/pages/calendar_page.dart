import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:table_calendar/table_calendar.dart';
import 'package:mobile/core/theme/theme_bloc.dart';
import '../bloc/appointment_bloc.dart';
import '../bloc/appointment_event.dart';
import '../bloc/appointment_state.dart';
import '../widgets/appointment_list.dart';

class CalendarPage extends StatefulWidget {
  const CalendarPage({super.key});

  @override
  State<CalendarPage> createState() => _CalendarPageState();
}

class _CalendarPageState extends State<CalendarPage> {
  DateTime _focusedDay = DateTime.now();
  DateTime _selectedDay = DateTime.now();

  @override
  void initState() {
    super.initState();
    context.read<AppointmentBloc>().add(LoadAppointments());
  }

  Widget _buildEventMarkers(List<dynamic> events) {
    if (events.isEmpty) return const SizedBox.shrink();
    
    // Group events by status
    final claimedEvents = events.where((e) => e.status == 'claimed').length;
    final scheduledEvents = events.where((e) => e.status == 'scheduled').length;
    final otherEvents = events.where((e) => e.status != 'claimed' && e.status != 'scheduled').length;
    
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (claimedEvents > 0)
          Container(
            width: 6,
            height: 6,
            decoration: const BoxDecoration(
              color: Colors.purple,
              shape: BoxShape.circle,
            ),
          ),
        if (claimedEvents > 0 && (scheduledEvents > 0 || otherEvents > 0))
          const SizedBox(width: 2),
        if (scheduledEvents > 0)
          Container(
            width: 6,
            height: 6,
            decoration: const BoxDecoration(
              color: Colors.green,
              shape: BoxShape.circle,
            ),
          ),
        if (scheduledEvents > 0 && otherEvents > 0)
          const SizedBox(width: 2),
        if (otherEvents > 0)
          Container(
            width: 6,
            height: 6,
            decoration: const BoxDecoration(
              color: Colors.orange,
              shape: BoxShape.circle,
            ),
          ),
      ],
    );
  }

  Widget _buildLegendItem(Color color, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: color.withAlpha(26),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: color.withAlpha(77),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 10,
            height: 10,
            decoration: BoxDecoration(
              color: color,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: color.withAlpha(77),
                  blurRadius: 4,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ThemeBloc, ThemeState>(
      builder: (context, themeState) {
        final isDarkMode = themeState is ThemeLoadedState ? themeState.isDarkMode : false;
        
        return Scaffold(
          backgroundColor: isDarkMode ? const Color(0xFF121212) : Colors.grey[50],
          appBar: AppBar(
            title: Text(
              "📅 Appointments",
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
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(20),
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: isDarkMode 
                    ? [const Color(0xFF2d2d2d), const Color(0xFF1a1a1a)]
                    : [Colors.white, const Color(0xFFF8FAFC)],
                ),
                border: Border.all(
                  color: const Color(0xFFE2E8F0),
                  width: 1,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withAlpha(13),
                    blurRadius: 8,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(20),
                child: BlocBuilder<AppointmentBloc, AppointmentState>(
                builder: (context, state) {
                  return TableCalendar(
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
                    eventLoader: (day) {
                      if (state is AppointmentLoaded) {
                        return state.appointments
                            .where((appt) => isSameDay(appt.schedule, day))
                            .toList();
                      }
                      return [];
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
                      markersMaxCount: 3,
                      markerDecoration: BoxDecoration(
                        color: Colors.blue,
                        shape: BoxShape.circle,
                      ),
                    ),
                    calendarBuilders: CalendarBuilders(
                      markerBuilder: (context, day, events) {
                        if (events.isEmpty) return null;
                        
                        return Positioned(
                          bottom: 1,
                          child: _buildEventMarkers(events),
                        );
                      },
                    ),
                headerStyle: HeaderStyle(
                  formatButtonVisible: false,
                  titleCentered: true,
                  titleTextStyle: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: isDarkMode ? Colors.white : const Color(0xFF1F2937),
                  ),
                  leftChevronIcon: const Icon(
                    Icons.chevron_left,
                    color: Colors.blue,
                  ),
                  rightChevronIcon: const Icon(
                    Icons.chevron_right,
                    color: Colors.blue,
                  ),
                ),
                  );
                },
              ),
              ),
            ),
            const SizedBox(height: 16),
            // Calendar Legend
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: isDarkMode 
                    ? [const Color(0xFF2d2d2d), const Color(0xFF1a1a1a)]
                    : [Colors.white, Colors.grey[50]!],
                ),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isDarkMode ? Colors.grey[700]! : Colors.grey[200]!,
                  width: 1,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withAlpha(isDarkMode ? 51 : 13),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _buildLegendItem(Colors.purple, 'Claimed'),
                  _buildLegendItem(Colors.green, 'Scheduled'),
                  _buildLegendItem(Colors.orange, 'Other'),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: BlocBuilder<AppointmentBloc, AppointmentState>(
                builder: (context, state) {
                  if (state is AppointmentLoaded) {
                    final appointments = state.appointments
                        .where((appt) => isSameDay(appt.schedule, _selectedDay))
                        .toList();
                    return appointments.isEmpty
                        ? Center(
                            child: SingleChildScrollView(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(
                                    Icons.event_available,
                                    size: 48,
                                    color: Colors.grey[400],
                                  ),
                                  const SizedBox(height: 12),
                                  Text(
                                    "No appointments on this day",
                                    style: TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w500,
                                      color: Colors.grey[600],
                                    ),
                                    textAlign: TextAlign.center,
                                  ),
                                  const SizedBox(height: 6),
                                  Padding(
                                    padding: const EdgeInsets.symmetric(horizontal: 16.0),
                                    child: Text(
                                      "Select a different date to view appointments",
                                      style: TextStyle(
                                        fontSize: 13,
                                        color: Colors.grey[500],
                                      ),
                                      textAlign: TextAlign.center,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          )
                        : AppointmentList(appointments: appointments);
                  } else if (state is AppointmentLoading) {
                    return const Center(child: CircularProgressIndicator());
                  } else if (state is AppointmentError) {
                    return Center(child: Text("Error: ${state.message}"));
                  } else {
                    return const Center(child: Text("Something went wrong"));
                  }
                },
              ),
            ),
            const Padding(
              padding: EdgeInsets.all(8.0),
              child: Text(
                "Missed an appointment? Visit the registrar office in-person with your receipt.",
                style: TextStyle(color: Colors.redAccent, fontSize: 12),
                textAlign: TextAlign.center,
              ),
            ),
          ],
        ),
      ),
        );
      },
    );
  }
}
