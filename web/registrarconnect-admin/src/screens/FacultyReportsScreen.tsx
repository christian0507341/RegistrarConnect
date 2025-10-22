import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, Calendar, TrendingUp } from 'lucide-react';

export default function FacultyReportsScreen() {
  const navigate = useNavigate();
  const [reportType, setReportType] = useState("appointments");
  const [dateRange, setDateRange] = useState("thisMonth");

  useEffect(() => {
    // Authentication is handled by the protected route in App.tsx
    // TODO: Fetch reports data from backend
  }, []);

  const stats = {
    totalAppointments: 45,
    completed: 38,
    cancelled: 7,
    students: 32
  };

  return (
    <div className="faculty-reports-screen">
      <div className="screen-header">
        <h1>Reports & Analytics</h1>
        <p>Generate and view your activity reports</p>
      </div>

      <div className="stats-summary">
        <div className="stat-box blue">
          <Calendar size={24} />
          <div>
            <p className="stat-value">{stats.totalAppointments}</p>
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

