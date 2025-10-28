# Enhanced Chatbot - Handles both document requests and general student chat
from typing import Dict, Optional
from .student_chat_ai import StudentChatAI

class EnhancedChatbot:
    """Enhanced chatbot that handles both document requests and general student chat"""
    
    def __init__(self):
        self.student_chat_ai = StudentChatAI()
        print("✅ Enhanced chatbot initialized with student chat capabilities")
    
    def process_user_input(self, text: str, session: Dict, access_token: str) -> str:
        """Process user input with enhanced chat capabilities"""
        
        # First, try to handle as document request using existing system
        document_response = self._handle_document_request(text, session, access_token)
        
        # If it's clearly a document request, return that response
        if self._is_document_request(text):
            return document_response
        
        # If it's general chat, use student chat AI
        if self._is_general_chat(text):
            user_id = str(session.get('user_id', 'anonymous'))
            return self.student_chat_ai.process_student_chat(text, session, user_id)
        
        # If unclear, try document request first, then fall back to chat
        if document_response and not document_response.startswith("I understand you need help"):
            return document_response
        else:
            user_id = str(session.get('user_id', 'anonymous'))
            return self.student_chat_ai.process_student_chat(text, session, user_id)
    
    def _handle_document_request(self, text: str, session: Dict, access_token: str) -> str:
        """Handle document request using existing system"""
        try:
            from backend.ai.services.train.chatbot_cli import handle_user_text
            return handle_user_text(session, text, access_token)
        except Exception as e:
            print(f"⚠️ Document request handling error: {e}")
            return "I understand you need help with document requests. Let me assist you!"
    
    def _is_document_request(self, text: str) -> bool:
        """Check if the text is clearly a document request"""
        text_lower = text.lower()
        
        # Clear document request indicators
        document_indicators = [
            'otr', 'cog', 'coe', 'transcript', 'certificate', 'enrollment',
            'document request', 'request document', 'need document',
            'official transcript', 'certificate of grades', 'certificate of enrollment',
            'apply for', 'submit', 'request for'
        ]
        
        return any(indicator in text_lower for indicator in document_indicators)
    
    def _is_general_chat(self, text: str) -> bool:
        """Check if the text is general chat"""
        text_lower = text.lower()
        
        # General chat indicators
        chat_indicators = [
            'hello', 'hi', 'hey', 'how are you', 'what\'s up',
            'chat', 'talk', 'conversation', 'tell me about',
            'how\'s your day', 'how are things', 'what do you think'
        ]
        
        # Academic but not document-specific
        academic_chat_indicators = [
            'study', 'studying', 'exam', 'test', 'grade', 'gpa',
            'course', 'subject', 'professor', 'class', 'homework'
        ]
        
        # Social indicators
        social_indicators = [
            'friends', 'social', 'party', 'weekend', 'fun',
            'hangout', 'relationship', 'dating', 'family'
        ]
        
        return (any(indicator in text_lower for indicator in chat_indicators) or
                any(indicator in text_lower for indicator in academic_chat_indicators) or
                any(indicator in text_lower for indicator in social_indicators))
    
    def get_conversation_analytics(self, session: Dict) -> Dict:
        """Get analytics about the conversation"""
        user_id = str(session.get('user_id', 'anonymous'))
        
        # Get student chat analytics
        chat_analytics = self.student_chat_ai.get_conversation_analytics(user_id)
        
        # Add system stats
        system_stats = self.student_chat_ai.get_system_stats()
        
        return {
            'chat_analytics': chat_analytics,
            'system_stats': system_stats,
            'chatbot_type': 'enhanced_with_student_chat'
        }