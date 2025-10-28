import { useState, useEffect } from 'react';
import { Bell, CheckCircle, Trash2, Search, Filter } from 'lucide-react';
import { apiService } from '../services/api';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  timestamp: string;
  isRead: boolean;
}

export default function RegistrarNotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [searchTerm, typeFilter, notifications]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      // Fetch notifications from backend (student_notifications endpoint for now)
      // TODO: Create dedicated registrar notifications endpoint
      const response = await apiService.getNotifications();
      
      const fetchedNotifications = (response.data.notifications || []).map((notif: any) => ({
        id: notif.id?.toString() || Math.random().toString(),
        title: notif.title || 'Notification',
        message: notif.message || '',
        type: notif.type || 'general',
        timestamp: notif.timestamp || new Date().toISOString(),
        isRead: notif.is_read || false
      }));
      
      setNotifications(fetchedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Fallback to empty notifications on error
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterNotifications = () => {
    let filtered = notifications;

    if (searchTerm) {
      filtered = filtered.filter(notif =>
        notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notif.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(notif => notif.type === typeFilter);
    }

    setFilteredNotifications(filtered);
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await apiService.markNotificationAsRead(id);
      setNotifications(prev =>
        prev.map(notif => notif.id === id ? { ...notif, isRead: true } : notif)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // Mark all notifications as read
      await Promise.all(
        notifications.filter(n => !n.isRead).map(n => apiService.markNotificationAsRead(n.id))
      );
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiService.deleteNotification(id);
      setNotifications(prev => prev.filter(notif => notif.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('Are you sure you want to delete all notifications?')) return;
    
    try {
      await Promise.all(
        notifications.map(n => apiService.deleteNotification(n.id))
      );
      setNotifications([]);
    } catch (error) {
      console.error('Error deleting all notifications:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'request': return '📄';
      case 'payment': return '💰';
      case 'appointment': return '📅';
      default: return '🔔';
    }
  };

  return (
    <div className="registrar-notifications-screen">
      <div className="notifications-header">
        <div className="header-content">
          <h1>Notifications</h1>
          <p>Stay updated on requests, payments, and appointments</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={handleMarkAllAsRead}>
            <CheckCircle size={18} />
            Mark All Read
          </button>
          <button className="btn-danger" onClick={handleDeleteAll}>
            <Trash2 size={18} />
            Delete All
          </button>
        </div>
      </div>

      <div className="notifications-stats">
        <div className="stat-card">
          <span className="stat-label">Unread</span>
          <span className="stat-value">{notifications.filter(n => !n.isRead).length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total</span>
          <span className="stat-value">{notifications.length}</span>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-controls">
          <Filter size={16} />
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">All Types</option>
            <option value="request">Requests</option>
            <option value="payment">Payments</option>
            <option value="appointment">Appointments</option>
          </select>
        </div>
      </div>

      <div className="notifications-content">
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <Bell size={64} />
            <h3>No notifications</h3>
            <p>You're all caught up!</p>
          </div>
        ) : (
          <div className="notifications-list">
            {filteredNotifications.map((notification) => (
              <div key={notification.id} className={`notification-card ${notification.isRead ? 'read' : 'unread'}`}>
                <div className="notification-icon">{getNotificationIcon(notification.type)}</div>
                <div className="notification-content">
                  <h3>{notification.title}</h3>
                  <p>{notification.message}</p>
                  <span className="timestamp">{new Date(notification.timestamp).toLocaleString()}</span>
                </div>
                <div className="notification-actions">
                  {!notification.isRead && (
                    <button
                      className="btn-icon-small"
                      onClick={() => handleMarkAsRead(notification.id)}
                      title="Mark as read"
                    >
                      <CheckCircle size={16} />
                    </button>
                  )}
                  <button
                    className="btn-icon-small"
                    onClick={() => handleDelete(notification.id)}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

