import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, CheckCircle, XCircle, Search, Filter, RefreshCw } from 'lucide-react';
import { apiService } from '../services/api';

interface Appointment {
  id: number;
  student: string;
  studentId: string;
  date: string;
  time: string;
  purpose: string;
  status: string;
}

export default function FacultyAppointmentsScreen() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);
  
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await apiService.faculty.getAppointments();
      const fetchedAppointments = response.data.map((apt: any) => ({
        id: apt.id,
        student: apt.student_name || 'Unknown Student',
        studentId: apt.student_id || 'N/A',
        date: new Date(apt.schedule).toISOString().split('T')[0],
        time: new Date(apt.schedule).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        purpose: apt.purpose || apt.document_type || 'N/A',
        status: apt.status
      }));
      setAppointments(fetchedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleMarkComplete = async (id: number) => {
    try {
      await apiService.faculty.updateAppointmentStatus(id, { status: 'completed' });
      fetchAppointments();
    } catch (error) {
      console.error('Error marking appointment as complete:', error);
      alert('Failed to mark appointment as complete');
    }
  };
  
  const handleCancel = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    
    try {
      await apiService.faculty.updateAppointmentStatus(id, { status: 'cancelled' });
      fetchAppointments();
    } catch (error) {
      console.error('Error canceling appointment:', error);
      alert('Failed to cancel appointment');
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.studentId.includes(searchTerm);
    const matchesStatus = filterStatus === "all" || apt.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="faculty-appointments-screen">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="faculty-appointments-screen">
      <div className="screen-header">
        <h1>My Appointments</h1>
        <p>Manage your student appointments</p>
        <button onClick={fetchAppointments} className="action-btn secondary">
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="controls-section">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by student name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-dropdown">
          <Filter size={20} />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="appointments-grid">
        {filteredAppointments.length === 0 ? (
          <div className="empty-state">
            <Calendar size={48} />
            <h3>No appointments found</h3>
            <p>You don't have any appointments yet</p>
          </div>
        ) : (
          filteredAppointments.map(appointment => (
            <div key={appointment.id} className="appointment-card">
              <div className="card-header">
                <div className="student-info">
                  <User size={20} />
                  <div>
                    <h3>{appointment.student}</h3>
                    <p>{appointment.studentId}</p>
                  </div>
                </div>
                <div className={`status-badge ${appointment.status}`}>
                  {appointment.status}
                </div>
              </div>
              <div className="card-body">
                <div className="info-item">
                  <Calendar size={16} />
                  <span>{appointment.date}</span>
                </div>
                <div className="info-item">
                  <Clock size={16} />
                  <span>{appointment.time}</span>
                </div>
                <p className="purpose">{appointment.purpose}</p>
              </div>
              <div className="card-actions">
                {appointment.status === 'scheduled' && (
                  <>
                    <button className="action-btn primary" onClick={() => handleMarkComplete(appointment.id)}>
                      <CheckCircle size={16} />
                      Mark Complete
                    </button>
                    <button className="action-btn danger" onClick={() => handleCancel(appointment.id)}>
                      <XCircle size={16} />
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

