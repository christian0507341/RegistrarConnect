import 'package:flutter_bloc/flutter_bloc.dart';
import 'appointment_event.dart';
import 'appointment_state.dart';
import '../../data/repositories/appointment_repository_impl.dart';

class AppointmentBloc extends Bloc<AppointmentEvent, AppointmentState> {
  final AppointmentRepositoryImpl repository;

  AppointmentBloc({required this.repository}) : super(AppointmentInitial()) {
    on<LoadAppointments>((event, emit) {
      emit(AppointmentLoaded(repository.storage));
    });

    on<AddAppointmentEvent>((event, emit) {
      repository.addAppointment(event.appointment);
      emit(AppointmentLoaded(repository.storage));
    });
  }
}
