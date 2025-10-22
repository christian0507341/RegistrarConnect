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
  Settings
} from 'lucide-react';

interface SystemStats {
  totalUsers: number;
  totalRequests: number;
  totalAppointments: number;
  activeUsers: number;
  pendingRequests: number;
  todayAppointments: number;
}

export default function AdminDedicatedDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 1247,
    totalRequests: 856,
    totalAppointments: 432,
    activeUsers: 89,
    pendingRequests: 34,
    todayAppointments: 12
  });

  useEffect(() => {
    // Authentication is handled by the protected route in App.tsx
    // TODO: Fetch real data from backend
  }, []);

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

  return (
    <div className="admin-dedicated-dashboard">
      {/* Welcome Section */}
      <div className="dashboard-welcome">
        <div className="welcome-content">
          <h1>Welcome back, {localStorage.getItem("name") || "Administrator"}!</h1>
          <p>Here's your system overview and recent activities.</p>
        </div>
        <div className="system-status">
          <Activity size={20} />
          <span>All Systems Operational</span>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card purple">
          <div className="stat-header">
            <div className="stat-icon">
              <Users size={28} />
            </div>
            <div className="stat-trend up">
              <ArrowUp size={16} />
              <span>12%</span>
            </div>
          </div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <p className="stat-value">{stats.totalUsers}</p>
            <span className="stat-label">{stats.activeUsers} active now</span>
          </div>
        </div>

        <div className="stat-card blue">
          <div className="stat-header">
            <div className="stat-icon">
              <FileText size={28} />
            </div>
            <div className="stat-trend up">
              <ArrowUp size={16} />
              <span>8%</span>
            </div>
          </div>
          <div className="stat-content">
            <h3>Document Requests</h3>
            <p className="stat-value">{stats.totalRequests}</p>
            <span className="stat-label">{stats.pendingRequests} pending</span>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-header">
            <div className="stat-icon">
              <Calendar size={28} />
            </div>
            <div className="stat-trend up">
              <ArrowUp size={16} />
              <span>15%</span>
            </div>
          </div>
          <div className="stat-content">
            <h3>Appointments</h3>
            <p className="stat-value">{stats.totalAppointments}</p>
            <span className="stat-label">{stats.todayAppointments} today</span>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-header">
            <div className="stat-icon">
              <TrendingUp size={28} />
            </div>
            <div className="stat-trend down">
              <ArrowDown size={16} />
              <span>3%</span>
            </div>
          </div>
          <div className="stat-content">
            <h3>System Load</h3>
            <p className="stat-value">67%</p>
            <span className="stat-label">Average this week</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="dashboard-grid">
        {/* Recent Activities */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Recent Activities</h2>
            <button onClick={() => navigate('/admin/logs')} className="view-all-btn">
              View All
            </button>
          </div>
          <div className="activities-list">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className={`activity-icon ${activity.type}`}>
                  {activity.type === 'user' && <Users size={16} />}
                  {activity.type === 'request' && <FileText size={16} />}
                  {activity.type === 'appointment' && <Calendar size={16} />}
                  {activity.type === 'system' && <Activity size={16} />}
                </div>
                <div className="activity-content">
                  <p>{activity.action}</p>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>System Health</h2>
            <button onClick={() => navigate('/admin/settings')} className="view-all-btn">
              Settings
            </button>
          </div>
          <div className="health-list">
            {systemHealth.map((system, index) => (
              <div key={index} className="health-item">
                <div className="health-info">
                  <Database size={20} />
                  <div>
                    <h4>{system.name}</h4>
                    <p>Uptime: {system.uptime}</p>
                  </div>
                </div>
                <div className={`health-status ${system.color}`}>
                  {system.color === 'green' && <CheckCircle size={20} />}
                  {system.color === 'orange' && <AlertCircle size={20} />}
                  {system.color === 'red' && <XCircle size={20} />}
                  <span>{system.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <button onClick={() => navigate('/admin/users')} className="action-card">
            <Users size={32} />
            <h3>Manage Users</h3>
            <p>Add, edit, or remove users</p>
          </button>
          <button onClick={() => navigate('/admin/requests')} className="action-card">
            <FileText size={32} />
            <h3>Process Requests</h3>
            <p>Handle pending requests</p>
          </button>
          <button onClick={() => navigate('/admin/reports')} className="action-card">
            <TrendingUp size={32} />
            <h3>View Reports</h3>
            <p>System analytics & insights</p>
          </button>
          <button onClick={() => navigate('/admin/settings')} className="action-card">
            <Settings size={32} />
            <h3>System Settings</h3>
            <p>Configure system parameters</p>
          </button>
        </div>
      </div>
    </div>
  );
}

