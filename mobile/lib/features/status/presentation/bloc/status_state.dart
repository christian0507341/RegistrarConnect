import 'package:equatable/equatable.dart';
import '../../domain/entities/status_entity.dart';

abstract class StatusState extends Equatable {
  @override
  List<Object> get props => [];
}

class StatusInitial extends StatusState {}

class StatusLoading extends StatusState {}

class StatusLoaded extends StatusState {
  final List<StatusEntity> statuses;

  StatusLoaded(this.statuses);

  @override
  List<Object> get props => [statuses];
}

class StatusError extends StatusState {
  final String message;

  StatusError(this.message);

  @override
  List<Object> get props => [message];
}