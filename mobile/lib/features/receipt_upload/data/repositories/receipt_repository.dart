import 'package:mobile/features/receipt_upload/data/sources/receipt_api.dart';
import 'package:mobile/features/receipt_upload/domain/repositories/receipt_repository.dart';

class ReceiptRepository implements IReceiptRepository {
  ReceiptRepository(this._api);
  final ReceiptApi _api;

  @override
  Future<bool> upload({required String requestId, required String filePath}) {
    return _api.upload(requestId: requestId, filePath: filePath);
  }
}
