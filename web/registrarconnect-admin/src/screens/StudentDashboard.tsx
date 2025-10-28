import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../services/api";
import {
  FileText,
  Calendar,
  Bell,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  MessageCircle,
  Eye,
  TrendingUp,
  ArrowRight,
  Award
} from "lucide-react";
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
  receipt_image?: string;
  payment_approved?: boolean;
  document_approved?: boolean;
  current_status?: string;
  last_updated?: string;
}

interface Appointment {
  id: string;
  student_name: string;
  document_type: string;
  faculty_name: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  created_at: string;
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated and is a student
    const token = localStorage.getItem("accessToken");
    const role = localStorage.getItem("role");
    
    if (!token || role !== 'student') {
      navigate('/login');
      return;
    }
    
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [requestsResponse, appointmentsResponse] = await Promise.all([
        apiService.getDocumentRequests(),
        apiService.getAppointments()
      ]);
      
      setRequests(requestsResponse.data || []);
      setAppointments(appointmentsResponse.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock size={16} className="text-amber-500" />;
      case 'approved':
      case 'completed':
        return <CheckCircle2 size={16} className="text-emerald-500" />;
      case 'rejected':
        return <AlertTriangle size={16} className="text-red-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'approved':
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const upcomingAppointments = appointments?.filter((apt: any) =>
    new Date(apt.appointment_date) >= new Date()
  ).length || 0;

  const pendingRequests = requests?.filter((req: any) =>
    req.status === 'pending'
  ).length || 0;

  const completedRequests = requests?.filter((req: any) =>
    req.status === 'completed' || req.status === 'approved'
  ).length || 0;

  const totalRequests = requests?.length || 0;

  if (loading) {
    return (
      <div className="student-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      {/* Professional Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="welcome-section">
            <div className="greeting">
              <h1>{getGreeting()}, {localStorage.getItem("name") || "Student"}!</h1>
              <p>Here's your academic document management overview</p>
            </div>
            <div className="header-actions">
              <button 
                className="action-btn secondary"
                onClick={() => navigate('/student/notifications')}
              >
                <Bell size={18} />
                Notifications
              </button>
              <button 
                className="action-btn primary"
                onClick={() => navigate('/student/requests/new')}
              >
                <Plus size={18} />
                New Request
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Dashboard */}
      <div className="metrics-section">
        <div className="metrics-grid">
          <div className="metric-card primary">
            <div className="metric-icon">
              <FileText size={24} />
            </div>
            <div className="metric-content">
              <h3>{totalRequests}</h3>
              <p>Total Requests</p>
              <span className="metric-trend">
                <TrendingUp size={14} />
                All time
              </span>
            </div>
          </div>
          
          <div className="metric-card warning">
            <div className="metric-icon">
              <Clock size={24} />
            </div>
            <div className="metric-content">
              <h3>{pendingRequests}</h3>
              <p>Pending Review</p>
              <span className="metric-trend">
                <Clock size={14} />
                In progress
              </span>
            </div>
          </div>
          
          <div className="metric-card success">
            <div className="metric-icon">
              <CheckCircle2 size={24} />
            </div>
            <div className="metric-content">
              <h3>{completedRequests}</h3>
              <p>Completed</p>
              <span className="metric-trend">
                <Award size={14} />
                Ready for pickup
              </span>
            </div>
          </div>
          
          <div className="metric-card info">
            <div className="metric-icon">
              <Calendar size={24} />
            </div>
            <div className="metric-content">
              <h3>{upcomingAppointments}</h3>
              <p>Appointments</p>
              <span className="metric-trend">
                <Calendar size={14} />
                This week
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="actions-section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="actions-grid">
          <button 
            onClick={() => navigate('/student/requests/new')}
            className="action-card primary"
          >
            <div className="action-icon">
              <Plus size={24} />
            </div>
            <div className="action-content">
              <h3>Submit Request</h3>
              <p>Create a new document request</p>
            </div>
            <ArrowRight size={20} className="action-arrow" />
          </button>
          
          <button 
            onClick={() => navigate('/student/requests')}
            className="action-card"
          >
            <div className="action-icon">
              <Eye size={24} />
            </div>
            <div className="action-content">
              <h3>View Requests</h3>
              <p>Track your document requests</p>
            </div>
            <ArrowRight size={20} className="action-arrow" />
          </button>
          
          <button 
            onClick={() => navigate('/student/appointments')}
            className="action-card"
          >
            <div className="action-icon">
              <Calendar size={24} />
            </div>
            <div className="action-content">
              <h3>Appointments</h3>
              <p>Schedule and manage meetings</p>
            </div>
            <ArrowRight size={20} className="action-arrow" />
          </button>
          
          <button 
            onClick={() => navigate('/student/chat')}
            className="action-card"
          >
            <div className="action-icon">
              <MessageCircle size={24} />
            </div>
            <div className="action-content">
              <h3>AI Assistant</h3>
              <p>Get help with your requests</p>
            </div>
            <ArrowRight size={20} className="action-arrow" />
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="activity-section">
        <div className="section-header">
          <h2 className="section-title">Recent Activity</h2>
          <button 
            onClick={() => navigate('/student/requests')}
            className="view-all-btn"
          >
            View All
            <ArrowRight size={16} />
          </button>
        </div>
        
        <div className="activity-list">
          {requests?.slice(0, 4).map((request) => (
            <div key={request.id} className="activity-item">
              <div className="activity-icon">
                <FileText size={20} />
              </div>
              <div className="activity-content">
                <h4>{request.document_type}</h4>
                <p>{request.purpose}</p>
                <span className="activity-date">{formatDate(request.requested_at)}</span>
              </div>
              <div className="activity-status">
                <span className={`status-badge ${getStatusColor(request.status)}`}>
                  {getStatusIcon(request.status)}
                  {request.status}
                </span>
              </div>
            </div>
          )) || (
            <div className="empty-state">
              <div className="empty-icon">
                <FileText size={48} />
              </div>
              <h3>No requests yet</h3>
              <p>Start by creating your first document request</p>
              <button 
                onClick={() => navigate('/student/requests/new')}
                className="cta-button"
              >
                <Plus size={16} />
                Create Your First Request
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Appointments */}
      {upcomingAppointments > 0 && (
        <div className="appointments-section">
          <h2 className="section-title">Upcoming Appointments</h2>
          <div className="appointments-list">
            {appointments?.slice(0, 2).map((appointment) => (
              <div key={appointment.id} className="appointment-card">
                <div className="appointment-date">
                  <span className="day">{new Date(appointment.appointment_date).getDate()}</span>
                  <span className="month">{new Date(appointment.appointment_date).toLocaleDateString('en', { month: 'short' })}</span>
                </div>
                <div className="appointment-content">
                  <h4>Document Review</h4>
                  <p>{appointment.document_type}</p>
                  <span className="appointment-time">{appointment.appointment_time}</span>
                </div>
                <div className="appointment-status">
                  <span className={`status-badge ${getStatusColor(appointment.status)}`}>
                    {appointment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="help-section">
        <div className="help-card">
          <div className="help-content">
            <h3>Need Help?</h3>
            <p>Get assistance with your document requests or schedule an appointment with our staff.</p>
            <div className="help-actions">
              <button 
                onClick={() => navigate('/student/chat')}
                className="help-btn primary"
              >
                <MessageCircle size={16} />
                Chat with AI
              </button>
              <button 
                onClick={() => navigate('/student/appointments')}
                className="help-btn secondary"
              >
                <Calendar size={16} />
                Schedule Meeting
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}