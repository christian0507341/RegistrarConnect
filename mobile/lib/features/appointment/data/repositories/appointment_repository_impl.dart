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
      final response = await dioClient.dio.get('/appointments/');
      final List<dynamic> data = response.data;
      return data
          .map((json) => AppointmentModel.fromJson(json).toEntity())
          .toList();
    } catch (e) {
      throw Exception('Failed to fetch appointments: $e');
    }
  }
}
