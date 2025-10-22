import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  FileText,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  ArrowUp,
  ArrowDown,
  Activity,
  Database,
  Settings,
  RefreshCw
} from 'lucide-react';
import { apiService } from '../services/api';

interface SystemStats {
  totalUsers: number;
  totalRequests: number;
  totalAppointments: number;
  activeUsers: number;
  pendingRequests: number;
  todayAppointments: number;
  newUsersThisWeek?: number;
}

export default function AdminDedicatedDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalRequests: 0,
    totalAppointments: 0,
    activeUsers: 0,
    pendingRequests: 0,
    todayAppointments: 0,
    newUsersThisWeek: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await apiService.admin.getDashboardStats();
      const data = response.data;
      
      setStats({
        totalUsers: data.users.total,
        totalRequests: data.requests.total,
        totalAppointments: data.appointments.total,
        activeUsers: data.users.active,
        pendingRequests: data.requests.pending,
        todayAppointments: data.appointments.today,
        newUsersThisWeek: data.users.new_this_week
      });
      setLastUpdated(new Date());
      setError(null);
    } catch (err: any) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardStats();
    setRefreshing(false);
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Never';
    const now = new Date();
    const diff = now.getTime() - lastUpdated.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return lastUpdated.toLocaleDateString();
  };

  const recentActivities = [
    { id: 1, action: "New user registered: John Doe", time: "2 mins ago", type: "user" },
    { id: 2, action: "Document request approved: TOR-2024-001", time: "5 mins ago", type: "request" },
    { id: 3, action: "Appointment completed: APT-2024-045", time: "15 mins ago", type: "appointment" },
    { id: 4, action: "System settings updated", time: "1 hour ago", type: "system" },
  ];

  const systemHealth = [
    { name: "Database", status: "healthy", uptime: "99.9%", color: "green" },
    { name: "API Server", status: "healthy", uptime: "99.8%", color: "green" },
    { name: "Storage", status: "warning", uptime: "85%", color: "orange" },
    { name: "Email Service", status: "healthy", uptime: "99.5%", color: "green" },
  ];

  if (loading) {
    return (
      <div className="admin-dedicated-dashboard">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dedicated-dashboard">
        <div className="error-state">
          <AlertCircle size={48} />
          <h2>{error}</h2>
          <button onClick={fetchDashboardStats} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dedicated-dashboard">
      {/* Welcome Section - Enhanced */}
      <div className="dashboard-welcome-modern">
        <div className="welcome-content">
          <h1>Welcome back, {localStorage.getItem("name") || "Administrator"}! 👋</h1>
          <p>Here's your system overview and recent activities.</p>
          {lastUpdated && (
            <span className="last-updated-text">Last updated: {formatLastUpdated()}</span>
          )}
        </div>
        <div className="welcome-actions">
          <div className="system-status-badge">
            <Activity size={18} />
            <span>All Systems Operational</span>
          </div>
          <button 
            onClick={handleRefresh} 
            className="refresh-btn-modern"
            disabled={refreshing}
          >
            <RefreshCw size={18} className={refreshing ? 'spinning' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Main Stats Grid - Modern */}
      <div className="stats-grid-modern">
        <div className="stat-card-dashboard purple">
          <div className="stat-header-dashboard">
            <div className="stat-icon-dashboard">
              <Users size={28} />
            </div>
            <div className="stat-trend-dashboard positive">
              <ArrowUp size={14} />
              <span>12%</span>
            </div>
          </div>
          <div className="stat-content-dashboard">
            <h3>Total Users</h3>
            <p className="stat-value-dashboard">{stats.totalUsers.toLocaleString()}</p>
            <span className="stat-label-dashboard">
              <span className="stat-highlight">{stats.activeUsers}</span> active now
            </span>
          </div>
          <div className="stat-footer-dashboard">
            <div className="stat-progress-bar">
              <div className="stat-progress-fill purple" style={{ width: '75%' }}></div>
            </div>
          </div>
        </div>

        <div className="stat-card-dashboard blue">
          <div className="stat-header-dashboard">
            <div className="stat-icon-dashboard">
              <FileText size={28} />
            </div>
            <div className="stat-trend-dashboard positive">
              <ArrowUp size={14} />
              <span>8%</span>
            </div>
          </div>
          <div className="stat-content-dashboard">
            <h3>Document Requests</h3>
            <p className="stat-value-dashboard">{stats.totalRequests.toLocaleString()}</p>
            <span className="stat-label-dashboard">
              <span className="stat-highlight">{stats.pendingRequests}</span> pending
            </span>
          </div>
          <div className="stat-footer-dashboard">
            <div className="stat-progress-bar">
              <div className="stat-progress-fill blue" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>

        <div className="stat-card-dashboard green">
          <div className="stat-header-dashboard">
            <div className="stat-icon-dashboard">
              <Calendar size={28} />
            </div>
            <div className="stat-trend-dashboard positive">
              <ArrowUp size={14} />
              <span>15%</span>
            </div>
          </div>
          <div className="stat-content-dashboard">
            <h3>Appointments</h3>
            <p className="stat-value-dashboard">{stats.totalAppointments.toLocaleString()}</p>
            <span className="stat-label-dashboard">
              <span className="stat-highlight">{stats.todayAppointments}</span> today
            </span>
          </div>
          <div className="stat-footer-dashboard">
            <div className="stat-progress-bar">
              <div className="stat-progress-fill green" style={{ width: '85%' }}></div>
            </div>
          </div>
        </div>

        <div className="stat-card-dashboard orange">
          <div className="stat-header-dashboard">
            <div className="stat-icon-dashboard">
              <TrendingUp size={28} />
            </div>
            <div className="stat-trend-dashboard negative">
              <ArrowDown size={14} />
              <span>3%</span>
            </div>
          </div>
          <div className="stat-content-dashboard">
            <h3>System Load</h3>
            <p className="stat-value-dashboard">67%</p>
            <span className="stat-label-dashboard">Average this week</span>
          </div>
          <div className="stat-footer-dashboard">
            <div className="stat-progress-bar">
              <div className="stat-progress-fill orange" style={{ width: '67%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout - Modern */}
      <div className="dashboard-grid-modern">
        {/* Recent Activities - Enhanced */}
        <div className="dashboard-card-modern">
          <div className="card-header-modern">
            <div className="card-title-wrapper">
              <Activity size={20} className="card-icon" />
              <div>
                <h2>Recent Activities</h2>
                <span className="card-subtitle">Latest system events</span>
              </div>
            </div>
            <button onClick={() => navigate('/admin/logs')} className="view-all-btn-modern">
              View All →
            </button>
          </div>
          <div className="activities-list-modern">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="activity-item-modern">
                <div className={`activity-icon-modern ${activity.type}`}>
                  {activity.type === 'user' && <Users size={18} />}
                  {activity.type === 'request' && <FileText size={18} />}
                  {activity.type === 'appointment' && <Calendar size={18} />}
                  {activity.type === 'system' && <Activity size={18} />}
                </div>
                <div className="activity-content-modern">
                  <p className="activity-text">{activity.action}</p>
                  <span className="activity-time-modern">
                    <Clock size={12} />
                    {activity.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Health - Enhanced */}
        <div className="dashboard-card-modern">
          <div className="card-header-modern">
            <div className="card-title-wrapper">
              <Database size={20} className="card-icon" />
              <div>
                <h2>System Health</h2>
                <span className="card-subtitle">Service status & uptime</span>
              </div>
            </div>
            <button onClick={() => navigate('/admin/settings')} className="view-all-btn-modern">
              Settings →
            </button>
          </div>
          <div className="health-list-modern">
            {systemHealth.map((system, index) => (
              <div key={index} className="health-item-modern">
                <div className="health-info-modern">
                  <div className={`health-icon-wrapper ${system.color}`}>
                    <Database size={18} />
                  </div>
                  <div className="health-details">
                    <h4>{system.name}</h4>
                    <div className="health-uptime">
                      <div className="uptime-bar">
                        <div 
                          className={`uptime-fill ${system.color}`}
                          style={{ width: system.uptime }}
                        ></div>
                      </div>
                      <span className="uptime-text">{system.uptime} uptime</span>
                    </div>
                  </div>
                </div>
                <div className={`health-status-modern ${system.color}`}>
                  {system.color === 'green' && <CheckCircle size={20} />}
                  {system.color === 'orange' && <AlertCircle size={20} />}
                  {system.color === 'red' && <XCircle size={20} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions - Modern */}
      <div className="quick-actions-modern">
        <div className="quick-actions-header">
          <h2>Quick Actions</h2>
          <p>Common administrative tasks</p>
        </div>
        <div className="actions-grid-modern">
          <button onClick={() => navigate('/admin/users')} className="action-card-modern purple">
            <div className="action-card-icon">
              <Users size={32} />
            </div>
            <div className="action-card-content">
              <h3>Manage Users</h3>
              <p>Add, edit, or remove users from the system</p>
            </div>
            <div className="action-card-arrow">→</div>
          </button>
          <button onClick={() => navigate('/admin/requests')} className="action-card-modern blue">
            <div className="action-card-icon">
              <FileText size={32} />
            </div>
            <div className="action-card-content">
              <h3>Process Requests</h3>
              <p>Handle pending document requests</p>
            </div>
            <div className="action-card-arrow">→</div>
          </button>
          <button onClick={() => navigate('/admin/reports')} className="action-card-modern green">
            <div className="action-card-icon">
              <TrendingUp size={32} />
            </div>
            <div className="action-card-content">
              <h3>View Reports</h3>
              <p>System analytics and insights</p>
            </div>
            <div className="action-card-arrow">→</div>
          </button>
          <button onClick={() => navigate('/admin/settings')} className="action-card-modern orange">
            <div className="action-card-icon">
              <Settings size={32} />
            </div>
            <div className="action-card-content">
              <h3>System Settings</h3>
              <p>Configure system parameters</p>
            </div>
            <div className="action-card-arrow">→</div>
          </button>
        </div>
      </div>
    </div>
  );
}

