import { useState, useEffect } from 'react';
import { Calendar, Clock, User, MapPin, CheckCircle, XCircle, Search, Filter } from 'lucide-react';
import { apiService } from '../services/api';

interface Appointment {
  id: string;
  studentName: string;
  studentId: string;
  documentType: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  location: string;
  requestId: string;
}

export default function RegistrarAppointmentsScreen() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    fetchAppointments();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      fetchAppointments();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [searchTerm, statusFilter, dateFilter, appointments]);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      // Fetch appointments from backend
      const response = await apiService.registrar.getAppointments({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        date: dateFilter !== 'all' ? dateFilter : undefined
      });
      
      const fetchedAppointments = response.data.map((apt: any) => ({
        id: apt.id.toString(),
        studentName: apt.student_name || 'Unknown Student',
        studentId: apt.student_id || 'N/A', // Now returns actual student ID number from backend
        documentType: apt.document_type || 'N/A',
        scheduledDate: apt.date || apt.scheduled_date,
        scheduledTime: apt.start_time || apt.scheduled_time,
        status: apt.status,
        location: apt.location || 'Registrar Office',
        requestId: apt.request_id?.toString() || 'N/A'
      }));
      
      setAppointments(fetchedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      alert('Failed to load appointments. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = appointments;

    if (searchTerm) {
      filtered = filtered.filter(apt =>
        apt.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    if (dateFilter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.scheduledDate);
        aptDate.setHours(0, 0, 0, 0);

        if (dateFilter === 'today') {
          return aptDate.getTime() === today.getTime();
        } else if (dateFilter === 'upcoming') {
          return aptDate.getTime() >= today.getTime();
        } else if (dateFilter === 'past') {
          return aptDate.getTime() < today.getTime();
        }
        return true;
      });
    }

    setFilteredAppointments(filtered);
  };

  const handleMarkAsClaimed = async (appointmentId: string) => {
    try {
      console.log('Marking as claimed:', appointmentId, 'Type:', typeof appointmentId);
      // Use PATCH with status, matching API
      await apiService.registrar.markAsClaimed(parseInt(appointmentId));
      await fetchAppointments();
      alert('Appointment marked as claimed!');
    } catch (error: any) {
      console.error('Error updating appointment:', error);
      let errorMessage = 'Failed to update appointment status';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data) {
        errorMessage = JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMessage = error.message;
      }
      alert(`Error: ${errorMessage}\nA server (500) error likely means a backend bug, invalid status, or missing data.\nCheck backend logs for the full traceback.`);
    }
  };

  const handleMarkAsNoShow = async (appointmentId: string) => {
    try {
      console.log('Marking as no-show:', appointmentId, 'Type:', typeof appointmentId);
      // Use PATCH with status, matching API
      await apiService.registrar.markAsNoShow(parseInt(appointmentId));
      await fetchAppointments();
      alert('Appointment marked as no-show');
    } catch (error: any) {
      console.error('Error updating appointment:', error);
      let errorMessage = 'Failed to update appointment status';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data) {
        errorMessage = JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMessage = error.message;
      }
      alert(`Error: ${errorMessage}\nA server (500) error likely means a backend bug, invalid status, or missing data.\nCheck backend logs for the full traceback.`);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      scheduled: { label: 'Scheduled', className: 'status-scheduled' },
      claimed: { label: 'Claimed', className: 'status-claimed' },
      no_show: { label: 'No Show', className: 'status-no-show' },
      cancelled: { label: 'Cancelled', className: 'status-cancelled' }
    };

    const config = statusConfig[status] || statusConfig.scheduled;
    return <span className={`status-badge ${config.className}`}>{config.label}</span>;
  };

  return (
    <div className="registrar-appointments-screen">
      {/* Header */}
      <div className="appointments-header">
        <div className="header-content">
          <h1>Claiming Appointments</h1>
          <p>Manage student document claiming appointments</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon scheduled">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Today's Appointments</span>
            <span className="stat-value">
              {appointments.filter(apt => {
                const today = new Date().toISOString().split('T')[0];
                return apt.scheduledDate === today && apt.status === 'scheduled';
              }).length}
            </span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon claimed">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Claimed Today</span>
            <span className="stat-value">
              {appointments.filter(apt => {
                const today = new Date().toISOString().split('T')[0];
                return apt.scheduledDate === today && apt.status === 'claimed';
              }).length}
            </span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon upcoming">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Upcoming</span>
            <span className="stat-value">
              {appointments.filter(apt => {
                const aptDate = new Date(apt.scheduledDate);
                const today = new Date();
                return aptDate > today && apt.status === 'scheduled';
              }).length}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by student name, ID, or appointment ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-controls">
          <div className="filter-group">
            <Filter size={16} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="claimed">Claimed</option>
              <option value="no_show">No Show</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="filter-group">
            <Calendar size={16} />
            <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
            </select>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="appointments-content">
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading appointments...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="empty-state">
            <Calendar size={64} />
            <h3>No appointments found</h3>
            <p>Try adjusting your filters or search term</p>
          </div>
        ) : (
          <div className="appointments-grid">
            {filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="appointment-card">
                <div className="card-header">
                  <span className="appointment-id">{appointment.id}</span>
                  {getStatusBadge(appointment.status)}
                </div>

                <div className="card-body">
                  <div className="student-section">
                    <User size={20} />
                    <div className="student-details">
                      <h3>{appointment.studentName}</h3>
                      <span className="student-id">{appointment.studentId}</span>
                    </div>
                  </div>

                  <div className="appointment-details">
                    <div className="detail-row">
                      <Calendar size={18} />
                      <span>{new Date(appointment.scheduledDate).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-row">
                      <Clock size={18} />
                      <span>{appointment.scheduledTime}</span>
                    </div>
                    <div className="detail-row">
                      <MapPin size={18} />
                      <span>{appointment.location}</span>
                    </div>
                  </div>

                  <div className="document-info">
                    <label>Document</label>
                    <span>{appointment.documentType}</span>
                  </div>
                </div>

                {appointment.status === 'scheduled' && (
                  <div className="card-footer">
                    <button
                      className="btn-no-show"
                      onClick={() => handleMarkAsNoShow(appointment.id)}
                    >
                      <XCircle size={18} />
                      No Show
                    </button>
                    <button
                      className="btn-claimed"
                      onClick={() => handleMarkAsClaimed(appointment.id)}
                    >
                      <CheckCircle size={18} />
                      Mark as Claimed
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

