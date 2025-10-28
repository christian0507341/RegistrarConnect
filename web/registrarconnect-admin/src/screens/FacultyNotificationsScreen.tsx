import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Trash2, CheckCheck, RefreshCw, AlertCircle } from 'lucide-react';
import { apiService } from '../services/api';

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

export default function FacultyNotificationsScreen() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await apiService.faculty.getNotifications();
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diff = now.getTime() - then.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  if (loading) {
    return (
      <div className="faculty-notifications-screen">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="faculty-notifications-screen">
      <div className="screen-header">
        <div className="header-content">
          <h1>Notifications</h1>
          <p>{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        <div className="header-actions">
          <button onClick={markAllAsRead} className="action-btn secondary" disabled={unreadCount === 0}>
            <CheckCheck size={16} />
            Mark All Read
          </button>
          <button onClick={fetchNotifications} className="action-btn primary">
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="empty-state">
            <Bell size={48} />
            <h3>No notifications</h3>
            <p>You're all caught up!</p>
          </div>
        ) : (
          notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`notification-card ${notification.isRead ? 'read' : 'unread'} ${notification.type}`}
            >
              <div className="notification-icon">
                {notification.type === 'info' && <Bell size={20} />}
                {notification.type === 'success' && <Check size={20} />}
                {notification.type === 'warning' && <AlertCircle size={20} />}
                {notification.type === 'error' && <AlertCircle size={20} />}
              </div>
              <div className="notification-content">
                <h4>{notification.title}</h4>
                <p>{notification.message}</p>
                <span className="notification-time">{formatTime(notification.timestamp)}</span>
              </div>
              <div className="notification-actions">
                {!notification.isRead && (
                  <button 
                    onClick={() => markAsRead(notification.id)}
                    className="icon-btn"
                    title="Mark as read"
                  >
                    <Check size={16} />
                  </button>
                )}
                <button 
                  onClick={() => deleteNotification(notification.id)}
                  className="icon-btn danger"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

