import { useState, useEffect } from "react";
import Card from "../components/Card";
import { Bell, Check, Trash2, CheckCheck, RefreshCw } from "lucide-react";
import { apiService } from "../services/api";

interface Notification {
  id: string;
  text: string;
  unread: boolean;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', text: "Payment receipt REQ-1043 verified", unread: true, timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), type: 'success' },
    { id: '2', text: "New appointment booked: Hans Lee Langit", unread: false, timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), type: 'info' },
  ]);
  const [loading, setLoading] = useState(false);

  // Format timestamp to relative time
  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return then.toLocaleDateString();
  };

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await apiService.getNotifications();
      // Map backend notifications to our format
      const mappedNotifications = (response.data || []).map((notif: any) => ({
        id: notif.id,
        text: notif.message || notif.text,
        unread: !notif.read,
        timestamp: notif.created_at || notif.timestamp,
        type: notif.type || 'info'
      }));
      setNotifications(mappedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Keep using mock data on error
    } finally {
      setLoading(false);
    }
  };

  // Load notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Mark notification as read
  const markAsRead = async (id: string) => {
    try {
      await apiService.markNotificationAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, unread: false } : n))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Fallback to local update
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, unread: false } : n))
      );
    }
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    // TODO: Call backend API to mark all as read
  };

  // Delete notification
  const deleteNotification = async (id: string) => {
    try {
      await apiService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
      // Fallback to local delete
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

  // Delete all notifications
  const deleteAll = () => {
    if (window.confirm('Are you sure you want to delete all notifications?')) {
      setNotifications([]);
      // TODO: Call backend API to delete all
    }
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="notifications-screen">
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Bell size={20} />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="badge badge-primary">{unreadCount} new</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={fetchNotifications}
                className="action-btn secondary"
                disabled={loading}
                title="Refresh"
              >
                <RefreshCw size={16} className={loading ? 'spinning' : ''} />
              </button>
              <button 
                onClick={markAllAsRead}
                className="action-btn secondary"
                disabled={unreadCount === 0}
                title="Mark all as read"
              >
                <CheckCheck size={16} />
              </button>
              <button 
                onClick={deleteAll}
                className="action-btn danger"
                disabled={notifications.length === 0}
                title="Delete all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        }
      >
        {notifications.length === 0 ? (
          <div className="empty-state">
            <Bell size={48} style={{ color: '#9ca3af', marginBottom: '12px' }} />
            <p>No notifications</p>
          </div>
        ) : (
          <ul className="notify-list">
            {notifications.map((n) => (
              <li 
                key={n.id} 
                className={n.unread ? "notify-item unread" : "notify-item"}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <div style={{ flex: 1 }}>
                  <div className="notify-text">{n.text}</div>
                  <div className="small-muted">{formatTimestamp(n.timestamp)}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginLeft: '12px' }}>
                  {n.unread && (
                    <button 
                      onClick={() => markAsRead(n.id)}
                      className="icon-btn"
                      title="Mark as read"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button 
                    onClick={() => deleteNotification(n.id)}
                    className="icon-btn danger"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
