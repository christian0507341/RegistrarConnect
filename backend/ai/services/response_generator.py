# Enhanced response generation for the chatbot
import random
from typing import Dict, List, Optional
from datetime import datetime

class ResponseGenerator:
    """Generates more natural and helpful responses"""
    
    def __init__(self):
        self.response_templates = {
            'greeting': [
                "👋 Hello! I'm here to help with your document requests.",
                "Hi there! Ready to assist with your academic documents.",
                "Welcome! Let's get your document request sorted out."
            ],
            'document_confirmation': [
                "Perfect! I'll help you request a {doc_type}.",
                "Great choice! Let's process your {doc_type} request.",
                "Excellent! A {doc_type} request it is."
            ],
            'status_update': [
                "📊 Your {doc_type} request is currently {status}.",
                "Here's the latest on your {doc_type}: {status}",
                "📋 Status update: {doc_type} is {status}"
            ],
            'help': [
                "🆘 I'm here to help! Here's what I can do:",
                "💡 Let me show you what I can assist with:",
                "🤝 Here's how I can help you today:"
            ]
        }
        
        self.emojis = {
            'otr': '📜',
            'cog': '📊', 
            'coe': '📋',
            'others': '📄',
            'success': '✅',
            'warning': '⚠️',
            'info': 'ℹ️',
            'urgent': '🚨'
        }
    
    def generate_greeting(self, session: Dict) -> str:
        """Generate personalized greeting"""
        templates = self.response_templates['greeting']
        greeting = random.choice(templates)
        
        # Add personalization based on time of day
        current_hour = datetime.now().hour
        if 5 <= current_hour < 12:
            greeting = "🌅 Good morning! " + greeting
        elif 12 <= current_hour < 17:
            greeting = "☀️ Good afternoon! " + greeting
        elif 17 <= current_hour < 22:
            greeting = "🌆 Good evening! " + greeting
        else:
            greeting = "🌙 Good evening! " + greeting
        
        return greeting
    
    def generate_document_confirmation(self, doc_type: str, session: Dict) -> str:
        """Generate document type confirmation with context"""
        template = random.choice(self.response_templates['document_confirmation'])
        response = template.format(doc_type=doc_type)
        
        # Add emoji based on document type
        emoji = self.emojis.get(doc_type.lower(), '📄')
        response = f"{emoji} {response}"
        
        # Add helpful context
        if doc_type.upper() == 'OTR':
            response += "\n\n📝 *This will include all your academic records and grades.*"
        elif doc_type.upper() == 'COG':
            response += "\n\n📊 *This shows your grades for specific semesters.*"
        elif doc_type.upper() == 'COE':
            response += "\n\n📋 *This confirms your current enrollment status.*"
        
        return response
    
    def generate_status_response(self, doc_type: str, status: str, session: Dict) -> str:
        """Generate status response with helpful information"""
        template = random.choice(self.response_templates['status_update'])
        response = template.format(doc_type=doc_type, status=status)
        
        # Add status-specific information
        status_info = self._get_status_info(status)
        if status_info:
            response += f"\n\n{status_info}"
        
        return response
    
    def _get_status_info(self, status: str) -> str:
        """Get helpful information about status"""
        status_messages = {
            'draft': "📝 *Your request is being prepared. You can still make changes.*",
            'confirming': "⏳ *Waiting for your confirmation. Please review the details.*",
            'awaiting_payment': "💳 *Payment is required to process your request.*",
            'pending': "👨‍🏫 *Your request is under faculty review.*",
            'on_process': "⚙️ *Your document is being processed.*",
            'ready_to_claim': "🎉 *Your document is ready for pickup!*",
            'completed': "✅ *Your request has been completed.*"
        }
        return status_messages.get(status, "")
    
    def generate_help_response(self, session: Dict) -> str:
        """Generate comprehensive help response"""
        template = random.choice(self.response_templates['help'])
        
        help_text = f"""
{template}

📋 **Document Requests:**
• **OTR** - Official Transcript of Records
• **COG** - Certificate of Grades  
• **COE** - Certificate of Enrollment
• **Others** - Custom certificates

🔧 **Commands:**
• **help** - Show this help message
• **status** - Check your request status
• **history** - View conversation history
• **reset** - Start over with a new request

💡 **Just ask naturally!** 
Try: "I need an OTR" or "How do I get my transcript?"
        """
        
        return help_text.strip()
    
    def generate_error_response(self, error_type: str, context: Dict = None) -> str:
        """Generate user-friendly error responses"""
        error_responses = {
            'network_error': "🌐 *Connection issue. Please try again in a moment.*",
            'validation_error': "⚠️ *Please check your input and try again.*",
            'auth_error': "🔒 *Authentication required. Please log in again.*",
            'server_error': "🔧 *Server issue. Our team has been notified.*"
        }
        
        base_response = error_responses.get(error_type, "❌ *Something went wrong. Please try again.*")
        
        if context and context.get('suggestion'):
            base_response += f"\n\n💡 *Suggestion: {context['suggestion']}*"
        
        return base_response
    
    def generate_smart_suggestions(self, user_input: str, session: Dict) -> List[str]:
        """Generate smart suggestions based on user input"""
        suggestions = []
        input_lower = user_input.lower()
        
        # Document type suggestions
        if any(word in input_lower for word in ['transcript', 'grades', 'academic']):
            suggestions.append("📜 Request an OTR (Official Transcript)")
            suggestions.append("📊 Request a COG (Certificate of Grades)")
        
        if any(word in input_lower for word in ['enrollment', 'enrolled', 'student']):
            suggestions.append("📋 Request a COE (Certificate of Enrollment)")
        
        # Action suggestions
        if 'status' in input_lower:
            suggestions.append("📊 Check your request status")
            suggestions.append("📋 View your request history")
        
        return suggestions[:3]  # Limit to 3 suggestions
