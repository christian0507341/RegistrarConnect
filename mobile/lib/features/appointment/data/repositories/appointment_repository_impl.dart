import 'package:mobile/core/services/dio_client.dart';
import 'package:mobile/features/appointment/domain/entities/appointment.dart';
import 'package:mobile/features/appointment/domain/repositories/appointment_repository.dart';
import 'package:mobile/features/appointment/data/models/appointment_model.dart';

class AppointmentRepositoryImpl implements AppointmentRepository {
  final DioClient dioClient;

  AppointmentRepositoryImpl(this.dioClient);

  @override
  Future<List<Appointment>> getAppointments() async {
    try {
      final response = await dioClient.dio.get('/api/appointments/student/');
      final Map<String, dynamic> responseData = response.data;
      final List<dynamic> data = responseData['appointments'] ?? [];
      
      final List<Appointment> appointments = [];
      for (var json in data) {
        try {
          if (json is Map<String, dynamic>) {
            appointments.add(AppointmentModel.fromJson(json).toEntity());
          } else {
            print('Warning: Skipping invalid appointment data: $json');
          }
        } catch (e) {
          print('Error parsing appointment: $e, data: $json');
          // Continue with other appointments
        }
      }
      
      return appointments;
    } catch (e) {
      print('Failed to fetch appointments: $e');
      throw Exception('Failed to fetch appointments: $e');
    }
  }
}
