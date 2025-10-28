import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, FileText, Calendar, Download, AlertCircle, PieChart, RefreshCw, ArrowUp, Minus } from 'lucide-react';
import { apiService } from '../services/api';

interface ReportData {
  requests_by_type: Array<{ document_type: string; count: number }>;
  requests_by_status: Array<{ status: string; count: number }>;
  appointments_by_status: Array<{ status: string; count: number }>;
  users_by_role: Array<{ role: string; count: number }>;
  recent_registrations: Array<{ day: string; count: number }>;
}

export default function AdminReportsScreen() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await apiService.admin.getSystemReports();
      setReportData(response.data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err: any) {
      console.error('Error fetching reports:', err);
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
  };

  const handleExport = () => {
    if (!reportData) return;
    
    // Create CSV data
    const csvContent = `Reports & Analytics Export - ${new Date().toLocaleString()}\n\n` +
      `Total Users: ${getTotalUsers()}\n` +
      `Total Requests: ${getTotalRequests()}\n` +
      `Total Appointments: ${getTotalAppointments()}\n\n` +
      `Users by Role:\n${reportData.users_by_role.map(item => `${item.role},${item.count}`).join('\n')}\n\n` +
      `Requests by Type:\n${reportData.requests_by_type.map(item => `${item.document_type},${item.count}`).join('\n')}`;
    
    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reports-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="admin-reports-screen">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div className="admin-reports-screen">
        <div className="error-state">
          <AlertCircle size={48} />
          <h2>{error || 'No data available'}</h2>
          <button onClick={fetchReports} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  const getTotalRequests = () => {
    return reportData.requests_by_status.reduce((sum, item) => sum + item.count, 0);
  };

  const getTotalUsers = () => {
    return reportData.users_by_role.reduce((sum, item) => sum + item.count, 0);
  };

  const getTotalAppointments = () => {
    return reportData.appointments_by_status.reduce((sum, item) => sum + item.count, 0);
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('approved') || statusLower.includes('claimed') || statusLower === 'completed') {
      return 'green';
    }
    if (statusLower.includes('pending') || statusLower === 'scheduled') {
      return 'orange';
    }
    if (statusLower.includes('rejected') || statusLower.includes('cancelled') || statusLower === 'no_show') {
      return 'red';
    }
    return 'blue';
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Never';
    const now = new Date();
    const diff = now.getTime() - lastUpdated.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return lastUpdated.toLocaleDateString();
  };

  return (
    <div className="admin-reports-screen">
      <div className="screen-header">
        <div className="header-content">
          <h1>Reports & Analytics</h1>
          <p>System-wide statistics and insights</p>
          {lastUpdated && (
            <span className="last-updated">Last updated: {formatLastUpdated()}</span>
          )}
        </div>
        <div className="header-actions">
          <button 
            onClick={handleRefresh} 
            className="action-btn secondary"
            disabled={refreshing}
          >
            <RefreshCw size={16} className={refreshing ? 'spinning' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button onClick={handleExport} className="action-btn primary">
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Overview Cards - Enhanced */}
      <div className="reports-overview">
        <div className="stat-card-modern purple">
          <div className="stat-card-header">
            <div className="stat-icon-modern">
              <Users size={24} />
            </div>
            <div className="stat-trend positive">
              <ArrowUp size={14} />
              <span>12%</span>
            </div>
          </div>
          <div className="stat-card-body">
            <h3>Total Users</h3>
            <p className="stat-value-modern">{getTotalUsers().toLocaleString()}</p>
            <span className="stat-subtitle">
              {reportData.users_by_role.filter(r => r.role === 'student')[0]?.count || 0} students
            </span>
          </div>
        </div>

        <div className="stat-card-modern blue">
          <div className="stat-card-header">
            <div className="stat-icon-modern">
              <FileText size={24} />
            </div>
            <div className="stat-trend positive">
              <ArrowUp size={14} />
              <span>8%</span>
            </div>
          </div>
          <div className="stat-card-body">
            <h3>Total Requests</h3>
            <p className="stat-value-modern">{getTotalRequests().toLocaleString()}</p>
            <span className="stat-subtitle">
              {reportData.requests_by_status.filter(r => r.status === 'pending')[0]?.count || 0} pending
            </span>
          </div>
        </div>

        <div className="stat-card-modern green">
          <div className="stat-card-header">
            <div className="stat-icon-modern">
              <Calendar size={24} />
            </div>
            <div className="stat-trend positive">
              <ArrowUp size={14} />
              <span>15%</span>
            </div>
          </div>
          <div className="stat-card-body">
            <h3>Total Appointments</h3>
            <p className="stat-value-modern">{getTotalAppointments().toLocaleString()}</p>
            <span className="stat-subtitle">
              {reportData.appointments_by_status.filter(r => r.status === 'scheduled')[0]?.count || 0} scheduled
            </span>
          </div>
        </div>

        <div className="stat-card-modern orange">
          <div className="stat-card-header">
            <div className="stat-icon-modern">
              <TrendingUp size={24} />
            </div>
            <div className="stat-trend neutral">
              <Minus size={14} />
              <span>0%</span>
            </div>
          </div>
          <div className="stat-card-body">
            <h3>New Users (30d)</h3>
            <p className="stat-value-modern">
              {reportData.recent_registrations.reduce((sum, item) => sum + item.count, 0).toLocaleString()}
            </p>
            <span className="stat-subtitle">Last 30 days</span>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="reports-grid">
        {/* Requests by Document Type - Enhanced */}
        <div className="report-card-modern">
          <div className="report-header-modern">
            <div className="report-title-modern">
              <div className="report-icon-wrapper">
                <PieChart size={20} />
              </div>
              <div>
                <h3>Requests by Document Type</h3>
                <span className="report-subtitle">Distribution breakdown</span>
              </div>
            </div>
          </div>
          <div className="report-content">
            {reportData.requests_by_type.length === 0 ? (
              <div className="empty-state-modern">
                <PieChart size={48} />
                <p>No data available</p>
                <span>Data will appear when requests are created</span>
              </div>
            ) : (
              <div className="data-list-modern">
                {reportData.requests_by_type.map((item, index) => {
                  const percentage = ((item.count / getTotalRequests()) * 100).toFixed(1);
                  return (
                    <div key={index} className="data-item-modern">
                      <div className="data-item-header">
                        <span className="data-label-modern">{item.document_type}</span>
                        <span className="data-percentage">{percentage}%</span>
                      </div>
                      <div className="data-bar-wrapper">
                        <div 
                          className="data-bar-modern" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="data-count">{item.count} requests</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Requests by Status - Enhanced */}
        <div className="report-card-modern">
          <div className="report-header-modern">
            <div className="report-title-modern">
              <div className="report-icon-wrapper">
                <BarChart3 size={20} />
              </div>
              <div>
                <h3>Requests by Status</h3>
                <span className="report-subtitle">Current status breakdown</span>
              </div>
            </div>
          </div>
          <div className="report-content">
            {reportData.requests_by_status.length === 0 ? (
              <div className="empty-state-modern">
                <BarChart3 size={48} />
                <p>No data available</p>
                <span>Data will appear when requests are created</span>
              </div>
            ) : (
              <div className="data-list-modern">
                {reportData.requests_by_status.map((item, index) => {
                  const percentage = ((item.count / getTotalRequests()) * 100).toFixed(1);
                  return (
                    <div key={index} className="data-item-modern">
                      <div className="data-item-header">
                        <span className="data-label-modern">
                          <span className={`status-dot ${getStatusColor(item.status)}`}></span>
                          {item.status.replace(/_/g, ' ').charAt(0).toUpperCase() + item.status.replace(/_/g, ' ').slice(1)}
                        </span>
                        <span className="data-percentage">{percentage}%</span>
                      </div>
                      <div className="data-bar-wrapper">
                        <div 
                          className={`data-bar-modern ${getStatusColor(item.status)}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="data-count">{item.count} requests</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Users by Role - Enhanced */}
        <div className="report-card-modern">
          <div className="report-header-modern">
            <div className="report-title-modern">
              <div className="report-icon-wrapper">
                <Users size={20} />
              </div>
              <div>
                <h3>Users by Role</h3>
                <span className="report-subtitle">Role distribution</span>
              </div>
            </div>
          </div>
          <div className="report-content">
            {reportData.users_by_role.length === 0 ? (
              <div className="empty-state-modern">
                <Users size={48} />
                <p>No data available</p>
                <span>User data will appear here</span>
              </div>
            ) : (
              <div className="data-list-modern">
                {reportData.users_by_role.map((item, index) => {
                  const percentage = ((item.count / getTotalUsers()) * 100).toFixed(1);
                  return (
                    <div key={index} className="data-item-modern">
                      <div className="data-item-header">
                        <span className="data-label-modern">
                          {item.role.charAt(0).toUpperCase() + item.role.slice(1)}
                        </span>
                        <span className="data-percentage">{percentage}%</span>
                      </div>
                      <div className="data-bar-wrapper">
                        <div 
                          className="data-bar-modern" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="data-count">{item.count} users</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Appointments by Status - Enhanced */}
        <div className="report-card-modern">
          <div className="report-header-modern">
            <div className="report-title-modern">
              <div className="report-icon-wrapper">
                <Calendar size={20} />
              </div>
              <div>
                <h3>Appointments by Status</h3>
                <span className="report-subtitle">Appointment breakdown</span>
              </div>
            </div>
          </div>
          <div className="report-content">
            {reportData.appointments_by_status.length === 0 ? (
              <div className="empty-state-modern">
                <Calendar size={48} />
                <p>No data available</p>
                <span>Appointment data will appear here</span>
              </div>
            ) : (
              <div className="data-list-modern">
                {reportData.appointments_by_status.map((item, index) => {
                  const percentage = ((item.count / getTotalAppointments()) * 100).toFixed(1);
                  return (
                    <div key={index} className="data-item-modern">
                      <div className="data-item-header">
                        <span className="data-label-modern">
                          <span className={`status-dot ${getStatusColor(item.status)}`}></span>
                          {item.status.replace(/_/g, ' ').charAt(0).toUpperCase() + item.status.replace(/_/g, ' ').slice(1)}
                        </span>
                        <span className="data-percentage">{percentage}%</span>
                      </div>
                      <div className="data-bar-wrapper">
                        <div 
                          className={`data-bar-modern ${getStatusColor(item.status)}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="data-count">{item.count} appointments</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Registrations - Enhanced */}
        <div className="report-card-modern full-width">
          <div className="report-header-modern">
            <div className="report-title-modern">
              <div className="report-icon-wrapper">
                <TrendingUp size={20} />
              </div>
              <div>
                <h3>User Registrations Trend</h3>
                <span className="report-subtitle">Last 30 days activity</span>
              </div>
            </div>
            <div className="chart-legend">
              <div className="legend-item">
                <div className="legend-dot purple"></div>
                <span>New Users</span>
              </div>
            </div>
          </div>
          <div className="report-content">
            {reportData.recent_registrations.length === 0 ? (
              <div className="empty-state-modern">
                <TrendingUp size={48} />
                <p>No registration data</p>
                <span>User registration data will appear here</span>
              </div>
            ) : (
              <div className="timeline-chart-modern">
                {reportData.recent_registrations.map((item, index) => {
                  const maxCount = Math.max(...reportData.recent_registrations.map(r => r.count));
                  const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                  return (
                    <div key={index} className="timeline-item-modern" title={`${item.count} registrations`}>
                      <div className="timeline-bar-container-modern">
                        <div 
                          className="timeline-bar-modern"
                          style={{ height: `${height}%` }}
                        >
                          <span className="timeline-tooltip">{item.count}</span>
                        </div>
                      </div>
                      <div className="timeline-date-modern">
                        {new Date(item.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

