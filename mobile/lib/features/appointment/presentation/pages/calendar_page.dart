import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:table_calendar/table_calendar.dart';
import '../bloc/appointment_bloc.dart';
import '../bloc/appointment_event.dart';
import '../bloc/appointment_state.dart';
import '../widgets/appointment_list.dart';
import 'add_appointment_page.dart';
import 'package:mobile/features/theme/presentation/bloc/theme_bloc.dart';
import 'package:mobile/features/theme/presentation/bloc/theme_state.dart';

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

  void _navigateToAddAppointment() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => AddAppointmentPage(selectedDate: _selectedDay),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ThemeBloc, ThemeState>(
      builder: (context, themeState) {
        return Scaffold(
          backgroundColor: themeState.isDarkMode ? Colors.grey[900] : Colors.white,
      appBar: AppBar(
        title: const Text(
          "Calendar",
          style: TextStyle(fontWeight: FontWeight.w600),
        ),
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // 📅 Calendar widget
            Card(
              elevation: 3,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              child: TableCalendar(
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
                  formatButtonVisible: false,
                  titleCentered: true,
                  titleTextStyle: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                  leftChevronIcon: const Icon(Icons.chevron_left,
                      color: Colors.blue),
                  rightChevronIcon: const Icon(Icons.chevron_right,
                      color: Colors.blue),
                ),
              ),
            ),

            const SizedBox(height: 16),

            // 📌 Appointments
            Expanded(
              child: BlocBuilder<AppointmentBloc, AppointmentState>(
                builder: (context, state) {
                  if (state is AppointmentLoaded) {
                    final appointments = state.appointments[_selectedDay] ?? [];
                    return appointments.isEmpty
                        ? Center(
                            child: Text(
                              "No appointments on this day.",
                              style: TextStyle(
                                color: themeState.isDarkMode ? Colors.white70 : Colors.black54,
                              ),
                            ),
                          )
                        : AppointmentList(appointments: appointments);
                  } else if (state is AppointmentInitial) {
                    return const Center(child: CircularProgressIndicator());
                  } else {
                    return const Center(child: Text("Something went wrong"));
                  }
                },
              ),
            ),
          ],
        ),
      ),

      // ➕ Floating Add Appointment button
      floatingActionButton: FloatingActionButton.extended(
        heroTag: "calendar_add_fab",
        onPressed: _navigateToAddAppointment,
        backgroundColor: Colors.blue,
        icon: const Icon(Icons.add),
        label: const Text("Add"),
      ),
    );
      },
    );
  }
}
