import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../services/api";
import {
  Calendar,
  Clock,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  CalendarDays,
  BookOpen,
  Award,
  User
} from "lucide-react";
import "../styles/screens/StudentAppointmentsScreen.css";

interface Appointment {
  id: number;
  appointment_date: string;
  appointment_time: string;
  purpose: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'expired';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export default function StudentAppointmentsScreen() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    // Check if user is authenticated and is a student
    const token = localStorage.getItem("accessToken");
    const role = localStorage.getItem("role");
    
    if (!token || role !== 'student') {
      navigate('/login');
      return;
    }
    
    fetchAppointments();
  }, [navigate]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAppointments();
      setAppointments(response.data || []);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError("Failed to load appointments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return <Clock size={16} className="text-blue-500" />;
      case 'completed':
        return <CheckCircle2 size={16} className="text-green-500" />;
      case 'cancelled':
        return <XCircle size={16} className="text-red-500" />;
      case 'expired':
        return <AlertTriangle size={16} className="text-orange-500" />;
      default:
        return <Calendar size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'blue';
      case 'completed':
        return 'green';
      case 'cancelled':
        return 'red';
      case 'expired':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.status.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || appointment.status.toLowerCase() === filterStatus;
    const matchesDate = !selectedDate || appointment.appointment_date === selectedDate;
    return matchesSearch && matchesStatus && matchesDate;
  });

  const upcomingAppointments = appointments.filter(apt => 
    new Date(apt.appointment_date) >= new Date() && apt.status === 'scheduled'
  ).length;

  const completedAppointments = appointments.filter(apt => 
    apt.status === 'completed'
  ).length;

  const cancelledAppointments = appointments.filter(apt => 
    apt.status === 'cancelled'
  ).length;

  if (loading) {
    return (
      <div className="appointments-loading">
        <div className="loading-spinner"></div>
        <p>Loading your appointments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="appointments-error">
        <p>{error}</p>
        <button onClick={fetchAppointments} className="retry-button">Retry</button>
      </div>
    );
  }

  return (
    <div className="student-appointments-screen">
      {/* Professional Header */}
      <div className="appointments-header">
        <div className="header-content">
          <div className="header-info">
            <Calendar size={32} className="header-icon" />
            <div className="header-text">
              <h1>My Appointments</h1>
              <p>Schedule and manage your registrar appointments</p>
            </div>
          </div>
          <div className="header-actions">
            <button 
              onClick={() => navigate('/student/appointments/new')}
              className="action-btn primary"
            >
              <Plus size={20} />
              <span>New Appointment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-card blue">
            <Calendar size={24} />
            <div className="stat-content">
              <h3>{appointments.length}</h3>
              <p>Total Appointments</p>
            </div>
          </div>
          <div className="stat-card green">
            <CheckCircle2 size={24} />
            <div className="stat-content">
              <h3>{upcomingAppointments}</h3>
              <p>Upcoming</p>
            </div>
          </div>
          <div className="stat-card purple">
            <Award size={24} />
            <div className="stat-content">
              <h3>{completedAppointments}</h3>
              <p>Completed</p>
            </div>
          </div>
          <div className="stat-card orange">
            <AlertTriangle size={24} />
            <div className="stat-content">
              <h3>{cancelledAppointments}</h3>
              <p>Cancelled</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls-section">
        <div className="search-bar">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search appointments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-controls">
          <div className="filter-dropdown">
            <Filter size={20} className="filter-icon" />
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <div className="date-filter">
            <CalendarDays size={20} className="date-icon" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              placeholder="Filter by date"
            />
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="appointments-section">
        {filteredAppointments.length > 0 ? (
          <div className="appointments-grid">
            {filteredAppointments.map(appointment => (
              <div key={appointment.id} className="appointment-card">
                <div className="card-header">
                  <div className="appointment-date">
                    <Calendar size={20} />
                    <div className="date-info">
                      <span className="date">{new Date(appointment.appointment_date).toLocaleDateString()}</span>
                      <span className="time">{appointment.appointment_time}</span>
                    </div>
                  </div>
                  <div className={`status-badge ${getStatusColor(appointment.status)}`}>
                    {getStatusIcon(appointment.status)}
                    <span>{appointment.status}</span>
                  </div>
                </div>

                <div className="card-content">
                  <h3 className="appointment-purpose">{appointment.purpose}</h3>
                  
                  {appointment.notes && (
                    <div className="appointment-notes">
                      <BookOpen size={16} />
                      <span>{appointment.notes}</span>
                    </div>
                  )}

                  <div className="appointment-meta">
                    <div className="meta-item">
                      <Clock size={16} />
                      <span>Created: {new Date(appointment.created_at).toLocaleDateString()}</span>
                    </div>
                    {appointment.updated_at !== appointment.created_at && (
                      <div className="meta-item">
                        <Edit size={16} />
                        <span>Updated: {new Date(appointment.updated_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card-actions">
                  <button className="action-btn secondary">
                    <Eye size={16} />
                    <span>View Details</span>
                  </button>
                  {appointment.status === 'scheduled' && (
                    <button className="action-btn warning">
                      <Edit size={16} />
                      <span>Reschedule</span>
                    </button>
                  )}
                  {appointment.status === 'scheduled' && (
                    <button className="action-btn danger">
                      <Trash2 size={16} />
                      <span>Cancel</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Calendar size={64} className="empty-icon" />
            <h3>No Appointments Found</h3>
            <p>
              {searchTerm || filterStatus !== "all" || selectedDate
                ? "No appointments match your current filters."
                : "You haven't scheduled any appointments yet."
              }
            </p>
            <div className="empty-actions">
              <button 
                onClick={() => navigate('/student/appointments/new')}
                className="action-btn primary"
              >
                <Plus size={20} />
                <span>Schedule New Appointment</span>
              </button>
              {(searchTerm || filterStatus !== "all" || selectedDate) && (
                <button 
                  onClick={() => {
                    setSearchTerm("");
                    setFilterStatus("all");
                    setSelectedDate("");
                  }}
                  className="action-btn secondary"
                >
                  <Filter size={20} />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions-grid">
          <button 
            onClick={() => navigate('/student/appointments/new')}
            className="quick-action-card"
          >
            <Plus size={32} />
            <h3>Schedule Appointment</h3>
            <p>Book a new appointment with the registrar</p>
          </button>
          <button 
            onClick={() => navigate('/student/requests')}
            className="quick-action-card"
          >
            <BookOpen size={32} />
            <h3>Document Requests</h3>
            <p>Submit requests for academic documents</p>
          </button>
          <button 
            onClick={() => navigate('/student/chat')}
            className="quick-action-card"
          >
            <User size={32} />
            <h3>Get Help</h3>
            <p>Chat with our AI assistant for support</p>
          </button>
        </div>
      </div>
    </div>
  );
}