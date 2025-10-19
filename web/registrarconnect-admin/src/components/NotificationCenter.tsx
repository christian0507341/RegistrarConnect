import { useState, useEffect } from 'react';
import { Bell, X, Check, CheckCheck, Trash2, AlertCircle, CheckCircle, AlertTriangle, Info, Sparkles, Clock, Star } from 'lucide-react';
import { notificationService, type Notification } from '../services/notificationService';
import '../styles/components/NotificationCenter.css';

interface NotificationCenterProps {
  className?: string;
}

export default function NotificationCenter({ className = '' }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [personalizedGreeting, setPersonalizedGreeting] = useState('');

  useEffect(() => {
    // Subscribe to notification changes
    const unsubscribe = notificationService.subscribe((newNotifications) => {
      setNotifications(newNotifications);
      setUnreadCount(notificationService.getUnreadCount());
    });

    // Initial load
    setNotifications(notificationService.getAll());
    setUnreadCount(notificationService.getUnreadCount());

    // Set personalized greeting
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    setPersonalizedGreeting(greeting);

    return unsubscribe;
  }, []);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="notification-icon success" />;
      case 'error':
        return <AlertCircle className="notification-icon error" />;
      case 'warning':
        return <AlertTriangle className="notification-icon warning" />;
      case 'info':
        return <Info className="notification-icon info" />;
      default:
        return <Bell className="notification-icon" />;
    }
  };

  const getPersonalizedMessage = (notification: Notification) => {
    const timeAgo = formatTimestamp(notification.timestamp);
    const priority = notification.type === 'error' ? 'high' : notification.type === 'warning' ? 'medium' : 'low';
    
    return {
      ...notification,
      personalizedMessage: `${notification.message} • ${timeAgo}`,
      priority,
      isPersonalized: true
    };
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const markAsRead = (id: string) => {
    notificationService.markAsRead(id);
  };

  const markAllAsRead = () => {
    notificationService.markAllAsRead();
  };

  const clearAll = () => {
    notificationService.clearAll();
  };

  const removeNotification = (id: string) => {
    notificationService.remove(id);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      default:
        return 'priority-low';
    }
  };

  return (
    <div className={`notification-center ${className}`}>
      <button
        className="notification-bell interactive"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        <div className="bell-ripple"></div>
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <div className="header-content">
              <div className="greeting-section">
                <h3 className="greeting-title">
                  <Sparkles size={16} />
                  {personalizedGreeting}, Admin!
                </h3>
                <p className="greeting-subtitle">Your personalized notifications</p>
              </div>
              <div className="header-actions">
                <button
                  className="action-btn clear-all"
                  onClick={clearAll}
                  title="Clear all notifications"
                >
                  <Trash2 size={14} />
                </button>
                <button
                  className="action-btn mark-all"
                  onClick={markAllAsRead}
                  title="Mark all as read"
                >
                  <CheckCheck size={14} />
                </button>
                <button
                  className="action-btn close"
                  onClick={() => setIsOpen(false)}
                  title="Close notifications"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          </div>

          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <Bell size={32} />
                </div>
                <h4>No notifications yet</h4>
                <p>You'll see personalized updates here</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const personalized = getPersonalizedMessage(notification);
                return (
                  <div
                    key={notification.id}
                    className={`notification-item ${!notification.read ? 'unread' : ''} ${getPriorityColor(personalized.priority)}`}
                  >
                    <div className="notification-content">
                      <div className="notification-header">
                        <div className="notification-icon-wrapper">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="notification-meta">
                          <div className="notification-title">
                            {notification.title}
                            {personalized.isPersonalized && (
                              <Star size={12} className="personalized-indicator" />
                            )}
                          </div>
                          <div className="notification-time">
                            <Clock size={12} />
                            {formatTimestamp(notification.timestamp)}
                          </div>
                        </div>
                        <div className="notification-actions">
                          {!notification.read && (
                            <button
                              className="mark-read-btn"
                              onClick={() => markAsRead(notification.id)}
                              title="Mark as read"
                            >
                              <Check size={12} />
                            </button>
                          )}
                          <button
                            className="remove-btn"
                            onClick={() => removeNotification(notification.id)}
                            title="Remove notification"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                      <div className="notification-message">
                        {personalized.personalizedMessage}
                      </div>
                      {personalized.priority === 'high' && (
                        <div className="priority-indicator">
                          <span className="priority-text">High Priority</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {notifications.length > 0 && (
            <div className="dropdown-footer">
              <div className="footer-stats">
                <span className="stats-text">
                  {unreadCount} unread • {notifications.length} total
                </span>
              </div>
              <div className="footer-actions">
                <button className="footer-btn">
                  View All
                </button>
                <button className="footer-btn primary">
                  Settings
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}