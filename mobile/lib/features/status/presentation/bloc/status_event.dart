import 'package:equatable/equatable.dart';

abstract class StatusEvent extends Equatable {
  const StatusEvent();
  @override
  List<Object?> get props => [];
}

class LoadStatuses extends StatusEvent {
  const LoadStatuses();
}
