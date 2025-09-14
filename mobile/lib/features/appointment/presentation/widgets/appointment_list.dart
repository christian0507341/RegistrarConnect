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
          "No appointment",
          style: TextStyle(fontSize: 16, color: Colors.grey),
        ),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: appointments.length,
      separatorBuilder: (_, __) => const Divider(),
      itemBuilder: (context, index) {
        final appointment = appointments[index];
        return ListTile(
          leading: const Icon(Icons.event_note, color: Colors.green),
          title: Text(appointment.title),
        );
      },
    );
  }
}
