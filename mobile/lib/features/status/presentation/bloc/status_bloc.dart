import 'package:bloc/bloc.dart';
import '../../domain/usecases/get_statuses_use_case.dart';
import 'status_event.dart';
import 'status_state.dart';

class StatusBloc extends Bloc<StatusEvent, StatusState> {
  final GetStatusesUseCase getStatusesUseCase;

  StatusBloc({required this.getStatusesUseCase}) : super(StatusInitial()) {
    on<LoadStatuses>(_onLoadStatuses);
  }

  Future<void> _onLoadStatuses(LoadStatuses event, Emitter<StatusState> emit) async {
    emit(StatusLoading());
    final result = await getStatusesUseCase();
    result.fold(
      (failure) => emit(StatusError(failure.toString())),
      (statuses) => emit(StatusLoaded(statuses)),
    );
  }
}