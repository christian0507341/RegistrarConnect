import { useState, useEffect } from 'react';
import { BarChart, Download, Calendar, DollarSign, TrendingUp, FileText } from 'lucide-react';
import { apiService } from '../services/api';

export default function FinanceReportsScreen() {
  const [dateRange, setDateRange] = useState('month');
  const [reportType, setReportType] = useState('revenue');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    paymentsProcessed: 0,
    averagePayment: 0,
    pendingPayments: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReports();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      fetchReports();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [dateRange, reportType]);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.finance.getReports({
        date_range: dateRange,
        report_type: reportType
      });
      
      setStats({
        totalRevenue: response.data.total_revenue || 0,
        paymentsProcessed: response.data.total_approved_payments || 0,
        averagePayment: response.data.total_approved_payments ? 
          (response.data.total_revenue / response.data.total_approved_payments) : 0,
        pendingPayments: response.data.pending_payments || 0
      });
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (format: string) => {
    try {
      const response = await apiService.finance.exportPayments(format.toLowerCase() as 'csv' | 'excel');
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `finance-report.${format.toLowerCase()}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      alert(`Report exported as ${format}`);
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Failed to export report');
    }
  };

  return (
    <div className="finance-reports-screen">
      <div className="reports-header">
        <div className="header-content">
          <h1>Financial Reports</h1>
          <p>View payment analytics and generate reports</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => handleExport('CSV')}>
            <Download size={18} />
            Export CSV
          </button>
          <button className="btn-primary" onClick={() => handleExport('PDF')}>
            <Download size={18} />
            Export PDF
          </button>
        </div>
      </div>

      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon revenue">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Revenue</span>
            <span className="stat-value">₱{stats.totalRevenue.toLocaleString()}</span>
            <span className="stat-change positive">
              <TrendingUp size={14} />
              +12.5%
            </span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon processed">
            <FileText size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Payments Processed</span>
            <span className="stat-value">{stats.paymentsProcessed}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon average">
            <BarChart size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Average Payment</span>
            <span className="stat-value">₱{stats.averagePayment.toLocaleString()}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Pending</span>
            <span className="stat-value">{stats.pendingPayments}</span>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>Report Type</label>
          <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
            <option value="revenue">Revenue Report</option>
            <option value="payments">Payment Transactions</option>
            <option value="documents">Document Type Analysis</option>
            <option value="methods">Payment Methods</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Date Range</label>
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
      </div>

      <div className="reports-content">
        <div className="report-card">
          <div className="report-header">
            <h2>Payment Breakdown by Document Type</h2>
          </div>
          <div className="report-body">
            <div className="breakdown-list">
              <div className="breakdown-item">
                <span className="item-label">Certificate of Grades</span>
                <div className="item-bar">
                  <div className="bar-fill" style={{ width: '60%' }}></div>
                </div>
                <span className="item-value">₱18,000</span>
              </div>
              <div className="breakdown-item">
                <span className="item-label">Transcript of Records</span>
                <div className="item-bar">
                  <div className="bar-fill" style={{ width: '30%' }}></div>
                </div>
                <span className="item-value">₱13,500</span>
              </div>
              <div className="breakdown-item">
                <span className="item-label">Certificate of Enrollment</span>
                <div className="item-bar">
                  <div className="bar-fill" style={{ width: '10%' }}></div>
                </div>
                <span className="item-value">₱8,000</span>
              </div>
              <div className="breakdown-item">
                <span className="item-label">Diploma</span>
                <div className="item-bar">
                  <div className="bar-fill" style={{ width: '15%' }}></div>
                </div>
                <span className="item-value">₱5,500</span>
              </div>
            </div>
          </div>
        </div>

        <div className="report-card">
          <div className="report-header">
            <h2>Payment Methods Distribution</h2>
          </div>
          <div className="report-body">
            <div className="breakdown-list">
              <div className="breakdown-item">
                <span className="item-label">GCash</span>
                <div className="item-bar">
                  <div className="bar-fill" style={{ width: '45%' }}></div>
                </div>
                <span className="item-value">45%</span>
              </div>
              <div className="breakdown-item">
                <span className="item-label">Bank Transfer</span>
                <div className="item-bar">
                  <div className="bar-fill" style={{ width: '30%' }}></div>
                </div>
                <span className="item-value">30%</span>
              </div>
              <div className="breakdown-item">
                <span className="item-label">PayMaya</span>
                <div className="item-bar">
                  <div className="bar-fill" style={{ width: '25%' }}></div>
                </div>
                <span className="item-value">25%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

