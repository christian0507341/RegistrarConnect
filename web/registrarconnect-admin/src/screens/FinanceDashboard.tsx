import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, CheckCircle, XCircle, TrendingUp, FileText } from 'lucide-react';
import { apiService } from '../services/api';

export default function FinanceDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    pendingPayments: 0,
    verifiedToday: 0,
    totalRevenue: 0,
    rejectedPayments: 0
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
      const response = await apiService.finance.getDashboardStats();
      setStats({
        pendingPayments: response.data.pending_verification || 0,
        verifiedToday: response.data.approved_today || 0,
        totalRevenue: response.data.total_revenue || 0,
        rejectedPayments: response.data.total_payments || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="finance-dashboard">
      <div className="dashboard-welcome">
        <h1>Welcome, {localStorage.getItem("name") || "Finance"}!</h1>
        <p>Manage payments and verifications</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card teal">
          <div className="stat-icon"><DollarSign size={28} /></div>
          <div className="stat-content">
            <h3>Pending Payments</h3>
            <p className="stat-value">{stats.pendingPayments}</p>
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon"><CheckCircle size={28} /></div>
          <div className="stat-content">
            <h3>Verified Today</h3>
            <p className="stat-value">{stats.verifiedToday}</p>
          </div>
        </div>
        <div className="stat-card blue">
          <div className="stat-icon"><TrendingUp size={28} /></div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <p className="stat-value">₱{stats.totalRevenue.toLocaleString()}</p>
          </div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon"><XCircle size={28} /></div>
          <div className="stat-content">
            <h3>Rejected</h3>
            <p className="stat-value">{stats.rejectedPayments}</p>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <button onClick={() => navigate('/finance/payments')} className="action-card">
            <DollarSign size={32} />
            <h3>View Payments</h3>
          </button>
          <button onClick={() => navigate('/finance/verification')} className="action-card">
            <CheckCircle size={32} />
            <h3>Verify Payments</h3>
          </button>
          <button onClick={() => navigate('/finance/reports')} className="action-card">
            <FileText size={32} />
            <h3>Generate Reports</h3>
          </button>
        </div>
      </div>
    </div>
  );
}

