import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/status_entity.dart';
import '../repositories/status_repository.dart';

class GetStatusesUseCase {
  final StatusRepository repository;

  GetStatusesUseCase(this.repository);

  Future<Either<Failure, List<StatusEntity>>> call() async {
    return await repository.getStatuses();
  }
}