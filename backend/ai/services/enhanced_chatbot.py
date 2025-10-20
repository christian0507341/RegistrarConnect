# Enhanced chatbot integration with existing system
from typing import Dict, Optional
from .context_enhancer import ContextEnhancer
from .response_generator import ResponseGenerator
from .enhanced_classifier import EnhancedDocumentClassifier

class EnhancedChatbot:
    """Enhanced chatbot that integrates with existing system"""
    
    def __init__(self):
        self.context_enhancer = ContextEnhancer()
        self.response_generator = ResponseGenerator()
        self.classifier = EnhancedDocumentClassifier()
    
    def process_user_input(self, text: str, session: Dict, access_token: str) -> str:
        """Enhanced processing of user input with better understanding"""
        
        # 1. Analyze user intent and context
        intent_analysis = self.context_enhancer.analyze_user_intent(text, session)
        
        # 2. Enhanced document classification
        classification = self.classifier.classify_document_type(text, session)
        
        # 3. Extract entities for better understanding
        entities = self.classifier.extract_entities(text)
        
        # 4. Generate base response using existing logic
        base_response = self._generate_base_response(text, session, access_token, classification)
        
        # 5. Enhance response with context awareness
        enhanced_response = self.context_enhancer.generate_contextual_response(
            base_response, session, intent_analysis
        )
        
        # 6. Add smart suggestions if confidence is low
        if classification['confidence'] < 0.7:
            suggestions = self.response_generator.generate_smart_suggestions(text, session)
            if suggestions:
                enhanced_response += "\n\n💡 **Suggestions:**\n" + "\n".join([f"• {s}" for s in suggestions])
        
        # 7. Update session with enhanced context
        self._update_session_context(session, intent_analysis, entities, classification)
        
        return enhanced_response
    
    def _generate_base_response(self, text: str, session: Dict, access_token: str, classification: Dict) -> str:
        """Generate base response using existing chatbot logic"""
        # This would integrate with your existing handle_user_text function
        # For now, return a placeholder that would call the existing logic
        
        # Import your existing function
        try:
            from backend.ai.services.train.chatbot_cli import handle_user_text
            return handle_user_text(session, text, access_token)
        except ImportError:
            # Fallback response
            return "I understand you need help with document requests. Let me assist you!"
    
    def _update_session_context(self, session: Dict, intent_analysis: Dict, entities: Dict, classification: Dict):
        """Update session with enhanced context information"""
        session['enhanced_context'] = {
            'intent_analysis': intent_analysis,
            'entities': entities,
            'classification': classification,
            'timestamp': session.get('timestamp', 'unknown')
        }
        
        # Update document type if confidence is high
        if classification['confidence'] > 0.7:
            session['doc_type'] = classification['document_type']
            session['classification_confidence'] = classification['confidence']
    
    def get_conversation_summary(self, session: Dict) -> str:
        """Generate a summary of the conversation"""
        if not session.get('enhanced_context'):
            return "No enhanced context available."
        
        context = session['enhanced_context']
        intent = context.get('intent_analysis', {})
        classification = context.get('classification', {})
        
        summary = f"""
📊 **Conversation Summary:**
• **Primary Intent:** {intent.get('primary_intent', 'unknown')}
• **Urgency Level:** {intent.get('urgency', 'normal')}
• **Document Type:** {classification.get('document_type', 'not determined')}
• **Confidence:** {classification.get('confidence', 0):.2f}
• **Context Clues:** {', '.join(intent.get('context_clues', []))}
        """
        
        return summary.strip()
    
    def suggest_next_steps(self, session: Dict) -> list:
        """Suggest next steps based on conversation context"""
        suggestions = []
        
        if not session.get('enhanced_context'):
            return ["Continue the conversation to get better suggestions"]
        
        context = session['enhanced_context']
        intent = context.get('intent_analysis', {})
        classification = context.get('classification', {})
        
        # High urgency suggestions
        if intent.get('urgency') == 'high':
            suggestions.append("🚨 Consider marking this as urgent in your request")
            suggestions.append("📞 Contact the registrar's office directly for urgent requests")
        
        # Low confidence suggestions
        if classification.get('confidence', 0) < 0.5:
            suggestions.append("❓ Please clarify what specific document you need")
            suggestions.append("📋 Try being more specific about the document type")
        
        # Document type specific suggestions
        doc_type = classification.get('document_type')
        if doc_type == 'OTR':
            suggestions.append("📜 OTR includes all your academic records")
            suggestions.append("⏰ Processing time is typically 3-5 business days")
        elif doc_type == 'COG':
            suggestions.append("📊 COG shows grades for specific semesters")
            suggestions.append("📅 Specify which semester you need")
        
        return suggestions[:3]  # Limit to 3 suggestions
