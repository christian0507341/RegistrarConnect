import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Calendar, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { apiService } from '../services/api';

export default function RegistrarDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    pendingRequests: 0,
    todayClaimings: 0,
    processedToday: 0,
    scheduledAppointments: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      fetchDashboardStats();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardStats = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.registrar.getDashboardStats();
      setStats({
        pendingRequests: response.data.pending_review || 0,
        todayClaimings: response.data.claimed_today || 0,
        processedToday: response.data.processing || 0,
        scheduledAppointments: response.data.today_appointments || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="registrar-dashboard">
      <div className="dashboard-welcome">
        <h1>Welcome, {localStorage.getItem("name") || "Registrar"}!</h1>
        <p>Manage document requests and claiming schedules</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card orange">
          <div className="stat-icon"><FileText size={28} /></div>
          <div className="stat-content">
            <h3>Pending Requests</h3>
            <p className="stat-value">{stats.pendingRequests}</p>
          </div>
        </div>
        <div className="stat-card blue">
          <div className="stat-icon"><Calendar size={28} /></div>
          <div className="stat-content">
            <h3>Today's Claimings</h3>
            <p className="stat-value">{stats.todayClaimings}</p>
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon"><CheckCircle size={28} /></div>
          <div className="stat-content">
            <h3>Processed Today</h3>
            <p className="stat-value">{stats.processedToday}</p>
          </div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon"><Clock size={28} /></div>
          <div className="stat-content">
            <h3>Scheduled</h3>
            <p className="stat-value">{stats.scheduledAppointments}</p>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <button onClick={() => navigate('/registrar/requests')} className="action-card">
            <FileText size={32} />
            <h3>View Requests</h3>
          </button>
          <button onClick={() => navigate('/registrar/approve')} className="action-card">
            <CheckCircle size={32} />
            <h3>Approve Documents</h3>
          </button>
          <button onClick={() => navigate('/registrar/appointments')} className="action-card">
            <Calendar size={32} />
            <h3>View Appointments</h3>
          </button>
        </div>
      </div>
    </div>
  );
}

