import 'package:mobile/features/status/domain/repositories/status_repository.dart';

class GetStatusesUseCase {
  final StatusRepository repository;

  GetStatusesUseCase(this.repository);

  Future<List<Map<String, dynamic>>> call() async {
    return await repository.getStatuses();
  }
}
