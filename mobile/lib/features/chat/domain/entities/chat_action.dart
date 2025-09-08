/// Optional instruction from the bot to trigger a UI action.
/// Examples: type='upload_receipt', requestId='REQ123'
class ChatAction {
  final String type;
  final String? requestId;
  final Map<String, dynamic>? payload;

  const ChatAction({required this.type, this.requestId, this.payload});
}
