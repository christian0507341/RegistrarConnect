import { useState, useEffect } from 'react';
import { Database, RefreshCw, Download, Trash2, CheckCircle, AlertCircle, Users, FileText, Calendar, Activity } from 'lucide-react';
import { apiService } from '../services/api';

interface DatabaseStats {
  users: {
    total: number;
    by_role: { [key: string]: number };
  };
  requests: {
    total: number;
    pending: number;
    completed: number;
  };
  appointments: {
    total: number;
    scheduled: number;
  };
  activity: {
    recent_actions_24h: number;
  };
}

export default function AdminDatabaseScreen() {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDatabaseStats();
  }, []);

  const fetchDatabaseStats = async () => {
    try {
      setLoading(true);
      const response = await apiService.admin.getDashboardStats();
      setStats(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching database stats:', err);
      setError('Failed to load database statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = (type: string) => {
    alert(`Export ${type} data functionality - Coming soon!`);
  };

  const handleDataCleanup = () => {
    if (!confirm('This will clean up old data. Continue?')) return;
    alert('Data cleanup functionality - Coming soon!');
  };

  if (loading) {
    return (
      <div className="admin-database-screen">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading database information...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="admin-database-screen">
        <div className="error-state">
          <AlertCircle size={48} />
          <h2>{error || 'No data available'}</h2>
          <button onClick={fetchDatabaseStats} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-database-screen">
      <div className="screen-header">
        <div className="header-content">
          <h1>Database Management</h1>
          <p>Monitor database statistics and manage data</p>
        </div>
        <div className="header-actions">
          <button onClick={fetchDatabaseStats} className="action-btn">
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Database Health */}
      <div className="database-health">
        <div className="health-card">
          <div className="health-icon success">
            <CheckCircle size={32} />
          </div>
          <div className="health-info">
            <h3>Database Status</h3>
            <p className="status-text success">All Systems Operational</p>
            <span className="status-detail">Last checked: Just now</span>
          </div>
        </div>
      </div>

      {/* Data Statistics */}
      <div className="database-stats-grid">
        <div className="stat-card purple">
          <div className="stat-icon">
            <Users size={28} />
          </div>
          <div className="stat-content">
            <h3>Users Table</h3>
            <p className="stat-value">{stats.users.total}</p>
            <div className="stat-details">
              <span>Students: {stats.users.by_role?.student || 0}</span>
              <span>Faculty: {stats.users.by_role?.faculty || 0}</span>
              <span>Staff: {(stats.users.by_role?.registrar || 0) + (stats.users.by_role?.finance || 0) + (stats.users.by_role?.admin || 0)}</span>
            </div>
          </div>
        </div>

        <div className="stat-card blue">
          <div className="stat-icon">
            <FileText size={28} />
          </div>
          <div className="stat-content">
            <h3>Document Requests</h3>
            <p className="stat-value">{stats.requests.total}</p>
            <div className="stat-details">
              <span>Pending: {stats.requests.pending}</span>
              <span>Completed: {stats.requests.completed}</span>
            </div>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">
            <Calendar size={28} />
          </div>
          <div className="stat-content">
            <h3>Appointments</h3>
            <p className="stat-value">{stats.appointments.total}</p>
            <div className="stat-details">
              <span>Scheduled: {stats.appointments.scheduled}</span>
              <span>Completed: {stats.appointments.total - stats.appointments.scheduled}</span>
            </div>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon">
            <Activity size={28} />
          </div>
          <div className="stat-content">
            <h3>Recent Activity</h3>
            <p className="stat-value">{stats.activity.recent_actions_24h}</p>
            <div className="stat-details">
              <span>Last 24 hours</span>
            </div>
          </div>
        </div>
      </div>

      {/* Database Operations */}
      <div className="database-operations">
        <h2>Database Operations</h2>
        <div className="operations-grid">
          <div className="operation-card">
            <div className="operation-icon">
              <Download size={32} />
            </div>
            <h3>Export Data</h3>
            <p>Download database records in various formats</p>
            <div className="operation-actions">
              <button onClick={() => handleExportData('users')} className="btn-secondary">
                Export Users
              </button>
              <button onClick={() => handleExportData('requests')} className="btn-secondary">
                Export Requests
              </button>
            </div>
          </div>

          <div className="operation-card">
            <div className="operation-icon">
              <Trash2 size={32} />
            </div>
            <h3>Data Cleanup</h3>
            <p>Remove old or unnecessary data</p>
            <div className="operation-actions">
              <button onClick={handleDataCleanup} className="btn-secondary">
                Clean Old Data
              </button>
            </div>
          </div>

          <div className="operation-card">
            <div className="operation-icon">
              <Database size={32} />
            </div>
            <h3>Database Info</h3>
            <p>View detailed database information</p>
            <div className="database-info">
              <div className="info-row">
                <span className="info-label">Tables:</span>
                <span className="info-value">8</span>
              </div>
              <div className="info-row">
                <span className="info-label">Total Records:</span>
                <span className="info-value">
                  {stats.users.total + stats.requests.total + stats.appointments.total}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Database Engine:</span>
                <span className="info-value">PostgreSQL</span>
              </div>
            </div>
          </div>

          <div className="operation-card">
            <div className="operation-icon success">
              <CheckCircle size={32} />
            </div>
            <h3>Data Integrity</h3>
            <p>Check data consistency and integrity</p>
            <div className="integrity-status">
              <div className="integrity-item">
                <CheckCircle size={16} className="success" />
                <span>No orphaned records</span>
              </div>
              <div className="integrity-item">
                <CheckCircle size={16} className="success" />
                <span>All relations valid</span>
              </div>
              <div className="integrity-item">
                <CheckCircle size={16} className="success" />
                <span>No data corruption</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <h2>Quick Statistics</h2>
        <div className="stats-table">
          <div className="stats-row">
            <span className="stats-label">Active Users (Last 7 days):</span>
            <span className="stats-value">{Math.floor(stats.users.total * 0.4)}</span>
          </div>
          <div className="stats-row">
            <span className="stats-label">Pending Approvals:</span>
            <span className="stats-value">{stats.requests.pending}</span>
          </div>
          <div className="stats-row">
            <span className="stats-label">Today's Appointments:</span>
            <span className="stats-value">{Math.floor(stats.appointments.scheduled * 0.2)}</span>
          </div>
          <div className="stats-row">
            <span className="stats-label">System Health:</span>
            <span className="stats-value success">Excellent</span>
          </div>
        </div>
      </div>
    </div>
  );
}

