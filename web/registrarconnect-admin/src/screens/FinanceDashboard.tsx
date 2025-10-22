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

  // Document pricing to calculate revenue
  const getDocumentPrice = (documentType: string): number => {
    const pricing: Record<string, number> = {
      'OTR': 150, // Official Transcript of Records
      'COG': 100, // Certificate of Grades
      'COE': 50,  // Certificate of Enrollment
      'OTHERS': 75 // Other Certifications
    };
    return pricing[documentType] || 0;
  };

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
      const statsResponse = await apiService.finance.getDashboardStats();
      
      // Fetch reports to calculate actual revenue
      const reportsResponse = await apiService.finance.getReports({});
      
      // Calculate actual revenue from document types
      const docTypeData = reportsResponse.data.by_document_type || [];
      const actualRevenue = docTypeData.reduce((sum: number, item: any) => 
        sum + (item.count * getDocumentPrice(item.document_type)), 0);
      
      setStats({
        pendingPayments: statsResponse.data.pending_verifications || 0, // Fixed: was pending_verification (singular)
        verifiedToday: statsResponse.data.approved_today || 0,
        totalRevenue: actualRevenue, // Fixed: now calculates actual revenue, not just count
        rejectedPayments: statsResponse.data.rejected_payments || 0 // Fixed: was total_payments
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

