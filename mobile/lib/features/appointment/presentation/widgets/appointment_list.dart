import 'package:flutter/material.dart';
import '../../domain/entities/appointment.dart';

class AppointmentList extends StatelessWidget {
  final List<Appointment> appointments;
  const AppointmentList({super.key, required this.appointments});

  @override
  Widget build(BuildContext context) {
    if (appointments.isEmpty) {
      return const Center(
        child: Text(
          "No appointments",
          style: TextStyle(fontSize: 16, color: Colors.grey),
        ),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: appointments.length,
      separatorBuilder: (_, _) => const Divider(),
      itemBuilder: (context, index) {
        final appointment = appointments[index];
        return ListTile(
          leading: Icon(
            appointment.status == 'scheduled'
                ? Icons.event_available
                : Icons.event_busy,
            color: appointment.status == 'scheduled'
                ? Colors.green
                : Colors.red,
          ),
          title: Text('${appointment.documentType} - ${appointment.purpose}'),
          subtitle: Text(
            'With: ${appointment.facultyName}\n'
            'Time: ${appointment.schedule.toString().substring(0, 16)}\n'
            'Status: ${appointment.status}',
          ),
        );
      },
    );
  }
}
