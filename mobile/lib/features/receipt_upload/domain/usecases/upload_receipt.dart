import 'package:mobile/features/receipt_upload/domain/repositories/receipt_repository.dart';

class UploadReceipt {
  final IReceiptRepository repo;
  const UploadReceipt(this.repo);

  Future<bool> call({required String requestId, required String filePath}) {
    return repo.upload(requestId: requestId, filePath: filePath);
  }
}
