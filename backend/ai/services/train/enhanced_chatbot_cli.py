#!/usr/bin/env python3
"""
Enhanced Chatbot CLI for RegistrarConnect
Improved AI responses with better context understanding and user experience.
"""

import re, json, hashlib, datetime as dt
from typing import Dict, Optional, List
import difflib
import requests
from django.utils.text import slugify

# Enhanced response templates
RESPONSE_TEMPLATES = {
    "welcome": [
        "👋 **Hello! I'm your AI Assistant for document requests.**\n\nI can help you with:\n• **OTR** (Official Transcript of Records)\n• **COG** (Certificate of Grades)\n• **COE** (Certificate of Enrollment)\n• **Other certificates**\n\n💡 **Try saying:**\n• \"I need my transcript\"\n• \"Request COG\"\n• \"How to get COE?\"\n\nWhat can I help you with today?",
        "🎓 **Welcome to RegistrarConnect AI Assistant!**\n\nI'm here to help you request documents quickly and easily. Here's what I can assist you with:\n\n📋 **Available Documents:**\n• **OTR** - Official Transcript of Records\n• **COG** - Certificate of Grades\n• **COE** - Certificate of Enrollment\n• **Others** - Good Moral, Clearance, etc.\n\n🚀 **Let's get started!** What document do you need?",
        "🌟 **Hi there! I'm your smart assistant for document requests.**\n\nI can help you with all your academic document needs:\n\n📄 **Document Types:**\n• **OTR** - For employment, further studies\n• **COG** - For scholarships, transfers\n• **COE** - For enrollment verification\n• **Others** - Good Moral, Clearance, etc.\n\n💬 **Just tell me what you need!**"
    ],
    
    "document_help": {
        "OTR": "📋 **OTR (Official Transcript of Records)**\n\nI'll help you request your transcript! Here's what I need:\n• **Purpose** of your request (e.g., Employment, Further Studies, Visa)\n• No semester or school year required for transcripts\n\n**Process:** Confirm → Payment → Faculty Review → Ready for pickup next working day! 🎓",
        "COG": "📊 **COG (Certificate of Grades)**\n\nI'll help you request your grades certificate! Here's what I need:\n• **Semester** (1st or 2nd)\n• **School Year** (e.g., 2024-2025)\n• **Purpose** of your request\n\n**Process:** Confirm → Payment → Faculty Review → Ready for pickup next working day! 📈",
        "COE": "📝 **COE (Certificate of Enrollment)**\n\nI'll help you request your enrollment certificate! Here's what I need:\n• **Semester** (1st or 2nd)\n• **School Year** (e.g., 2024-2025)\n• **Purpose** of your request\n\n**Process:** Confirm → Payment → Faculty Review → Ready for pickup next working day! 🎯",
        "OTHERS": "📜 **Other Certificates**\n\nI'll help you request other certificates! Here's what I need:\n• **Certificate Type** (e.g., Good Moral, Clearance, Honorable Dismissal)\n• **Purpose** of your request\n• **Additional Details** if needed\n\n**Process:** Confirm → Payment → Faculty Review → Ready for pickup next working day! 🏆"
    },
    
    "questions": {
        "doc_type": "🎯 **Which document do you need?**\n\n• **OTR** - Official Transcript of Records\n• **COG** - Certificate of Grades\n• **COE** - Certificate of Enrollment\n• **Others** - Good Moral, Clearance, etc.\n\nJust type the document name or abbreviation!",
        "semester": "📅 **Which semester?**\n\n• **1st Semester** - First semester\n• **2nd Semester** - Second semester\n• **Not Applicable** - For OTR and some other documents\n\nPlease specify:",
        "school_year": "🎓 **What school year?**\n\nPlease provide the school year (e.g., 2024-2025, 2025-2026):",
        "purpose": "🎯 **What's the purpose of your request?**\n\nCommon purposes:\n• Employment\n• Further Studies\n• Scholarship\n• Visa Application\n• Transfer\n• Other\n\nPlease specify:",
        "sis_confirm": "🔍 **Let me verify your student information...**\n\nI'll check your enrollment status and academic records to ensure everything is correct for your document request.",
        "specify": "📝 **Please provide more details:**\n\nCould you give me more specific information about your request? This will help me process it more accurately."
    },
    
    "confirmations": {
        "success": "✅ **Request Confirmed!**\n\nYour document request has been successfully submitted. You'll receive a confirmation email shortly with your request details and next steps.",
        "payment": "💳 **Payment Information**\n\nYour request is ready for payment. Please choose your preferred payment method:\n• **Personal (Finance Office)** - Pay at the Finance Office\n• **Online (GCash)** - Pay via GCash\n\nHow would you like to pay?",
        "processing": "⏳ **Processing Your Request**\n\nYour document request is being processed. You'll receive updates via email as it progresses through the approval workflow."
    },
    
    "errors": {
        "not_found": "❌ **Sorry, I couldn't find that information.**\n\nCould you please rephrase your request or provide more details?",
        "invalid": "⚠️ **Invalid input detected.**\n\nPlease provide a valid response. If you need help, just type 'help' or 'start over'.",
        "system": "🔧 **System temporarily unavailable.**\n\nPlease try again in a few moments. If the problem persists, contact support."
    }
}

# Enhanced conversation flow
class EnhancedConversationFlow:
    def __init__(self):
        self.current_step = "welcome"
        self.collected_data = {}
        self.context = {}
        
    def get_next_response(self, user_input: str, session: Dict) -> str:
        """Generate enhanced response based on conversation flow."""
        user_input_lower = user_input.lower().strip()
        
        # Handle special commands
        if user_input_lower in ['help', '/help']:
            return self._get_help_message()
        elif user_input_lower in ['reset', 'start over', 'new']:
            return self._reset_conversation()
        elif user_input_lower in ['status', 'check status']:
            return self._get_status_message()
        elif user_input_lower in ['history', 'my requests']:
            return self._get_history_message()
        
        # Process based on current step
        if self.current_step == "welcome":
            return self._handle_welcome(user_input, session)
        elif self.current_step == "doc_type":
            return self._handle_doc_type(user_input, session)
        elif self.current_step == "semester":
            return self._handle_semester(user_input, session)
        elif self.current_step == "school_year":
            return self._handle_school_year(user_input, session)
        elif self.current_step == "purpose":
            return self._handle_purpose(user_input, session)
        elif self.current_step == "confirmation":
            return self._handle_confirmation(user_input, session)
        else:
            return self._handle_general(user_input, session)
    
    def _get_help_message(self) -> str:
        return (
            "🆘 **Available Commands:**\n\n"
            "• **help** - Show this help message\n"
            "• **status** - Check your request status\n"
            "• **history** - View conversation history\n"
            "• **reset** - Start over with a new request\n"
            "• **cancel** - Cancel current request (only during confirmation)\n\n"
            "💡 **Or just ask me anything!** I can help with document requests, questions, and more."
        )
    
    def _reset_conversation(self) -> str:
        self.current_step = "welcome"
        self.collected_data = {}
        return "🔄 **Starting fresh!**\n\n" + self._get_welcome_message()
    
    def _get_status_message(self) -> str:
        return (
            "📊 **Your Request Status**\n\n"
            "• **Pending Requests:** 2\n"
            "• **Processing:** 1\n"
            "• **Ready for Pickup:** 0\n"
            "• **Completed:** 5\n\n"
            "💡 **Need more details?** Check your email for specific updates or contact the registrar's office."
        )
    
    def _get_history_message(self) -> str:
        return (
            "📚 **Your Request History**\n\n"
            "• **OTR Request** - Submitted 2 days ago (Processing)\n"
            "• **COG Request** - Submitted 1 week ago (Ready for Pickup)\n"
            "• **COE Request** - Submitted 2 weeks ago (Completed)\n\n"
            "💡 **Need to check a specific request?** Let me know the document type or date."
        )
    
    def _get_welcome_message(self) -> str:
        import random
        return random.choice(RESPONSE_TEMPLATES["welcome"])
    
    def _handle_welcome(self, user_input: str, session: Dict) -> str:
        # Try to detect document type from user input
        doc_type = self._detect_document_type(user_input)
        if doc_type:
            self.collected_data["doc_type"] = doc_type
            self.current_step = "semester"
            return RESPONSE_TEMPLATES["document_help"][doc_type]
        else:
            return RESPONSE_TEMPLATES["questions"]["doc_type"]
    
    def _handle_doc_type(self, user_input: str, session: Dict) -> str:
        doc_type = self._detect_document_type(user_input)
        if doc_type:
            self.collected_data["doc_type"] = doc_type
            self.current_step = "semester"
            return RESPONSE_TEMPLATES["document_help"][doc_type]
        else:
            return "❌ **I didn't understand that document type.**\n\n" + RESPONSE_TEMPLATES["questions"]["doc_type"]
    
    def _handle_semester(self, user_input: str, session: Dict) -> str:
        semester = self._detect_semester(user_input)
        if semester is not None:
            self.collected_data["semester"] = semester
            if self.collected_data.get("doc_type") in ["OTR", "OTHERS"]:
                self.current_step = "purpose"
                return RESPONSE_TEMPLATES["questions"]["purpose"]
            else:
                self.current_step = "school_year"
                return RESPONSE_TEMPLATES["questions"]["school_year"]
        else:
            return "❌ **I didn't understand the semester.**\n\n" + RESPONSE_TEMPLATES["questions"]["semester"]
    
    def _handle_school_year(self, user_input: str, session: Dict) -> str:
        school_year = self._detect_school_year(user_input)
        if school_year:
            self.collected_data["school_year"] = school_year
            self.current_step = "purpose"
            return RESPONSE_TEMPLATES["questions"]["purpose"]
        else:
            return "❌ **I didn't understand the school year.**\n\n" + RESPONSE_TEMPLATES["questions"]["school_year"]
    
    def _handle_purpose(self, user_input: str, session: Dict) -> str:
        purpose = self._detect_purpose(user_input)
        if purpose:
            self.collected_data["purpose"] = purpose
            self.current_step = "confirmation"
            return self._generate_confirmation_message()
        else:
            return "❌ **I didn't understand the purpose.**\n\n" + RESPONSE_TEMPLATES["questions"]["purpose"]
    
    def _handle_confirmation(self, user_input: str, session: Dict) -> str:
        if user_input_lower in ['yes', 'confirm', 'proceed', 'submit']:
            return self._process_request()
        elif user_input_lower in ['no', 'cancel', 'back']:
            self.current_step = "welcome"
            return "🔄 **Request cancelled.**\n\n" + self._get_welcome_message()
        else:
            return "❓ **Please confirm your request:**\n\nType 'yes' to proceed or 'no' to cancel."
    
    def _handle_general(self, user_input: str, session: Dict) -> str:
        # Try to understand what the user wants
        if any(word in user_input_lower for word in ['document', 'request', 'need', 'want']):
            return self._handle_welcome(user_input, session)
        else:
            return "🤔 **I'm not sure what you need.**\n\n" + self._get_help_message()
    
    def _detect_document_type(self, text: str) -> Optional[str]:
        """Enhanced document type detection."""
        text_lower = text.lower()
        
        # OTR patterns
        if any(word in text_lower for word in ['otr', 'tor', 'transcript', 'official transcript']):
            return "OTR"
        
        # COG patterns
        if any(word in text_lower for word in ['cog', 'grades', 'certificate of grades', 'copy of grades']):
            return "COG"
        
        # COE patterns
        if any(word in text_lower for word in ['coe', 'enrollment', 'certificate of enrollment', 'enrolment']):
            return "COE"
        
        # Others patterns
        if any(word in text_lower for word in ['good moral', 'clearance', 'honorable dismissal', 'graduation', 'others']):
            return "OTHERS"
        
        return None
    
    def _detect_semester(self, text: str) -> Optional[int]:
        """Enhanced semester detection."""
        text_lower = text.lower()
        
        if any(word in text_lower for word in ['1st', 'first', '1', 'one', 'sem 1', 'semester 1']):
            return 1
        elif any(word in text_lower for word in ['2nd', 'second', '2', 'two', 'sem 2', 'semester 2']):
            return 2
        elif any(word in text_lower for word in ['na', 'n/a', 'not applicable', 'none']):
            return 0
        
        return None
    
    def _detect_school_year(self, text: str) -> Optional[str]:
        """Enhanced school year detection."""
        # Look for patterns like 2024-2025, 2025-2026, etc.
        import re
        pattern = r'(\d{4})-(\d{4})'
        match = re.search(pattern, text)
        if match:
            return f"{match.group(1)}-{match.group(2)}"
        
        # Look for patterns like 24/25, 25/26, etc.
        pattern = r'(\d{2})/(\d{2})'
        match = re.search(pattern, text)
        if match:
            year1 = int(match.group(1))
            year2 = int(match.group(2))
            if year2 == year1 + 1:
                return f"20{year1}-20{year2}"
        
        return None
    
    def _detect_purpose(self, text: str) -> Optional[str]:
        """Enhanced purpose detection."""
        text_lower = text.lower()
        
        if any(word in text_lower for word in ['employment', 'job', 'work', 'career']):
            return "Employment"
        elif any(word in text_lower for word in ['study', 'studies', 'graduate', 'university', 'college']):
            return "Further Studies"
        elif any(word in text_lower for word in ['scholarship', 'financial aid', 'grant']):
            return "Scholarship"
        elif any(word in text_lower for word in ['visa', 'immigration', 'travel', 'abroad']):
            return "Visa Application"
        elif any(word in text_lower for word in ['transfer', 'another school', 'different university']):
            return "Transfer"
        else:
            return text.title()  # Use the input as purpose if no pattern matches
    
    def _generate_confirmation_message(self) -> str:
        """Generate confirmation message with collected data."""
        doc_type = self.collected_data.get("doc_type", "Unknown")
        semester = self.collected_data.get("semester")
        school_year = self.collected_data.get("school_year", "Not specified")
        purpose = self.collected_data.get("purpose", "Not specified")
        
        message = f"📋 **Please confirm your request:**\n\n"
        message += f"**Document Type:** {doc_type}\n"
        
        if semester is not None:
            if semester == 0:
                message += f"**Semester:** Not applicable\n"
            else:
                message += f"**Semester:** {semester}{'st' if semester == 1 else 'nd'} Semester\n"
        
        if school_year != "Not specified":
            message += f"**School Year:** {school_year}\n"
        
        message += f"**Purpose:** {purpose}\n\n"
        message += f"**Is this information correct?** Type 'yes' to proceed or 'no' to make changes."
        
        return message
    
    def _process_request(self) -> str:
        """Process the confirmed request."""
        # Here you would integrate with your actual request processing system
        return (
            "✅ **Request Submitted Successfully!**\n\n"
            "Your document request has been processed and submitted. You will receive:\n"
            "• **Confirmation Email** within 5 minutes\n"
            "• **Request ID** for tracking\n"
            "• **Payment Instructions** if applicable\n\n"
            "📧 **Check your email for details!**\n\n"
            "💡 **Need help with anything else?** Just ask!"
        )

# Enhanced chatbot functions
def start_enhanced_conversation(user_id: str) -> str:
    """Start an enhanced conversation with the user."""
    flow = EnhancedConversationFlow()
    return flow._get_welcome_message()

def handle_enhanced_user_input(user_input: str, session: Dict) -> str:
    """Handle user input with enhanced conversation flow."""
    flow = EnhancedConversationFlow()
    return flow.get_next_response(user_input, session)

def get_enhanced_help() -> str:
    """Get enhanced help message."""
    return (
        "🆘 **RegistrarConnect AI Assistant Help**\n\n"
        "**Available Commands:**\n"
        "• **help** - Show this help message\n"
        "• **status** - Check your request status\n"
        "• **history** - View your request history\n"
        "• **reset** - Start a new request\n"
        "• **cancel** - Cancel current request\n\n"
        "**Document Types I can help with:**\n"
        "• **OTR** - Official Transcript of Records\n"
        "• **COG** - Certificate of Grades\n"
        "• **COE** - Certificate of Enrollment\n"
        "• **Others** - Good Moral, Clearance, etc.\n\n"
        "**Just tell me what you need!** 🚀"
    )

# Main execution
if __name__ == "__main__":
    print("🤖 Enhanced Chatbot CLI Ready!")
    print("=" * 50)
    
    # Test the enhanced conversation flow
    flow = EnhancedConversationFlow()
    
    print("Starting conversation...")
    print(flow._get_welcome_message())
    
    while True:
        user_input = input("\nYou: ")
        if user_input.lower() in ['quit', 'exit', 'bye']:
            print("👋 Goodbye!")
            break
        
        response = flow.get_next_response(user_input, {})
        print(f"\nAI: {response}")
