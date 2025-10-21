# Chat Analytics endpoints for student chat AI
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .services.enhanced_chatbot import EnhancedChatbot

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_chat_analytics(request):
    """Get chat analytics for the current user"""
    try:
        user_id = str(request.user.id)
        chatbot = EnhancedChatbot()
        
        # Get conversation analytics
        analytics = chatbot.get_conversation_analytics({'user_id': user_id})
        
        return Response(analytics, status=200)
        
    except Exception as e:
        return Response({"error": f"Analytics error: {str(e)}"}, status=500)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_system_stats(request):
    """Get overall system statistics"""
    try:
        chatbot = EnhancedChatbot()
        stats = chatbot.student_chat_ai.get_system_stats()
        
        return Response(stats, status=200)
        
    except Exception as e:
        return Response({"error": f"Stats error: {str(e)}"}, status=500)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def reset_chat_memory(request):
    """Reset chat memory for the current user"""
    try:
        user_id = str(request.user.id)
        chatbot = EnhancedChatbot()
        
        # Reset conversation memory
        chatbot.student_chat_ai.reset_conversation_memory(user_id)
        
        return Response({"message": "Chat memory reset successfully"}, status=200)
        
    except Exception as e:
        return Response({"error": f"Reset error: {str(e)}"}, status=500)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def test_chat_ai(request):
    """Test the chat AI with sample input"""
    try:
        test_input = request.GET.get('text', 'Hello, how are you?')
        user_id = str(request.user.id)
        
        chatbot = EnhancedChatbot()
        
        # Test the chat AI
        response = chatbot.student_chat_ai.process_student_chat(
            test_input, 
            {'user_id': user_id}, 
            user_id
        )
        
        return Response({
            'input': test_input,
            'response': response,
            'ai_type': 'student_chat_ai'
        }, status=200)
        
    except Exception as e:
        return Response({"error": f"Test error: {str(e)}"}, status=500)

