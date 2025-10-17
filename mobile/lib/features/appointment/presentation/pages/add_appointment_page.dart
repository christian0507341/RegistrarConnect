import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/appointment_bloc.dart';
import '../bloc/appointment_event.dart';
import '../../domain/entities/appointment.dart';

class AddAppointmentPage extends StatefulWidget {
  final DateTime selectedDate;
  const AddAppointmentPage({super.key, required this.selectedDate});

  @override
  State<AddAppointmentPage> createState() => _AddAppointmentPageState();
}

class _AddAppointmentPageState extends State<AddAppointmentPage> {
  final TextEditingController _titleController = TextEditingController();

  void _submit() {
    final title = _titleController.text.trim();
    if (title.isNotEmpty) {
      final appointment = Appointment(
        date: widget.selectedDate,
        title: title,
      );
      context.read<AppointmentBloc>().add(AddAppointmentEvent(appointment));
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Add Appointment"),
        backgroundColor: const Color(0xFF2E7D32),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
              controller: _titleController,
              decoration: const InputDecoration(
                labelText: "Appointment Title",
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _submit,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green,
              ),
              child: const Text("Add"),
            ),
          ],
        ),
      ),
    );
  }
}
