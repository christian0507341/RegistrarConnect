abstract class IReceiptRepository {
  /// Uploads an image for a request; backend should mark the request PENDING.
  Future<bool> upload({
    required String requestId,
    required String filePath, // local path to image file
  });
}
