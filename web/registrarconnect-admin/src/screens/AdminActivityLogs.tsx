import { useState, useEffect } from 'react';
import { Activity, Search, Filter, Download, RefreshCw, AlertCircle } from 'lucide-react';
import { apiService } from '../services/api';

interface ActivityLog {
  id: number;
  action: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  } | null;
  document_request: {
    id: number;
    document_type: string;
    status: string;
  };
  notes: string;
  created_at: string;
}

export default function AdminActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [limit, setLimit] = useState(100);

  useEffect(() => {
    fetchLogs();
  }, [filterAction, limit]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params: any = { limit };
      if (filterAction !== 'all') params.action_type = filterAction;
      
      const response = await apiService.admin.getActivityLogs(params);
      setLogs(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching activity logs:', err);
      setError('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (log.user?.name.toLowerCase().includes(searchLower)) ||
      (log.user?.email.toLowerCase().includes(searchLower)) ||
      log.action.toLowerCase().includes(searchLower) ||
      log.document_request.document_type.toLowerCase().includes(searchLower)
    );
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case 'approved':
      case 'payment_approved':
        return 'green';
      case 'rejected':
      case 'payment_rejected':
        return 'red';
      case 'created':
        return 'blue';
      case 'claimed':
        return 'purple';
      default:
        return 'gray';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="admin-activity-logs">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading activity logs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-activity-logs">
        <div className="error-state">
          <AlertCircle size={48} />
          <h2>{error}</h2>
          <button onClick={fetchLogs} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-activity-logs">
      <div className="screen-header">
        <div className="header-content">
          <h1>Activity Logs</h1>
          <p>System-wide activity monitoring and audit trail</p>
        </div>
        <div className="header-actions">
          <button onClick={fetchLogs} className="action-btn">
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="logs-stats">
        <div className="stat-box purple">
          <Activity size={24} />
          <div>
            <p className="stat-value">{logs.length}</p>
            <p className="stat-label">Total Actions</p>
          </div>
        </div>
        <div className="stat-box green">
          <Activity size={24} />
          <div>
            <p className="stat-value">
              {logs.filter(l => l.action.includes('approved')).length}
            </p>
            <p className="stat-label">Approvals</p>
          </div>
        </div>
        <div className="stat-box red">
          <Activity size={24} />
          <div>
            <p className="stat-value">
              {logs.filter(l => l.action.includes('rejected')).length}
            </p>
            <p className="stat-label">Rejections</p>
          </div>
        </div>
        <div className="stat-box blue">
          <Activity size={24} />
          <div>
            <p className="stat-value">
              {logs.filter(l => l.action === 'created').length}
            </p>
            <p className="stat-label">New Requests</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="controls-section">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by user, action, or document type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <Filter size={20} />
          <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)}>
            <option value="all">All Actions</option>
            <option value="created">Created</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="payment_approved">Payment Approved</option>
            <option value="payment_rejected">Payment Rejected</option>
            <option value="claimed">Claimed</option>
          </select>
          <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); }}>
            <option value="50">Last 50</option>
            <option value="100">Last 100</option>
            <option value="200">Last 200</option>
            <option value="500">Last 500</option>
          </select>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="activity-timeline">
        {filteredLogs.length === 0 ? (
          <div className="empty-state">
            <Activity size={48} />
            <h3>No activity logs found</h3>
            <p>Try adjusting your filters</p>
          </div>
        ) : (
          filteredLogs.map((log) => (
              <div key={log.id} className="activity-item">
              <div className={`activity-indicator ${getActionColor(log.action)}`}></div>
              <div className="activity-content">
                <div className="activity-header">
                  <div className="activity-user">
                    <div className="user-avatar">
                      {log.user ? log.user.name.charAt(0) : 'S'}
                    </div>
                    <div>
                      <p className="user-name">{log.user ? log.user.name : 'System'}</p>
                      <p className="user-role">{log.user ? log.user.role : 'automated'}</p>
                    </div>
                  </div>
                  <span className="activity-time">{formatDate(log.created_at)}</span>
                </div>
                <div className="activity-body">
                  <div className="activity-action">
                    <span className={`action-badge ${getActionColor(log.action)}`}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                    <span className="activity-target">
                      {log.document_request.document_type} (#{log.document_request.id})
                    </span>
                  </div>
                  {log.notes && (
                    <div className="activity-notes">
                      <p>{log.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
