import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Bot, User, RefreshCw, Trash2, MessageCircle, Bug } from "lucide-react";
import { apiService } from "../services/api";
import { testChatEndpoint } from "../utils/chatTest";
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function StudentChatScreen() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Check if user is authenticated and is a student
    const token = localStorage.getItem("accessToken");
    const role = localStorage.getItem("role");
    
    if (!token || role !== 'student') {
      navigate('/login');
      return;
    }
    
    scrollToBottom();
  }, [messages, navigate]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    setError(null);

    try {
      const history = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await apiService.sendChatMessage(inputMessage.trim(), history);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.message?.text || response.data.response || "I'm here to help you with your document requests and academic needs.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      setError('Failed to send message. Please try again.');
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  const handleTestChat = async () => {
    try {
      setIsLoading(true);
      const result = await testChatEndpoint();
      console.log('Test result:', result);
      
      const testMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: result.message?.text || 'Test successful!',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, testMessage]);
    } catch (error) {
      console.error('Test failed:', error);
      setError('Test failed. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="student-chat-screen">
      {/* Header */}
      <div className="chat-header">
        <div className="header-content">
          <div className="header-icon">
            <MessageCircle size={24} />
          </div>
          <div className="header-text">
            <h1>AI Assistant</h1>
            <p>Get help with your document requests and academic needs</p>
          </div>
        </div>
        <div className="header-actions">
          <button 
            onClick={handleTestChat}
            className="action-btn secondary"
            disabled={isLoading}
          >
            <Bug size={16} />
            Test Chat
          </button>
          <button 
            onClick={clearChat}
            className="action-btn secondary"
            disabled={messages.length === 0}
          >
            <Trash2 size={16} />
            Clear Chat
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="chat-container">
        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <Bot size={48} />
              </div>
              <h3>Welcome to AI Assistant!</h3>
              <p>I'm here to help you with:</p>
              <ul className="help-list">
                <li>Document request guidance</li>
                <li>Academic process questions</li>
                <li>Appointment scheduling help</li>
                <li>General registrar inquiries</li>
              </ul>
              <p>Start a conversation by typing your question below.</p>
            </div>
          ) : (
            <div className="messages-list">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
                >
                  <div className="message-avatar">
                    {message.role === 'user' ? (
                      <User size={16} />
                    ) : (
                      <Bot size={16} />
                    )}
                  </div>
                  <div className="message-content">
                    <div className="message-text">
                      {message.content}
                    </div>
                    <div className="message-time">
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="message assistant-message">
                  <div className="message-avatar">
                    <Bot size={16} />
                  </div>
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="chat-input-container">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          <div className="input-wrapper">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your document requests or academic needs..."
              className="chat-input"
              rows={1}
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="send-button"
            >
              {isLoading ? (
                <RefreshCw size={20} className="spinning" />
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
