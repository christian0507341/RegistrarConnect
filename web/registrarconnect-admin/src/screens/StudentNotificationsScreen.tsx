import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../services/api";
import {
  Bell,
  CheckCircle2,
  XCircle,
  Info,
  AlertTriangle,
  Filter,
  Search,
  Trash2,
  Mail,
  MailOpen,
  Clock,
  Eye,
  Star,
  RefreshCw
} from "lucide-react";
import "../styles/screens/StudentNotificationsScreen.css";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  priority: "low" | "medium" | "high";
  read: boolean;
  created_at: string;
  category?: string;
  action_url?: string;
}

export default function StudentNotificationsScreen() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterRead, setFilterRead] = useState("all");

  useEffect(() => {
    // Check if user is authenticated and is a student
    const token = localStorage.getItem("accessToken");
    const role = localStorage.getItem("role");
    
    if (!token || role !== 'student') {
      navigate('/login');
      return;
    }
    
    fetchNotifications();
  }, [navigate]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await apiService.getNotifications();
      // The backend returns { notifications: [...], total_count: ... }
      const backendNotifications = response.data?.notifications || [];
      
      // Transform backend notifications to match frontend interface
      const transformedNotifications: Notification[] = backendNotifications.map((notif: any) => ({
        id: notif.id,
        title: notif.title,
        message: notif.message,
        type: notif.type === 'document_request' ? 'info' : 'info',
        priority: notif.status === 'rejected' ? 'high' : notif.status === 'ready_to_claim' ? 'high' : 'medium',
        read: false, // Backend doesn't track read status
        created_at: notif.time || new Date().toISOString(),
        category: notif.document_type,
        action_url: undefined
      }));
      
      setNotifications(transformedNotifications);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await apiService.markNotificationAsRead(id);
      setNotifications(prev => prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      ));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // Mark each unread notification as read
      const unreadNotifications = (notifications || []).filter(n => !n.read);
      for (const notification of unreadNotifications) {
        await apiService.markNotificationAsRead(notification.id);
      }
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await apiService.deleteNotification(id);
      setNotifications(prev => prev.filter(notif => notif.id !== id));
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={20} className="text-green-500" />;
      case 'error':
        return <XCircle size={20} className="text-red-500" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-orange-500" />;
      default:
        return <Info size={20} className="text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'red';
      case 'medium':
        return 'orange';
      case 'low':
        return 'green';
      default:
        return 'gray';
    }
  };

  const filteredNotifications = (notifications || []).filter(notification => {
    const matchesSearch = (notification.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (notification.message || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || notification.type === filterType;
    const matchesPriority = filterPriority === "all" || notification.priority === filterPriority;
    const matchesRead = filterRead === "all" || 
                       (filterRead === "read" && notification.read) ||
                       (filterRead === "unread" && !notification.read);
    
    return matchesSearch && matchesType && matchesPriority && matchesRead;
  });

  const unreadCount = (notifications || []).filter(n => !n.read).length;
  const highPriorityCount = (notifications || []).filter(n => n.priority === 'high' && !n.read).length;

  if (loading) {
    return (
      <div className="notifications-loading">
        <div className="loading-spinner"></div>
        <p>Loading your notifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notifications-error">
        <p>{error}</p>
        <button onClick={fetchNotifications} className="retry-button">Retry</button>
      </div>
    );
  }

  return (
    <div className="student-notifications-screen">
      {/* Professional Header */}
      <div className="notifications-header">
        <div className="header-content">
          <div className="header-info">
            <Bell size={32} className="header-icon" />
            <div className="header-text">
              <h1>Notifications</h1>
              <p>Stay updated with your academic progress and important announcements</p>
            </div>
          </div>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-number">{unreadCount}</span>
              <span className="stat-label">Unread</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{highPriorityCount}</span>
              <span className="stat-label">High Priority</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls-section">
        <div className="search-bar">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-controls">
          <div className="filter-group">
            <Filter size={20} className="filter-icon" />
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="all">All Types</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
          <div className="filter-group">
            <Star size={20} className="filter-icon" />
            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
          <div className="filter-group">
            <Mail size={20} className="filter-icon" />
            <select value={filterRead} onChange={(e) => setFilterRead(e.target.value)}>
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>
        </div>
        <div className="action-controls">
          <button 
            onClick={handleMarkAllAsRead}
            className="action-btn secondary"
            disabled={unreadCount === 0}
          >
            <MailOpen size={16} />
            <span>Mark All Read</span>
          </button>
          <button 
            onClick={fetchNotifications}
            className="action-btn secondary"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="notifications-section">
        {filteredNotifications.length > 0 ? (
          <div className="notifications-list">
            {filteredNotifications.map(notification => (
              <div 
                key={notification.id} 
                className={`notification-card ${!notification.read ? 'unread' : ''} ${notification.priority}`}
              >
                <div className="notification-header">
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-meta">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-time">
                      <Clock size={14} />
                      <span>{new Date(notification.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="notification-actions">
                    <div className={`priority-badge ${getPriorityColor(notification.priority)}`}>
                      {notification.priority}
                    </div>
                    {!notification.read && (
                      <button 
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="action-btn small"
                        title="Mark as read"
                      >
                        <MailOpen size={14} />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="action-btn small danger"
                      title="Delete notification"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                
                <div className="notification-content">
                  <p className="notification-message">{notification.message}</p>
                  
                  {notification.category && (
                    <div className="notification-category">
                      <span className="category-badge">{notification.category}</span>
                    </div>
                  )}
                  
                  {notification.action_url && (
                    <div className="notification-action">
                      <button className="action-link">
                        <Eye size={14} />
                        <span>View Details</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Bell size={64} className="empty-icon" />
            <h3>No Notifications Found</h3>
            <p>
              {searchTerm || filterType !== "all" || filterPriority !== "all" || filterRead !== "all"
                ? "No notifications match your current filters."
                : "You don't have any notifications yet."
              }
            </p>
            <div className="empty-actions">
              {(searchTerm || filterType !== "all" || filterPriority !== "all" || filterRead !== "all") && (
                <button 
                  onClick={() => {
                    setSearchTerm("");
                    setFilterType("all");
                    setFilterPriority("all");
                    setFilterRead("all");
                  }}
                  className="action-btn secondary"
                >
                  <Filter size={16} />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="quick-stats-section">
        <h2>Notification Summary</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <Bell size={24} />
            <div className="stat-content">
              <h3>{notifications.length}</h3>
              <p>Total Notifications</p>
            </div>
          </div>
          <div className="stat-card">
            <Mail size={24} />
            <div className="stat-content">
              <h3>{unreadCount}</h3>
              <p>Unread</p>
            </div>
          </div>
          <div className="stat-card">
            <Star size={24} />
            <div className="stat-content">
              <h3>{highPriorityCount}</h3>
              <p>High Priority</p>
            </div>
          </div>
          <div className="stat-card">
            <CheckCircle2 size={24} />
            <div className="stat-content">
              <h3>{(notifications || []).filter(n => n.read).length}</h3>
              <p>Read</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}