import { useState, useEffect } from "react";
import Card from "../components/Card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { apiService } from "../services/api";
import { Download, RefreshCw, Calendar, TrendingUp, FileText, Users } from "lucide-react";
// Color scheme for charts
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function ReportsScreen() {
  const [trendType, setTrendType] = useState<"weekly" | "monthly" | "yearly">("weekly");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Real data states
  const [requests, setRequests] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [stats, setStats] = useState({
    todayRequests: 0,
    weekRequests: 0,
    todayAppointments: 0,
    weekAppointments: 0,
    totalRequests: 0,
    pendingRequests: 0,
    completedRequests: 0
  });

  // Data fetching functions
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [requestsResponse, appointmentsResponse, statsResponse] = await Promise.all([
        apiService.getDocumentRequests(),
        apiService.getAppointments(),
        apiService.getDashboardStats()
      ]);
      
      setRequests(requestsResponse.data || []);
      setAppointments(appointmentsResponse.data || []);
      setStats(statsResponse);
      
    } catch (err) {
      console.error('Error fetching reports data:', err);
      setError('Failed to load reports data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleExport = async (format: 'csv' | 'excel' = 'csv') => {
    try {
      const response = await apiService.exportRequests(format);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `requests-export.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      setError('Export failed. Please try again.');
    }
  };

  // Calculate trend data based on real data
  const getTrendData = () => {
    const now = new Date();
    const data = requests.map(req => new Date(req.requested_at));
    
    if (trendType === "weekly") {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return days.map(day => {
        const dayIndex = days.indexOf(day);
        const dayRequests = data.filter(date => date.getDay() === dayIndex).length;
        return { name: day, requests: dayRequests };
      });
    } else if (trendType === "monthly") {
      const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      return weeks.map((week, index) => {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - (now.getDay() + 7 * (3 - index)));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        const weekRequests = data.filter(date => 
          date >= weekStart && date <= weekEnd
        ).length;
        return { name: week, requests: weekRequests };
      });
    } else {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months.map(month => {
        const monthIndex = months.indexOf(month);
        const monthRequests = data.filter(date => date.getMonth() === monthIndex).length;
        return { name: month, requests: monthRequests };
      });
    }
  };

  // Calculate status distribution
  const getStatusData = () => {
    const statusCounts = requests.reduce((acc, req) => {
      acc[req.status] = (acc[req.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(statusCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
      value
    }));
  };

  // Calculate purpose distribution
  const getPurposeData = () => {
    const purposeCounts = requests.reduce((acc, req) => {
      const purpose = req.purpose || 'Other';
      acc[purpose] = (acc[purpose] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(purposeCounts).map(([purpose, count]) => ({
      purpose,
      count
    }));
  };

  // Calculate appointment data
  const getAppointmentData = () => {
    const now = new Date();
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    
    return weeks.map((week, index) => {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (now.getDay() + 7 * (3 - index)));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const weekAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.appointment_date);
        return aptDate >= weekStart && aptDate <= weekEnd;
      });
      
      return {
        week,
        scheduled: weekAppointments.length,
        completed: weekAppointments.filter(apt => apt.status === 'completed').length,
        expired: weekAppointments.filter(apt => apt.status === 'expired').length
      };
    });
  };

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const trendData = getTrendData();
  const statusData = getStatusData();
  const purposeData = getPurposeData();
  const appointmentData = getAppointmentData();

  if (loading) {
    return (
      <div className="reports-screen">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reports-screen">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={fetchData} className="retry-btn">
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-screen">
      {/* Header with actions */}
      <div className="reports-header">
        <div className="header-content">
          <h1 className="reports-title">
            <TrendingUp size={24} />
            Reports & Analytics
          </h1>
          <p className="reports-subtitle">Comprehensive insights into your registrar operations</p>
        </div>
        <div className="header-actions">
          <button 
            onClick={handleRefresh} 
            disabled={refreshing}
            className="action-btn secondary"
          >
            <RefreshCw size={16} className={refreshing ? 'spinning' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <div className="export-dropdown">
            <button className="action-btn primary">
              <Download size={16} />
              Export
            </button>
            <div className="dropdown-menu">
              <button onClick={() => handleExport('csv')} className="dropdown-item">
                Export as CSV
              </button>
              <button onClick={() => handleExport('excel')} className="dropdown-item">
                Export as Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid-four summary-cards">
        <div className="summary-card">
          <div className="card-icon">
            <FileText size={20} />
          </div>
          <div className="card-content">
            <h3>{stats.todayRequests}</h3>
          <p>Requests Today</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon">
            <Calendar size={20} />
          </div>
          <div className="card-content">
            <h3>{stats.weekRequests}</h3>
          <p>Requests This Week</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon">
            <Users size={20} />
          </div>
          <div className="card-content">
            <h3>{stats.todayAppointments}</h3>
          <p>Appointments Today</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon">
            <TrendingUp size={20} />
          </div>
          <div className="card-content">
            <h3>{stats.weekAppointments}</h3>
          <p>Appointments This Week</p>
          </div>
        </div>
      </div>

      <Card
        title={
          <div className="card-title-flex">
            <span>Requests Trend</span>
            <select
              value={trendType}
              onChange={(e) =>
                setTrendType(e.target.value as "weekly" | "monthly" | "yearly")
              }
              className="trend-select"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        }
      >
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line
                type="monotone"
                dataKey="requests"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid-two" style={{ marginTop: "24px" }}>
        <Card title="Requests by Status">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData}>
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar 
                dataKey="value" 
                fill="#3b82f6" 
                radius={[6, 6, 0, 0]}
                stroke="#ffffff"
                strokeWidth={1}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Request Status Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid-two" style={{ marginTop: "24px" }}>
        <Card title="Appointments Overview">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={appointmentData}>
              <XAxis 
                dataKey="week" 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Bar 
                dataKey="scheduled" 
                fill="#3b82f6" 
                radius={[6, 6, 0, 0]}
                name="Scheduled"
              />
              <Bar 
                dataKey="completed" 
                fill="#10b981" 
                radius={[6, 6, 0, 0]}
                name="Completed"
              />
              <Bar 
                dataKey="expired" 
                fill="#ef4444" 
                radius={[6, 6, 0, 0]}
                name="Expired"
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Top Requested Documents">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart layout="vertical" data={purposeData}>
              <XAxis 
                type="number" 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                dataKey="purpose" 
                type="category" 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                width={100}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar 
                dataKey="count" 
                fill="#3b82f6" 
                radius={[0, 6, 6, 0]}
                stroke="#ffffff"
                strokeWidth={1}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Additional Insights */}
      <div className="grid-two" style={{ marginTop: "24px" }}>
        <Card title="Performance Metrics">
          <div className="metrics-grid">
            <div className="metric-item">
              <div className="metric-value">{stats.totalRequests}</div>
              <div className="metric-label">Total Requests</div>
            </div>
            <div className="metric-item">
              <div className="metric-value">{stats.pendingRequests}</div>
              <div className="metric-label">Pending</div>
            </div>
            <div className="metric-item">
              <div className="metric-value">{stats.completedRequests}</div>
              <div className="metric-label">Completed</div>
            </div>
            <div className="metric-item">
              <div className="metric-value">
                {stats.totalRequests > 0 ? Math.round((stats.completedRequests / stats.totalRequests) * 100) : 0}%
              </div>
              <div className="metric-label">Completion Rate</div>
            </div>
          </div>
        </Card>

        <Card title="Quick Actions">
          <div className="quick-actions">
            <button onClick={handleRefresh} className="quick-action-btn">
              <RefreshCw size={16} />
              Refresh Data
            </button>
            <button onClick={() => handleExport('csv')} className="quick-action-btn">
              <Download size={16} />
              Export CSV
            </button>
            <button onClick={() => handleExport('excel')} className="quick-action-btn">
              <Download size={16} />
              Export Excel
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
