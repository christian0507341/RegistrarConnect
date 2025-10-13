from rest_framework import serializers

class ChatMessageSerializer(serializers.Serializer):
    id = serializers.CharField()
    conversation_id = serializers.CharField()
    sender = serializers.ChoiceField(choices=["student", "bot"])
    text = serializers.CharField()
    timestamp = serializers.CharField()

class ChatReplySerializer(serializers.Serializer):
    message = ChatMessageSerializer()
    action = serializers.DictField(allow_null=True, required=False)