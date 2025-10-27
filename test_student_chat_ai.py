#!/usr/bin/env python3
"""
Test script for Student Chat AI
Demonstrates the AI's ability to handle random student conversations
"""

import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

def test_student_chat_ai():
    """Test the Student Chat AI with various conversation scenarios"""
    
    try:
        from backend.ai.services.student_chat_ai import StudentChatAI
        
        print("🤖 Testing Student Chat AI")
        print("=" * 50)
        
        # Initialize the AI
        chat_ai = StudentChatAI()
        
        # Test scenarios
        test_scenarios = [
            {
                "input": "Hello! How are you today?",
                "description": "Greeting"
            },
            {
                "input": "I'm feeling really stressed about my exams",
                "description": "Emotional support"
            },
            {
                "input": "Can you help me with my studies?",
                "description": "Academic help request"
            },
            {
                "input": "Thanks so much for your help!",
                "description": "Gratitude"
            },
            {
                "input": "I had a great weekend with my friends",
                "description": "Social sharing"
            },
            {
                "input": "What do you think about artificial intelligence?",
                "description": "General conversation"
            },
            {
                "input": "I'm frustrated with this assignment",
                "description": "Frustration"
            },
            {
                "input": "Tell me about your day",
                "description": "Casual chat"
            }
        ]
        
        # Test each scenario
        for i, scenario in enumerate(test_scenarios, 1):
            print(f"\n📝 Test {i}: {scenario['description']}")
            print(f"Input: {scenario['input']}")
            
            # Simulate session data
            session = {
                'user_id': 'test_user_123',
                'conversation_id': 'test_conv_456'
            }
            
            # Get AI response
            response = chat_ai.process_student_chat(
                scenario['input'], 
                session, 
                'test_user_123'
            )
            
            print(f"AI Response: {response}")
            print("-" * 30)
        
        # Test conversation analytics
        print("\n📊 Testing Analytics")
        print("=" * 30)
        
        analytics = chat_ai.get_conversation_analytics('test_user_123')
        print(f"User Analytics: {analytics}")
        
        system_stats = chat_ai.get_system_stats()
        print(f"System Stats: {system_stats}")
        
        print("\n✅ All tests completed successfully!")
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("Make sure you're running this from the project root directory")
    except Exception as e:
        print(f"❌ Error: {e}")

def test_enhanced_chatbot():
    """Test the Enhanced Chatbot that combines document requests and general chat"""
    
    try:
        from backend.ai.services.enhanced_chatbot import EnhancedChatbot
        
        print("\n🚀 Testing Enhanced Chatbot")
        print("=" * 50)
        
        # Initialize the enhanced chatbot
        chatbot = EnhancedChatbot()
        
        # Test scenarios
        test_scenarios = [
            {
                "input": "Hello! How are you?",
                "description": "General chat"
            },
            {
                "input": "I need an OTR transcript",
                "description": "Document request"
            },
            {
                "input": "I'm stressed about my grades",
                "description": "Emotional support"
            },
            {
                "input": "Can you help me request a COE?",
                "description": "Document request with help"
            },
            {
                "input": "What's the weather like?",
                "description": "Random conversation"
            }
        ]
        
        # Test each scenario
        for i, scenario in enumerate(test_scenarios, 1):
            print(f"\n📝 Test {i}: {scenario['description']}")
            print(f"Input: {scenario['input']}")
            
            # Simulate session data
            session = {
                'user_id': 'test_user_123',
                'conversation_id': 'test_conv_456'
            }
            
            # Get AI response
            response = chatbot.process_user_input(
                scenario['input'], 
                session, 
                'test_token'
            )
            
            print(f"AI Response: {response}")
            print("-" * 30)
        
        print("\n✅ Enhanced Chatbot tests completed!")
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("🎓 Student Chat AI Test Suite")
    print("=" * 50)
    
    # Test the basic student chat AI
    test_student_chat_ai()
    
    # Test the enhanced chatbot
    test_enhanced_chatbot()
    
    print("\n🎉 All tests completed!")
