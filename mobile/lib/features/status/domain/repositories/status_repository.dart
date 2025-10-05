import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/status_entity.dart';

abstract class StatusRepository {
  Future<Either<Failure, List<StatusEntity>>> getStatuses();
}