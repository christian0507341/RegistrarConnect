import { useState, useEffect } from 'react';
import { BarChart, Download, Calendar, DollarSign, TrendingUp, FileText } from 'lucide-react';
import { apiService } from '../services/api';

interface DocumentTypeBreakdown {
  document_type: string;
  count: number;
}

interface PaymentMethodBreakdown {
  payment_method: string;
  count: number;
}

export default function FinanceReportsScreen() {
  const [dateRange, setDateRange] = useState('month');
  const [reportType, setReportType] = useState('revenue');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    paymentsProcessed: 0,
    averagePayment: 0,
    pendingPayments: 0
  });
  const [documentTypeData, setDocumentTypeData] = useState<DocumentTypeBreakdown[]>([]);
  const [paymentMethodData, setPaymentMethodData] = useState<PaymentMethodBreakdown[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Document pricing
  const getDocumentPrice = (documentType: string): number => {
    const pricing: Record<string, number> = {
      'OTR': 150, // Official Transcript of Records
      'COG': 100, // Certificate of Grades
      'COE': 50,  // Certificate of Enrollment
      'OTHERS': 75 // Other Certifications
    };
    return pricing[documentType] || 0;
  };

  const getDocumentDisplayName = (code: string): string => {
    const names: Record<string, string> = {
      'OTR': 'Official Transcript of Records',
      'COG': 'Certificate of Grades',
      'COE': 'Certificate of Enrollment',
      'OTHERS': 'Other Certifications'
    };
    return names[code] || code;
  };

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
      // Fetch reports data
      const reportsResponse = await apiService.finance.getReports({
        date_range: dateRange,
        report_type: reportType
      });

      // Fetch dashboard stats for pending count
      const statsResponse = await apiService.finance.getDashboardStats();
      
      // Process document type data
      const docTypeData = reportsResponse.data.by_document_type || [];
      setDocumentTypeData(docTypeData);
      
      // Process payment method data
      const paymentData = reportsResponse.data.by_payment_method || [];
      setPaymentMethodData(paymentData);
      
      // Calculate total revenue and payments processed
      const totalProcessed = docTypeData.reduce((sum: number, item: DocumentTypeBreakdown) => 
        sum + item.count, 0);
      
      const totalRevenue = docTypeData.reduce((sum: number, item: DocumentTypeBreakdown) => 
        sum + (item.count * getDocumentPrice(item.document_type)), 0);
      
      const avgPayment = totalProcessed > 0 ? totalRevenue / totalProcessed : 0;
      
      setStats({
        totalRevenue: totalRevenue,
        paymentsProcessed: totalProcessed,
        averagePayment: avgPayment,
        pendingPayments: statsResponse.data.pending_verifications || 0
      });
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const response = await apiService.finance.exportPayments(format);
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const extension = format === 'excel' ? 'xlsx' : 'csv';
      link.setAttribute('download', `finance-report-${new Date().toISOString().split('T')[0]}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      alert(`Report exported as ${format.toUpperCase()}`);
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
          <button className="btn-secondary" onClick={() => handleExport('csv')}>
            <Download size={18} />
            Export CSV
          </button>
          <button className="btn-primary" onClick={() => handleExport('excel')}>
            <Download size={18} />
            Export Excel
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
            {isLoading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading data...</p>
              </div>
            ) : documentTypeData.length === 0 ? (
              <p className="no-data">No data available</p>
            ) : (
              <div className="breakdown-list">
                {documentTypeData.map((item, index) => {
                  const revenue = item.count * getDocumentPrice(item.document_type);
                  const maxCount = Math.max(...documentTypeData.map(d => d.count));
                  const widthPercent = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                  
                  return (
                    <div key={index} className="breakdown-item">
                      <span className="item-label">
                        {getDocumentDisplayName(item.document_type)}
                        <span className="item-count"> ({item.count} requests)</span>
                      </span>
                      <div className="item-bar">
                        <div className="bar-fill" style={{ width: `${widthPercent}%` }}></div>
                      </div>
                      <span className="item-value">₱{revenue.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="report-card">
          <div className="report-header">
            <h2>Payment Methods Distribution</h2>
          </div>
          <div className="report-body">
            {isLoading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading data...</p>
              </div>
            ) : paymentMethodData.length === 0 ? (
              <p className="no-data">No data available</p>
            ) : (
              <div className="breakdown-list">
                {(() => {
                  const totalCount = paymentMethodData.reduce((sum, item) => sum + item.count, 0);
                  return paymentMethodData.map((item, index) => {
                    const percentage = totalCount > 0 ? (item.count / totalCount) * 100 : 0;
                    const methodName = item.payment_method === 'gcash' ? 'GCash' : 
                                       item.payment_method === 'personal' ? 'Personal (Finance)' : 
                                       item.payment_method || 'Not specified';
                    
                    return (
                      <div key={index} className="breakdown-item">
                        <span className="item-label">
                          {methodName}
                          <span className="item-count"> ({item.count} payments)</span>
                        </span>
                        <div className="item-bar">
                          <div className="bar-fill" style={{ width: `${percentage}%` }}></div>
                        </div>
                        <span className="item-value">{percentage.toFixed(1)}%</span>
                      </div>
                    );
                  });
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

