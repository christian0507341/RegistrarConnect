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
  User,
  FileText
} from "lucide-react";
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
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedAppointment(null);
  };

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
          {/* Removed header actions - appointments are view-only */}
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
                  <button 
                    onClick={() => handleViewDetails(appointment)}
                    className="action-btn secondary"
                  >
                    <Eye size={16} />
                    <span>View Details</span>
                  </button>
                  {/* Removed Reschedule and Cancel buttons - appointments are view-only */}
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
              {/* Removed Schedule New Appointment button - appointments are view-only */}
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
          {/* Removed Schedule Appointment - appointments are view-only */}
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

      {/* Enhanced Appointment Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <div className="modal-overlay" onClick={closeDetailsModal}>
          <div className="modal-content appointment-detail-modal" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header with Status */}
            <div className="modal-header-enhanced">
              <div className="header-top">
                <div className="header-title">
                  <Calendar size={28} />
                  <div>
                    <h2>Appointment Details</h2>
                    <p className="appointment-id">ID: #{selectedAppointment.id}</p>
                  </div>
                </div>
                <button onClick={closeDetailsModal} className="modal-close-enhanced">
                  <XCircle size={24} />
                </button>
              </div>
              <div className={`status-banner ${getStatusColor(selectedAppointment.status)}`}>
                {getStatusIcon(selectedAppointment.status)}
                <span className="status-text-large">
                  {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                </span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="modal-body-enhanced">
              {/* Main Info Section */}
              <div className="info-section primary-info">
                <h3 className="section-title">
                  <CalendarDays size={20} />
                  Schedule Information
                </h3>
                <div className="info-grid">
                  <div className="info-card">
                    <div className="info-icon calendar-icon">
                      <Calendar size={24} />
                    </div>
                    <div className="info-content">
                      <label>Date</label>
                      <p className="info-value">
                        {new Date(selectedAppointment.appointment_date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      <span className="info-meta">
                        {(() => {
                          const today = new Date();
                          const apptDate = new Date(selectedAppointment.appointment_date);
                          const diffTime = apptDate.getTime() - today.getTime();
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          
                          if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
                          if (diffDays === 0) return 'Today';
                          if (diffDays === 1) return 'Tomorrow';
                          return `In ${diffDays} days`;
                        })()}
                      </span>
                    </div>
                  </div>

                  <div className="info-card">
                    <div className="info-icon time-icon">
                      <Clock size={24} />
                    </div>
                    <div className="info-content">
                      <label>Time</label>
                      <p className="info-value">{selectedAppointment.appointment_time}</p>
                      <span className="info-meta">15-minute slot</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Purpose Section */}
              <div className="info-section">
                <h3 className="section-title">
                  <BookOpen size={20} />
                  Purpose
                </h3>
                <div className="purpose-card">
                  <p className="purpose-text">{selectedAppointment.purpose}</p>
                </div>
              </div>

              {/* Notes Section */}
              {selectedAppointment.notes && (
                <div className="info-section">
                  <h3 className="section-title">
                    <FileText size={20} />
                    Additional Notes
                  </h3>
                  <div className="notes-card">
                    <p className="notes-content">{selectedAppointment.notes}</p>
                  </div>
                </div>
              )}

              {/* Timeline Section */}
              <div className="info-section timeline-section">
                <h3 className="section-title">
                  <Clock size={20} />
                  Timeline
                </h3>
                <div className="timeline">
                  <div className="timeline-item">
                    <div className="timeline-marker created"></div>
                    <div className="timeline-content">
                      <label>Created</label>
                      <p>{new Date(selectedAppointment.created_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</p>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-marker updated"></div>
                    <div className="timeline-content">
                      <label>Last Updated</label>
                      <p>{new Date(selectedAppointment.updated_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Guide */}
              <div className="info-section status-guide">
                <h3 className="section-title">
                  <AlertTriangle size={20} />
                  Status Information
                </h3>
                <div className="status-info-grid">
                  {selectedAppointment.status === 'scheduled' && (
                    <div className="status-info-card blue">
                      <CheckCircle2 size={20} />
                      <div>
                        <strong>Scheduled</strong>
                        <p>Your appointment is confirmed. Please arrive 5 minutes early.</p>
                      </div>
                    </div>
                  )}
                  {selectedAppointment.status === 'completed' && (
                    <div className="status-info-card green">
                      <CheckCircle2 size={20} />
                      <div>
                        <strong>Completed</strong>
                        <p>This appointment has been successfully completed.</p>
                      </div>
                    </div>
                  )}
                  {selectedAppointment.status === 'cancelled' && (
                    <div className="status-info-card red">
                      <XCircle size={20} />
                      <div>
                        <strong>Cancelled</strong>
                        <p>This appointment was cancelled. You can schedule a new one.</p>
                      </div>
                    </div>
                  )}
                  {selectedAppointment.status === 'expired' && (
                    <div className="status-info-card orange">
                      <AlertTriangle size={20} />
                      <div>
                        <strong>Expired</strong>
                        <p>This appointment date has passed. Please schedule a new one if needed.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer-enhanced">
              <button onClick={closeDetailsModal} className="action-btn secondary">
                Close
              </button>
              <button 
                onClick={() => {
                  // Copy appointment details to clipboard
                  const details = `Appointment #${selectedAppointment.id}\nDate: ${new Date(selectedAppointment.appointment_date).toLocaleDateString()}\nTime: ${selectedAppointment.appointment_time}\nPurpose: ${selectedAppointment.purpose}\nStatus: ${selectedAppointment.status}`;
                  navigator.clipboard.writeText(details);
                  alert('Appointment details copied to clipboard!');
                }}
                className="action-btn primary"
              >
                <FileText size={16} />
                Copy Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}