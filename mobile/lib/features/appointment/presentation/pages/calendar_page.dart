import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:table_calendar/table_calendar.dart';
import '../bloc/appointment_bloc.dart';
import '../bloc/appointment_event.dart';
import '../bloc/appointment_state.dart';
import '../widgets/appointment_list.dart';
import 'add_appointment_page.dart';

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
    return Column(
      children: [
        TableCalendar(
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
          calendarStyle: const CalendarStyle(
            todayDecoration: BoxDecoration(
                color: Colors.green, shape: BoxShape.circle),
            selectedDecoration: BoxDecoration(
                color: Colors.lightGreen, shape: BoxShape.circle),
          ),
        ),
        const SizedBox(height: 16),
        Expanded(
          child: BlocBuilder<AppointmentBloc, AppointmentState>(
            builder: (context, state) {
              if (state is AppointmentLoaded) {
                final appointments = state.appointments[_selectedDay] ?? [];
                return AppointmentList(appointments: appointments);
              } else if (state is AppointmentInitial) {
                return const Center(child: CircularProgressIndicator());
              } else {
                return const Center(child: Text("Something went wrong"));
              }
            },
          ),
        ),
      ],
    );
  }
}
