# Enhanced context awareness for the chatbot
import json
from typing import Dict, List, Optional
from datetime import datetime, timedelta

class ContextEnhancer:
    """Enhances chatbot responses with better context awareness"""
    
    def __init__(self):
        self.user_preferences = {}
        self.conversation_context = {}
    
    def analyze_user_intent(self, text: str, session: Dict) -> Dict:
        """Analyze user intent with enhanced context"""
        intent_analysis = {
            'primary_intent': 'unknown',
            'confidence': 0.0,
            'entities': [],
            'urgency': 'normal',
            'context_clues': []
        }
        
        text_lower = text.lower()
        
        # Enhanced intent detection
        if any(word in text_lower for word in ['urgent', 'asap', 'immediately', 'rush']):
            intent_analysis['urgency'] = 'high'
            intent_analysis['context_clues'].append('urgent_request')
        
        if any(word in text_lower for word in ['deadline', 'due', 'expire', 'expired']):
            intent_analysis['urgency'] = 'high'
            intent_analysis['context_clues'].append('deadline_concern')
        
        # Document type confidence scoring
        doc_confidence = self._calculate_doc_type_confidence(text, session)
        intent_analysis['confidence'] = doc_confidence
        
        return intent_analysis
    
    def _calculate_doc_type_confidence(self, text: str, session: Dict) -> float:
        """Calculate confidence score for document type prediction"""
        confidence = 0.5  # Base confidence
        
        # Boost confidence based on explicit mentions
        explicit_mentions = {
            'otr': ['transcript', 'grades', 'academic record'],
            'cog': ['certificate of grades', 'grade certificate'],
            'coe': ['certificate of enrollment', 'enrollment certificate'],
            'others': ['certificate', 'document', 'paper']
        }
        
        text_lower = text.lower()
        for doc_type, keywords in explicit_mentions.items():
            if any(keyword in text_lower for keyword in keywords):
                confidence += 0.3
                break
        
        return min(confidence, 1.0)
    
    def generate_contextual_response(self, base_response: str, session: Dict, intent_analysis: Dict) -> str:
        """Generate enhanced response with context awareness"""
        enhanced_response = base_response
        
        # Add urgency indicators
        if intent_analysis['urgency'] == 'high':
            enhanced_response = f"🚨 **URGENT REQUEST DETECTED** 🚨\n\n{enhanced_response}\n\n💡 *I'll prioritize your request for faster processing.*"
        
        # Add personalized touches based on user history
        if session.get('user_id'):
            user_context = self._get_user_context(session['user_id'])
            if user_context.get('frequent_requester'):
                enhanced_response += "\n\n👋 *Welcome back! I see you're a frequent user.*"
        
        return enhanced_response
    
    def _get_user_context(self, user_id: str) -> Dict:
        """Get user context from previous interactions"""
        # This would integrate with your database to get user history
        return {
            'frequent_requester': True,  # Example
            'preferred_doc_types': ['OTR', 'COG'],
            'last_request_date': '2024-01-15'
        }
    
    def suggest_alternatives(self, text: str, session: Dict) -> List[str]:
        """Suggest alternative document types or actions"""
        suggestions = []
        
        if 'otr' in text.lower():
            suggestions.extend(['COG (Certificate of Grades)', 'COE (Certificate of Enrollment)'])
        elif 'cog' in text.lower():
            suggestions.extend(['OTR (Official Transcript)', 'COE (Certificate of Enrollment)'])
        
        return suggestions
