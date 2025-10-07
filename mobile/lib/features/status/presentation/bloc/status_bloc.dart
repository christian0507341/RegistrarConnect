import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/features/status/domain/usecases/get_statuses.dart';
import 'package:mobile/features/status/presentation/bloc/status_event.dart';
import 'package:mobile/features/status/presentation/bloc/status_state.dart';
import 'dart:async';

class StatusBloc extends Bloc<StatusEvent, StatusState> {
  final GetStatusesUseCase getStatusesUseCase;
  Timer? _timer;

  StatusBloc({required this.getStatusesUseCase}) : super(StatusInitial()) {
    on<LoadStatuses>(_onLoadStatuses);
    // Start periodic refresh when bloc is created
    _startPeriodicRefresh();
  }

  @override
  Future<void> close() {
    _timer?.cancel(); // Cancel timer when bloc is closed
    return super.close();
  }

  Future<void> _onLoadStatuses(LoadStatuses event, Emitter<StatusState> emit) async {
    emit(StatusLoading());
    try {
      final statuses = await getStatusesUseCase();
      emit(StatusLoaded(statuses));
    } catch (e) {
      emit(StatusError(e.toString()));
    }
  }

  void _startPeriodicRefresh() {
    _timer = Timer.periodic(const Duration(seconds: 30), (timer) {
      add(const LoadStatuses()); // Trigger refresh every 30 seconds
    });
  }
}