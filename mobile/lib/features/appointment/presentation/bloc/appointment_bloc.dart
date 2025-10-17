import 'package:flutter_bloc/flutter_bloc.dart';
import 'appointment_event.dart';
import 'appointment_state.dart';
import '../../domain/repositories/appointment_repository.dart';

class AppointmentBloc extends Bloc<AppointmentEvent, AppointmentState> {
  final AppointmentRepository repository;

  AppointmentBloc({required this.repository}) : super(AppointmentInitial()) {
    on<LoadAppointments>((event, emit) async {
      emit(AppointmentLoading());
      try {
        final appointments = await repository.getAppointments();
        emit(AppointmentLoaded(appointments));
      } catch (e) {
        emit(AppointmentError(e.toString()));
      }
    });
  }
}
