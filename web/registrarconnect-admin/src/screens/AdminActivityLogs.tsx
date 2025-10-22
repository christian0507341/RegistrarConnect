import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Search, Filter, Download, Calendar } from 'lucide-react';

interface LogEntry {
  id: string;
  user: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export default function AdminActivityLogs() {
  const navigate = useNavigate();
  const [logs] = useState<LogEntry[]>([
    { id: '1', user: 'John Doe', action: 'Login', details: 'Successful login', timestamp: '2024-01-20 10:30:45', ipAddress: '192.168.1.100', type: 'success' },
    { id: '2', user: 'Jane Smith', action: 'Document Request', details: 'Created new TOR request', timestamp: '2024-01-20 10:25:30', ipAddress: '192.168.1.101', type: 'info' },
    { id: '3', user: 'Mike Johnson', action: 'Settings Changed', details: 'Updated system settings', timestamp: '2024-01-20 10:20:15', ipAddress: '192.168.1.102', type: 'warning' },
    { id: '4', user: 'System', action: 'Error', details: 'Failed backup attempt', timestamp: '2024-01-20 10:15:00', ipAddress: 'N/A', type: 'error' },
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    // Authentication is handled by the protected route in App.tsx
    // TODO: Fetch logs data from backend
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || log.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleExport = () => {
    alert('Exporting logs...');
  };

  return (
    <div className="admin-logs-screen">
      <div className="screen-header">
        <div className="header-content">
          <h1>Activity Logs</h1>
          <p>Monitor all system activities and user actions</p>
        </div>
        <button onClick={handleExport} className="action-btn primary">
          <Download size={16} />
          Export Logs
        </button>
      </div>

      {/* Stats */}
      <div className="logs-stats">
        <div className="stat-box blue">
          <Activity size={24} />
          <div>
            <p className="stat-value">{logs.length}</p>
            <p className="stat-label">Total Logs</p>
          </div>
        </div>
        <div className="stat-box green">
          <Activity size={24} />
          <div>
            <p className="stat-value">{logs.filter(l => l.type === 'success').length}</p>
            <p className="stat-label">Success</p>
          </div>
        </div>
        <div className="stat-box orange">
          <Activity size={24} />
          <div>
            <p className="stat-value">{logs.filter(l => l.type === 'warning').length}</p>
            <p className="stat-label">Warnings</p>
          </div>
        </div>
        <div className="stat-box red">
          <Activity size={24} />
          <div>
            <p className="stat-value">{logs.filter(l => l.type === 'error').length}</p>
            <p className="stat-label">Errors</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="controls-section">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <Filter size={20} />
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="table-container">
        <table className="logs-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>User</th>
              <th>Action</th>
              <th>Details</th>
              <th>Timestamp</th>
              <th>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map(log => (
              <tr key={log.id}>
                <td>
                  <span className={`type-badge ${log.type}`}>{log.type}</span>
                </td>
                <td>{log.user}</td>
                <td><strong>{log.action}</strong></td>
                <td>{log.details}</td>
                <td>{log.timestamp}</td>
                <td>{log.ipAddress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

