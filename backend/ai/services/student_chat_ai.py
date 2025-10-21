# Student Chat AI - Handles random student conversations
import random
from typing import Dict, List, Optional
from datetime import datetime

class StudentChatAI:
    """AI model for handling random student chat conversations"""
    
    def __init__(self):
        # Conversation topics and responses
        self.conversation_topics = {
            'greeting': {
                'patterns': ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
                'responses': [
                    "👋 Hello! How can I help you today?",
                    "Hi there! What's on your mind?",
                    "Hey! Ready to assist with anything you need!",
                    "Good to see you! How can I be of help?"
                ]
            },
            'academic_help': {
                'patterns': ['help', 'assist', 'support', 'guide', 'advice', 'question'],
                'responses': [
                    "📚 I'm here to help with your academic needs! What do you need assistance with?",
                    "Of course! I can help with document requests, academic questions, or general guidance.",
                    "I'd be happy to assist! Are you looking for help with documents or something else?",
                    "Sure thing! I can help with various academic matters. What's your question?"
                ]
            },
            'general_chat': {
                'patterns': ['how are you', 'what\'s up', 'tell me', 'chat', 'talk'],
                'responses': [
                    "I'm doing great, thanks for asking! How about you?",
                    "All good here! Just ready to help with whatever you need.",
                    "I'm here and ready to assist! What would you like to talk about?",
                    "Doing well! How can I make your day better?"
                ]
            },
            'compliments': {
                'patterns': ['thank you', 'thanks', 'appreciate', 'great', 'awesome', 'amazing'],
                'responses': [
                    "😊 You're very welcome! Happy to help!",
                    "My pleasure! That's what I'm here for!",
                    "You're so kind! I'm glad I could assist!",
                    "Thank you! It's always great to help students like you!"
                ]
            },
            'frustration': {
                'patterns': ['frustrated', 'annoyed', 'upset', 'angry', 'mad', 'difficult'],
                'responses': [
                    "I understand that can be frustrating. Let me help you work through this.",
                    "I'm sorry you're feeling that way. How can I make this easier for you?",
                    "I hear you, and I'm here to help resolve whatever's bothering you.",
                    "Let's tackle this together. What's the main issue you're facing?"
                ]
            },
            'encouragement': {
                'patterns': ['stressed', 'worried', 'nervous', 'anxious', 'concerned', 'scared'],
                'responses': [
                    "💪 You've got this! I believe in you and I'm here to support you.",
                    "Take a deep breath. You're stronger than you think, and I'm here to help!",
                    "Don't worry, we'll figure this out together. You're not alone in this.",
                    "I understand it's challenging, but you're capable of handling this. Let me help!"
                ]
            },
            'academic_questions': {
                'patterns': ['grade', 'gpa', 'course', 'subject', 'study', 'exam', 'test'],
                'responses': [
                    "📖 I can help with academic questions! What specific subject or topic are you asking about?",
                    "For academic matters, I can assist with general guidance. What's your question?",
                    "I'm here to help with academic support! What do you need to know?",
                    "Academic questions are my specialty! What would you like to discuss?"
                ]
            },
            'social': {
                'patterns': ['friends', 'social', 'party', 'weekend', 'fun', 'hangout'],
                'responses': [
                    "That sounds like fun! Remember to balance social time with your studies!",
                    "Great to hear about your social life! How are your studies going?",
                    "Social connections are important! Just make sure to keep up with your academic responsibilities too.",
                    "Sounds exciting! Don't forget to stay on top of your academic work as well!"
                ]
            }
        }
        
        # Fallback responses for unrecognized input
        self.fallback_responses = [
            "That's interesting! Can you tell me more about that?",
            "I see! How can I help you with that?",
            "That sounds important to you. What would you like to do about it?",
            "I understand. Is there anything specific I can help you with?",
            "Thanks for sharing! How can I assist you today?",
            "That's good to know! What else can I help you with?",
            "I appreciate you telling me that. What's next?",
            "Interesting perspective! What would you like to discuss?"
        ]
        
        # Conversation memory for context
        self.conversation_memory = {}
        
        print("✅ Student Chat AI initialized")
    
    def process_student_chat(self, text: str, session: Dict, user_id: str) -> str:
        """Process random student chat with contextual responses"""
        
        # Clean and analyze input
        text_lower = text.lower().strip()
        
        # Get conversation context
        context = self._get_conversation_context(user_id, session)
        
        # Analyze intent and sentiment
        intent_analysis = self._analyze_chat_intent(text_lower, context)
        
        # Generate appropriate response
        response = self._generate_chat_response(text_lower, intent_analysis, context)
        
        # Update conversation memory
        self._update_conversation_memory(user_id, text, response, intent_analysis)
        
        return response
    
    def _get_conversation_context(self, user_id: str, session: Dict) -> Dict:
        """Get conversation context for better responses"""
        if user_id not in self.conversation_memory:
            self.conversation_memory[user_id] = {
                'recent_topics': [],
                'mood': 'neutral',
                'interaction_count': 0,
                'last_interaction': None
            }
        
        return self.conversation_memory[user_id]
    
    def _analyze_chat_intent(self, text: str, context: Dict) -> Dict:
        """Analyze the intent and sentiment of the chat"""
        intent_analysis = {
            'primary_topic': 'general',
            'sentiment': 'neutral',
            'urgency': 'low',
            'needs_help': False,
            'confidence': 0.5
        }
        
        # Check for topic patterns
        for topic, data in self.conversation_topics.items():
            for pattern in data['patterns']:
                if pattern in text:
                    intent_analysis['primary_topic'] = topic
                    intent_analysis['confidence'] = 0.8
                    break
        
        # Analyze sentiment
        positive_words = ['good', 'great', 'awesome', 'amazing', 'wonderful', 'excellent', 'happy', 'excited']
        negative_words = ['bad', 'terrible', 'awful', 'horrible', 'sad', 'angry', 'frustrated', 'worried']
        
        if any(word in text for word in positive_words):
            intent_analysis['sentiment'] = 'positive'
        elif any(word in text for word in negative_words):
            intent_analysis['sentiment'] = 'negative'
        
        # Check for help indicators
        help_indicators = ['help', 'assist', 'support', 'question', 'problem', 'issue', 'stuck']
        if any(word in text for word in help_indicators):
            intent_analysis['needs_help'] = True
        
        # Check for urgency
        urgent_words = ['urgent', 'asap', 'immediately', 'emergency', 'crisis']
        if any(word in text for word in urgent_words):
            intent_analysis['urgency'] = 'high'
        
        return intent_analysis
    
    def _generate_chat_response(self, text: str, intent_analysis: Dict, context: Dict) -> str:
        """Generate contextual chat response"""
        
        topic = intent_analysis['primary_topic']
        sentiment = intent_analysis['sentiment']
        needs_help = intent_analysis['needs_help']
        urgency = intent_analysis['urgency']
        
        # Get base response from topic
        if topic in self.conversation_topics:
            base_responses = self.conversation_topics[topic]['responses']
            response = random.choice(base_responses)
        else:
            response = random.choice(self.fallback_responses)
        
        # Add contextual enhancements
        response = self._add_contextual_enhancements(response, intent_analysis, context)
        
        # Add follow-up questions for engagement
        response = self._add_engagement_elements(response, intent_analysis)
        
        return response
    
    def _add_contextual_enhancements(self, response: str, intent_analysis: Dict, context: Dict) -> str:
        """Add contextual enhancements to the response"""
        
        # Add sentiment-based elements
        if intent_analysis['sentiment'] == 'positive':
            response += " 😊"
        elif intent_analysis['sentiment'] == 'negative':
            response += " 💙"
        
        # Add urgency handling
        if intent_analysis['urgency'] == 'high':
            response = f"🚨 {response}\n\n*I understand this is urgent. Let me help you right away!*"
        
        # Add help indicators
        if intent_analysis['needs_help']:
            response += "\n\n💡 *I'm here to help with whatever you need!*"
        
        # Add personalization based on conversation history
        if context['interaction_count'] > 3:
            response += f"\n\n*I remember we've chatted before - thanks for coming back!*"
        
        return response
    
    def _add_engagement_elements(self, response: str, intent_analysis: Dict) -> str:
        """Add engagement elements to keep conversation flowing"""
        
        engagement_questions = {
            'general': [
                "What else is on your mind?",
                "Is there anything else I can help with?",
                "How else can I assist you today?"
            ],
            'academic_help': [
                "Do you have any other academic questions?",
                "Is there anything else about your studies I can help with?",
                "What other academic support do you need?"
            ],
            'social': [
                "How are your studies going alongside your social life?",
                "Are you managing to balance everything well?",
                "How can I help you stay on track academically?"
            ]
        }
        
        topic = intent_analysis['primary_topic']
        if topic in engagement_questions:
            question = random.choice(engagement_questions[topic])
            response += f"\n\n{question}"
        
        return response
    
    def _update_conversation_memory(self, user_id: str, text: str, response: str, intent_analysis: Dict):
        """Update conversation memory for better future responses"""
        if user_id not in self.conversation_memory:
            self.conversation_memory[user_id] = {
                'recent_topics': [],
                'mood': 'neutral',
                'interaction_count': 0,
                'last_interaction': None
            }
        
        memory = self.conversation_memory[user_id]
        
        # Update interaction count
        memory['interaction_count'] += 1
        
        # Update recent topics
        topic = intent_analysis['primary_topic']
        if topic not in memory['recent_topics']:
            memory['recent_topics'].append(topic)
            # Keep only last 5 topics
            if len(memory['recent_topics']) > 5:
                memory['recent_topics'].pop(0)
        
        # Update mood based on sentiment
        if intent_analysis['sentiment'] == 'positive':
            memory['mood'] = 'positive'
        elif intent_analysis['sentiment'] == 'negative':
            memory['mood'] = 'negative'
        
        # Update last interaction
        memory['last_interaction'] = datetime.now().isoformat()
    
    def get_conversation_analytics(self, user_id: str) -> Dict:
        """Get analytics about the conversation with a user"""
        if user_id not in self.conversation_memory:
            return {'error': 'No conversation history found'}
        
        memory = self.conversation_memory[user_id]
        
        return {
            'interaction_count': memory['interaction_count'],
            'recent_topics': memory['recent_topics'],
            'current_mood': memory['mood'],
            'last_interaction': memory['last_interaction'],
            'engagement_level': self._calculate_engagement_level(memory)
        }
    
    def _calculate_engagement_level(self, memory: Dict) -> str:
        """Calculate user engagement level"""
        count = memory['interaction_count']
        
        if count > 10:
            return 'high'
        elif count > 5:
            return 'medium'
        else:
            return 'low'
    
    def reset_conversation_memory(self, user_id: str):
        """Reset conversation memory for a user"""
        if user_id in self.conversation_memory:
            del self.conversation_memory[user_id]
    
    def get_system_stats(self) -> Dict:
        """Get overall system statistics"""
        total_users = len(self.conversation_memory)
        total_interactions = sum(memory['interaction_count'] for memory in self.conversation_memory.values())
        
        return {
            'total_active_users': total_users,
            'total_interactions': total_interactions,
            'average_interactions_per_user': total_interactions / total_users if total_users > 0 else 0,
            'system_status': 'active'
        }

