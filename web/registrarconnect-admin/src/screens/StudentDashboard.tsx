import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../services/api";
import { notificationService } from "../services/notificationService";
import Card from "../components/Card";
import {
  FileText,
  Calendar,
  Bell,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Download,
  Settings,
  BookOpen,
  GraduationCap,
  TrendingUp,
  Activity
} from "lucide-react";
import "../styles/screens/StudentDashboardScreen.css";

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
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    upcomingAppointments: 0
  });

  // Fetch student data
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        
        // Check authentication
        const token = localStorage.getItem("accessToken");
        if (!token) {
          navigate("/student/login");
          return;
        }

        // Fetch document requests
        const requestsResponse = await apiService.getDocumentRequests();
        const requestsData = Array.isArray(requestsResponse.data) 
          ? requestsResponse.data 
          : requestsResponse.data?.results || [];
        
        setRequests(requestsData);

        // Fetch appointments
        try {
          const appointmentsResponse = await apiService.getStudentAppointments();
          setAppointments(appointmentsResponse.data || []);
        } catch (err) {
          console.log("No appointments found");
          setAppointments([]);
        }

        // Calculate stats
        const totalRequests = requestsData.length;
        const pendingRequests = requestsData.filter(req => 
          ['pending', 'awaiting_payment', 'on_process'].includes(req.status)
        ).length;
        const approvedRequests = requestsData.filter(req => 
          ['ready_to_claim', 'claimed'].includes(req.status)
        ).length;
        const upcomingAppointments = appointmentsData?.filter(apt => 
          new Date(apt.appointment_date) >= new Date()
        ).length || 0;

        setStats({
          totalRequests,
          pendingRequests,
          approvedRequests,
          upcomingAppointments
        });

      } catch (err) {
        console.error("Error fetching student data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [navigate]);

  // Request notification permission
  useEffect(() => {
    notificationService.requestPermission();
  }, []);

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'draft': return 'Draft';
      case 'confirming': return 'Confirming';
      case 'awaiting_payment': return 'Awaiting Payment';
      case 'pending': return 'Pending';
      case 'on_process': return 'Processing';
      case 'ready_to_claim': return 'Ready to Claim';
      case 'cancelled': return 'Cancelled';
      case 'rejected': return 'Rejected';
      case 'claimed': return 'Claimed';
      default: return 'Pending';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready_to_claim': return 'success';
      case 'claimed': return 'success';
      case 'rejected': return 'error';
      case 'cancelled': return 'error';
      case 'on_process': return 'warning';
      default: return 'info';
    }
  };

  if (loading) {
    return (
      <div className="student-dashboard-screen">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-dashboard-screen">
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
    <div className="student-dashboard-screen">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <div className="welcome-content">
            <h1 className="dashboard-title">
              <span className="title-gradient">Welcome back,</span>
              <span className="title-name">{localStorage.getItem("name") || "Student"}</span>
            </h1>
            <p className="dashboard-subtitle">
              Your personalized student portal with real-time updates
            </p>
          </div>
          <div className="student-badge">
            <div className="badge-icon">🎓</div>
            <span>Student Portal</span>
          </div>
        </div>
        <div className="dashboard-actions">
          <button 
            className="action-btn primary"
            onClick={() => navigate("/student/requests/new")}
          >
            <Plus size={16} />
            <span>New Request</span>
          </button>
          <button 
            className="action-btn secondary"
            onClick={() => navigate("/student/appointments")}
          >
            <Calendar size={16} />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-content">
            <div className="stat-header">
              <div className="stat-icon">
                <FileText size={24} />
              </div>
            </div>
            <div className="stat-value">{stats.totalRequests}</div>
            <div className="stat-label">Total Requests</div>
            <div className="stat-sublabel">All time</div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-content">
            <div className="stat-header">
              <div className="stat-icon">
                <Clock size={24} />
              </div>
            </div>
            <div className="stat-value">{stats.pendingRequests}</div>
            <div className="stat-label">Pending</div>
            <div className="stat-sublabel">Under review</div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-content">
            <div className="stat-header">
              <div className="stat-icon">
                <CheckCircle2 size={24} />
              </div>
            </div>
            <div className="stat-value">{stats.approvedRequests}</div>
            <div className="stat-label">Approved</div>
            <div className="stat-sublabel">Ready to claim</div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-content">
            <div className="stat-header">
              <div className="stat-icon">
                <Calendar size={24} />
              </div>
            </div>
            <div className="stat-value">{stats.upcomingAppointments}</div>
            <div className="stat-label">Appointments</div>
            <div className="stat-sublabel">Scheduled</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="content-grid">
        {/* Recent Requests */}
        <Card
          title={
            <div className="card-header-content">
              <div className="card-title">
                <FileText size={20} />
                <span>Recent Requests</span>
              </div>
              <button 
                className="view-all-btn"
                onClick={() => navigate("/student/requests")}
              >
                View All
              </button>
            </div>
          }
          className="requests-card"
        >
          <div className="requests-list">
            {requests.slice(0, 5).map((request) => (
              <div key={request.id} className="request-item">
                <div className="request-info">
                  <div className="request-type">{request.document_type}</div>
                  <div className="request-date">
                    {new Date(request.requested_at).toLocaleDateString()}
                  </div>
                </div>
                <div className={`status-badge ${getStatusColor(request.status)}`}>
                  {getStatusDisplay(request.status)}
                </div>
              </div>
            ))}
            {requests.length === 0 && (
              <div className="empty-state">
                <FileText size={48} />
                <h3>No requests yet</h3>
                <p>Start by creating your first document request</p>
                <button 
                  className="action-btn primary"
                  onClick={() => navigate("/student/requests/new")}
                >
                  <Plus size={16} />
                  Create Request
                </button>
              </div>
            )}
          </div>
        </Card>

        {/* Upcoming Appointments */}
        <Card
          title={
            <div className="card-header-content">
              <div className="card-title">
                <Calendar size={20} />
                <span>Upcoming Appointments</span>
              </div>
              <button 
                className="view-all-btn"
                onClick={() => navigate("/student/appointments")}
              >
                View All
              </button>
            </div>
          }
          className="appointments-card"
        >
          <div className="appointments-list">
            {appointments.slice(0, 3).map((appointment) => (
              <div key={appointment.id} className="appointment-item">
                <div className="appointment-info">
                  <div className="appointment-document">{appointment.document_type}</div>
                  <div className="appointment-date">
                    {new Date(appointment.appointment_date).toLocaleDateString()} at {appointment.appointment_time}
                  </div>
                </div>
                <div className={`status-badge ${appointment.status}`}>
                  {appointment.status}
                </div>
              </div>
            ))}
            {appointments.length === 0 && (
              <div className="empty-state">
                <Calendar size={48} />
                <h3>No appointments</h3>
                <p>Book an appointment to claim your documents</p>
                <button 
                  className="action-btn primary"
                  onClick={() => navigate("/student/appointments")}
                >
                  <Calendar size={16} />
                  Book Appointment
                </button>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card
        title={
          <div className="card-header-content">
            <div className="card-title">
              <Activity size={20} />
              <span>Quick Actions</span>
            </div>
          </div>
        }
        className="quick-actions-card"
      >
        <div className="quick-actions-grid">
          <button 
            className="quick-action-btn"
            onClick={() => navigate("/student/requests/new")}
          >
            <FileText size={24} />
            <span>New Document Request</span>
          </button>
          <button 
            className="quick-action-btn"
            onClick={() => navigate("/student/appointments")}
          >
            <Calendar size={24} />
            <span>Book Appointment</span>
          </button>
          <button 
            className="quick-action-btn"
            onClick={() => navigate("/student/requests")}
          >
            <BookOpen size={24} />
            <span>View All Requests</span>
          </button>
          <button 
            className="quick-action-btn"
            onClick={() => navigate("/student/profile")}
          >
            <User size={24} />
            <span>Profile Settings</span>
          </button>
        </div>
      </Card>
    </div>
  );
}
