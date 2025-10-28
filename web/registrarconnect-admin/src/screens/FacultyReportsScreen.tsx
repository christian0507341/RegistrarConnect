import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, Calendar, TrendingUp, RefreshCw } from 'lucide-react';
import { apiService } from '../services/api';

interface Stats {
  total_appointments: number;
  completed: number;
  cancelled: number;
  students: number;
}

export default function FacultyReportsScreen() {
  const navigate = useNavigate();
  const [reportType, setReportType] = useState("appointments");
  const [dateRange, setDateRange] = useState("thisMonth");
  const [stats, setStats] = useState<Stats>({
    total_appointments: 0,
    completed: 0,
    cancelled: 0,
    students: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, [dateRange]);
  
  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await apiService.faculty.getReports({ date_range: dateRange });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="faculty-reports-screen">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="faculty-reports-screen">
      <div className="screen-header">
        <h1>Reports & Analytics</h1>
        <p>Generate and view your activity reports</p>
        <button onClick={fetchReports} className="action-btn secondary">
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="stats-summary">
        <div className="stat-box blue">
          <Calendar size={24} />
          <div>
            <p className="stat-value">{stats.total_appointments}</p>
            <p className="stat-label">Total Appointments</p>
          </div>
        </div>
        <div className="stat-box green">
          <TrendingUp size={24} />
          <div>
            <p className="stat-value">{stats.completed}</p>
            <p className="stat-label">Completed</p>
          </div>
        </div>
        <div className="stat-box orange">
          <FileText size={24} />
          <div>
            <p className="stat-value">{stats.cancelled}</p>
            <p className="stat-label">Cancelled</p>
          </div>
        </div>
        <div className="stat-box purple">
          <TrendingUp size={24} />
          <div>
            <p className="stat-value">{stats.students}</p>
            <p className="stat-label">Students</p>
          </div>
        </div>
      </div>

      <div className="report-generator">
        <h2>Generate Report</h2>
        <div className="form-group">
          <label>Report Type</label>
          <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
            <option value="appointments">Appointments Report</option>
            <option value="students">Students Report</option>
            <option value="activity">Activity Report</option>
          </select>
        </div>
        <div className="form-group">
          <label>Date Range</label>
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="thisWeek">This Week</option>
            <option value="thisMonth">This Month</option>
            <option value="thisYear">This Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
        <button className="action-btn primary">
          <Download size={16} />
          Generate Report
        </button>
      </div>
    </div>
  );
}

