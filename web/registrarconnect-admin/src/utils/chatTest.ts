// Test utility for chat functionality
import { apiService } from '../services/api';

export const testChatEndpoint = async () => {
  try {
    console.log('🧪 Testing chat endpoint...');
    
    const testMessage = "Hello, I need help with my transcript";
    const testHistory = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi! How can I help you?' }
    ];
    
    const response = await apiService.sendChatMessage(testMessage, testHistory);
    console.log('✅ Chat test successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Chat test failed:', error);
    throw error;
  }
};

export const testChatWithConversationId = async (conversationId: string) => {
  try {
    console.log('🧪 Testing chat with conversation ID:', conversationId);
    
    const testMessage = "I want to request a COG";
    const testHistory = [];
    
    const response = await apiService.sendChatMessage(testMessage, testHistory);
    console.log('✅ Chat test with conversation ID successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Chat test with conversation ID failed:', error);
    throw error;
  }
};
