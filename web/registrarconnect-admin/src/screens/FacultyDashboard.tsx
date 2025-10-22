import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  FileText,
  Bell
} from 'lucide-react';
import { apiService } from '../services/api';

interface Stats {
  todayAppointments: number;
  upcomingAppointments: number;
  completedToday: number;
  totalStudents: number;
}

export default function FacultyDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    todayAppointments: 0,
    upcomingAppointments: 0,
    completedToday: 0,
    totalStudents: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiService.faculty.getDashboardStats();
      setStats({
        todayAppointments: response.data.today_appointments || 0,
        upcomingAppointments: response.data.upcoming_appointments || 0,
        completedToday: response.data.completed_today || 0,
        totalStudents: response.data.total_students || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const todayAppointments = [
    { id: 1, student: "John Doe", time: "09:00 AM", purpose: "Transcript Request", status: "pending" },
    { id: 2, student: "Jane Smith", time: "10:30 AM", purpose: "Grade Inquiry", status: "completed" },
    { id: 3, student: "Mike Johnson", time: "02:00 PM", purpose: "Document Verification", status: "upcoming" },
  ];

  const recentActivities = [
    { id: 1, action: "Completed appointment with John Doe", time: "10 mins ago" },
    { id: 2, action: "New appointment request from Jane Smith", time: "1 hour ago" },
    { id: 3, action: "Verified documents for Mike Johnson", time: "2 hours ago" },
  ];

  return (
    <div className="faculty-dashboard">
      {/* Welcome Section */}
      <div className="dashboard-welcome">
        <div className="welcome-content">
          <h1>Welcome back, {localStorage.getItem("name") || "Faculty"}!</h1>
          <p>Here's what's happening with your appointments today.</p>
        </div>
        <div className="welcome-date">
          <Calendar size={20} />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon">
            <Calendar size={28} />
          </div>
          <div className="stat-content">
            <h3>Today's Appointments</h3>
            <p className="stat-value">{stats.todayAppointments}</p>
            <span className="stat-label">Scheduled for today</span>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">
            <Clock size={28} />
          </div>
          <div className="stat-content">
            <h3>Upcoming</h3>
            <p className="stat-value">{stats.upcomingAppointments}</p>
            <span className="stat-label">This week</span>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon">
            <CheckCircle size={28} />
          </div>
          <div className="stat-content">
            <h3>Completed Today</h3>
            <p className="stat-value">{stats.completedToday}</p>
            <span className="stat-label">Appointments done</span>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon">
            <Users size={28} />
          </div>
          <div className="stat-content">
            <h3>Total Students</h3>
            <p className="stat-value">{stats.totalStudents}</p>
            <span className="stat-label">Under your guidance</span>
          </div>
        </div>
      </div>

      {/* Today's Appointments */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Today's Appointments</h2>
          <button onClick={() => navigate('/faculty/appointments')} className="view-all-btn">
            View All
          </button>
        </div>

        <div className="appointments-list">
          {todayAppointments.map((appointment) => (
            <div key={appointment.id} className="appointment-item">
              <div className="appointment-time">
                <Clock size={20} />
                <span>{appointment.time}</span>
              </div>
              <div className="appointment-info">
                <h4>{appointment.student}</h4>
                <p>{appointment.purpose}</p>
              </div>
              <div className={`appointment-status ${appointment.status}`}>
                {appointment.status === 'completed' && <CheckCircle size={16} />}
                {appointment.status === 'pending' && <AlertCircle size={16} />}
                {appointment.status === 'upcoming' && <Clock size={16} />}
                <span>{appointment.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Recent Activities</h2>
        </div>

        <div className="activities-list">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div className="activity-icon">
                <CheckCircle size={16} />
              </div>
              <div className="activity-content">
                <p>{activity.action}</p>
                <span className="activity-time">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <button onClick={() => navigate('/faculty/appointments')} className="action-card">
            <Calendar size={32} />
            <h3>Manage Appointments</h3>
            <p>View and manage your schedule</p>
          </button>
          <button onClick={() => navigate('/faculty/students')} className="action-card">
            <Users size={32} />
            <h3>View Students</h3>
            <p>Access student information</p>
          </button>
          <button onClick={() => navigate('/faculty/reports')} className="action-card">
            <FileText size={32} />
            <h3>Generate Reports</h3>
            <p>Create activity reports</p>
          </button>
        </div>
      </div>
    </div>
  );
}

