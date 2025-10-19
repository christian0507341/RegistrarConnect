import { useState, useEffect } from "react";
import Card from "../components/Card";
import "../styles/screens/DashboardScreen.css";
import {
  Activity,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  TrendingUp,
  Users,
  FileText,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  Download,
  Settings
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { apiService } from "../services/api";

// Types for database integration
interface DocumentRequest {
  id: string;
  student: string;
  student_id: string;
  document_type: string;
  semester: string;
  school_year: string;
  purpose: string;
  status: string;
  requested_at: string;
}

interface DashboardStats {
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  todayRequests: number;
}

export default function DashboardScreen() {
  const [trendType, setTrendType] = useState<"weekly" | "monthly" | "yearly">("weekly");
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalRequests: 0,
    pendingRequests: 0,
    completedRequests: 0,
    todayRequests: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from database
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch document requests and stats
        const [requestsResponse, statsData] = await Promise.all([
          apiService.getDocumentRequests(),
          apiService.getDashboardStats()
        ]);

        setRequests(requestsResponse.data);
        setStats(statsData);

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Generate chart data from real requests
  const generateChartData = () => {
    if (!requests.length) return [];

    const now = new Date();
    const data: { name: string; requests: number; completed: number; pending: number }[] = [];

    if (trendType === "weekly") {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        const dayRequests = requests.filter(req => req.requested_at.startsWith(dateStr));
        const completed = dayRequests.filter(req => 
          ['ready_to_claim', 'cancelled', 'rejected'].includes(req.status)
        ).length;
        const pending = dayRequests.filter(req => 
          ['pending', 'awaiting_payment', 'on_process'].includes(req.status)
        ).length;

        data.push({
          name: dayName,
          requests: dayRequests.length,
          completed,
          pending
        });
      }
    } else if (trendType === "monthly") {
      // Last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - (i * 7 + 6));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        const weekRequests = requests.filter(req => {
          const reqDate = new Date(req.requested_at);
          return reqDate >= weekStart && reqDate <= weekEnd;
        });
        
        const completed = weekRequests.filter(req => 
          ['ready_to_claim', 'cancelled', 'rejected'].includes(req.status)
        ).length;
        const pending = weekRequests.filter(req => 
          ['pending', 'awaiting_payment', 'on_process'].includes(req.status)
        ).length;

        data.push({
          name: `Week ${4 - i}`,
          requests: weekRequests.length,
          completed,
          pending
        });
      }
    } else {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const month = new Date(now);
        month.setMonth(month.getMonth() - i);
        const monthStr = month.toISOString().substring(0, 7);
        const monthName = month.toLocaleDateString('en-US', { month: 'short' });
        
        const monthRequests = requests.filter(req => req.requested_at.startsWith(monthStr));
        const completed = monthRequests.filter(req => 
          ['ready_to_claim', 'cancelled', 'rejected'].includes(req.status)
        ).length;
        const pending = monthRequests.filter(req => 
          ['pending', 'awaiting_payment', 'on_process'].includes(req.status)
        ).length;

        data.push({
          name: monthName,
          requests: monthRequests.length,
          completed,
          pending
        });
      }
    }

    return data;
  };

  const data = generateChartData();

  // Generate request types data from real requests
  const requestTypesData = (() => {
    const typeCounts: { [key: string]: number } = {};
    requests.forEach(req => {
      typeCounts[req.document_type] = (typeCounts[req.document_type] || 0) + 1;
    });

    const total = requests.length;
    const colors = ["#667eea", "#764ba2", "#f093fb", "#4facfe", "#43e97b"];
    
    return Object.entries(typeCounts).map(([name, count], index) => ({
      name,
      value: total > 0 ? Math.round((count / total) * 100) : 0,
      color: colors[index % colors.length]
    }));
  })();

  // Generate recent activities from real requests
  const recentActivities = requests
    .sort((a, b) => new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime())
    .slice(0, 4)
    .map((req) => {
      const timeAgo = (() => {
        const now = new Date();
        const reqDate = new Date(req.requested_at);
        const diffMs = now.getTime() - reqDate.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
      })();

      return {
        id: req.id,
        type: "request",
        message: `New ${req.document_type} request from ${req.student}`,
        time: timeAgo,
        icon: FileText
      };
    });

  if (loading) {
    return (
      <div className="dashboard-screen">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-screen">
        <div className="error-container">
          <AlertTriangle size={48} />
          <h3>Error Loading Dashboard</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-screen">
      {/* Welcome Section */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1 className="dashboard-title">Welcome back, Admin!</h1>
          <p className="dashboard-subtitle">Here's what's happening with your requests today.</p>
        </div>
        <div className="dashboard-actions">
          <button className="action-btn primary">
            <Bell size={16} />
            Send Notifications
          </button>
          <button className="action-btn secondary">
            <Download size={16} />
            Export Data
          </button>
        </div>
      </div>

             {/* Stats Grid */}
             <div className="stats-grid">
               <div className="stat-card primary">
                 <div className="stat-content">
                   <div className="stat-header">
                     <div className="stat-icon">
                       <Activity size={24} />
                     </div>
                     <div className="stat-trend up">
                       <ArrowUpRight size={16} />
                       <span>+{Math.round((stats.todayRequests / Math.max(stats.totalRequests, 1)) * 100)}%</span>
                     </div>
                   </div>
                   <div className="stat-value">{stats.todayRequests}</div>
                   <div className="stat-label">Requests Today</div>
                   <div className="stat-sublabel">Since 12:00 AM</div>
                 </div>
               </div>

               <div className="stat-card warning">
                 <div className="stat-content">
                   <div className="stat-header">
                     <div className="stat-icon">
                       <AlertTriangle size={24} />
                     </div>
                     <div className="stat-trend down">
                       <ArrowDownRight size={16} />
                       <span>-{Math.round((stats.pendingRequests / Math.max(stats.totalRequests, 1)) * 100)}%</span>
                     </div>
                   </div>
                   <div className="stat-value">{stats.pendingRequests}</div>
                   <div className="stat-label">Pending Review</div>
                   <div className="stat-sublabel">Need your attention</div>
                 </div>
               </div>

               <div className="stat-card success">
                 <div className="stat-content">
                   <div className="stat-header">
                     <div className="stat-icon">
                       <CheckCircle2 size={24} />
                     </div>
                     <div className="stat-trend up">
                       <ArrowUpRight size={16} />
                       <span>+{Math.round((stats.completedRequests / Math.max(stats.totalRequests, 1)) * 100)}%</span>
                     </div>
                   </div>
                   <div className="stat-value">{stats.completedRequests}</div>
                   <div className="stat-label">Completed</div>
                   <div className="stat-sublabel">This month</div>
                 </div>
               </div>

               <div className="stat-card info">
                 <div className="stat-content">
                   <div className="stat-header">
                     <div className="stat-icon">
                       <Calendar size={24} />
                     </div>
                     <div className="stat-trend up">
                       <ArrowUpRight size={16} />
                       <span>+{Math.round((stats.totalRequests / Math.max(stats.totalRequests, 1)) * 100)}%</span>
                     </div>
                   </div>
                   <div className="stat-value">{stats.totalRequests}</div>
                   <div className="stat-label">Total Requests</div>
                   <div className="stat-sublabel">All time</div>
                 </div>
               </div>
             </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-container">
          <Card
            title={
              <div className="chart-header">
                <div className="chart-title">
                  <TrendingUp size={20} />
                  <span>Request Trends</span>
                </div>
                <select
                  value={trendType}
                  onChange={(e) => setTrendType(e.target.value as "weekly" | "monthly" | "yearly")}
                  className="trend-selector"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            }
            className="chart-card"
          >
            <div className="chart-content">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#666"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#666"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="requests" 
                    stroke="#667eea" 
                    strokeWidth={3}
                    dot={{ fill: '#667eea', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#667eea', strokeWidth: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="completed" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="chart-container">
          <Card
            title={
              <div className="chart-header">
                <div className="chart-title">
                  <FileText size={20} />
                  <span>Request Types</span>
                </div>
              </div>
            }
            className="chart-card"
          >
            <div className="chart-content">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={requestTypesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {requestTypesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-legend">
                {requestTypesData.map((item, index) => (
                  <div key={index} className="legend-item">
                    <div 
                      className="legend-color" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="legend-label">{item.name}</span>
                    <span className="legend-value">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bottom-section">
        <div className="recent-activities">
          <Card
            title={
              <div className="chart-header">
                <div className="chart-title">
                  <Clock size={20} />
                  <span>Recent Activities</span>
                </div>
              </div>
            }
            className="activities-card"
          >
            <div className="activities-list">
              {recentActivities.map((activity) => {
                const IconComponent = activity.icon;
                return (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon">
                      <IconComponent size={16} />
                    </div>
                    <div className="activity-content">
                      <div className="activity-message">{activity.message}</div>
                      <div className="activity-time">{activity.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="quick-actions">
          <Card
            title={
              <div className="chart-header">
                <div className="chart-title">
                  <Settings size={20} />
                  <span>Quick Actions</span>
                </div>
              </div>
            }
            className="actions-card"
          >
            <div className="actions-grid">
              <button className="quick-action-btn">
                <Bell size={18} />
                <span>Send Notifications</span>
              </button>
              <button className="quick-action-btn">
                <Download size={18} />
                <span>Export Reports</span>
              </button>
              <button className="quick-action-btn">
                <Calendar size={18} />
                <span>Schedule Meeting</span>
              </button>
              <button className="quick-action-btn">
                <Users size={18} />
                <span>Manage Users</span>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
