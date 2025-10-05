import 'package:equatable/equatable.dart';

abstract class StatusEvent extends Equatable {
  @override
  List<Object> get props => [];
}

class LoadStatuses extends StatusEvent {}