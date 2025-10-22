import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, CheckCircle, XCircle, Search, Filter } from 'lucide-react';

export default function FacultyAppointmentsScreen() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([
    { id: 1, student: "John Doe", studentId: "2020-0001", date: "2024-01-15", time: "09:00 AM", purpose: "Transcript Request", status: "scheduled" },
    { id: 2, student: "Jane Smith", studentId: "2021-0002", date: "2024-01-15", time: "10:30 AM", purpose: "Grade Inquiry", status: "completed" },
    { id: 3, student: "Mike Johnson", studentId: "2022-0003", date: "2024-01-16", time: "02:00 PM", purpose: "Document Verification", status: "scheduled" },
  ]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Authentication is handled by the protected route in App.tsx
    // TODO: Fetch appointments data from backend
  }, []);

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.studentId.includes(searchTerm);
    const matchesStatus = filterStatus === "all" || apt.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="faculty-appointments-screen">
      <div className="screen-header">
        <h1>My Appointments</h1>
        <p>Manage your student appointments</p>
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
        {filteredAppointments.map(appointment => (
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
                  <button className="action-btn primary">
                    <CheckCircle size={16} />
                    Mark Complete
                  </button>
                  <button className="action-btn danger">
                    <XCircle size={16} />
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

