import 'package:dartz/dartz.dart';
import '../../../../core/error/exceptions.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/network/network_info.dart';
import '../../domain/entities/status_entity.dart';
import '../../domain/repositories/status_repository.dart';
import '../datasources/status_remote_data_source.dart';

class StatusRepositoryImpl implements StatusRepository {
  final StatusRemoteDataSource remoteDataSource;
  final NetworkInfo networkInfo;

  StatusRepositoryImpl({
    required this.remoteDataSource,
    required this.networkInfo,
  });

  @override
  Future<Either<Failure, List<StatusEntity>>> getStatuses() async {
    if (await networkInfo.isConnected) {
      try {
        final remoteStatuses = await remoteDataSource.getStatuses();
        return Right(remoteStatuses);
      } on ServerException {
        return Left(ServerFailure());
      }
    } else {
      return Left(NoInternetFailure());
    }
  }
}