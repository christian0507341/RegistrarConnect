import 'package:equatable/equatable.dart';

abstract class StatusState extends Equatable {
  const StatusState();
  @override
  List<Object?> get props => [];
}

class StatusInitial extends StatusState {}

class StatusLoading extends StatusState {}

class StatusLoaded extends StatusState {
  final List<Map<String, dynamic>> statuses;
  const StatusLoaded(this.statuses);

  @override
  List<Object?> get props => [statuses];
}

class StatusError extends StatusState {
  final String message;
  const StatusError(this.message);

  @override
  List<Object?> get props => [message];
}