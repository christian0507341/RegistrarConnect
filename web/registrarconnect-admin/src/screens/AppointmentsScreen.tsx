import { useState, useEffect } from "react";
import { apiService } from "../services/api";
import { notificationService } from "../services/notificationService";
import Card from "../components/Card";
import "../styles/screens/AppointmentsScreen.css";
import { Clock, User, FileCheck, RefreshCw, AlertCircle, CheckCircle, Calendar as CalendarIcon } from "lucide-react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type Appointment = {
  id: number;
  student_name: string;
  faculty_name: string;
  document_type: string;
  purpose: string;
  schedule: string;
  status: "pending" | "scheduled" | "missed" | "cancelled" | "claimed" | "no_show" | "rescheduled";
  created_at: string;
  actions?: any[];
};

type ForecastDay = {
  date: string;
  expectedRequests: number;
  level: "Low" | "Moderate" | "High";
};

function atMidnight(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AppointmentsScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [requestForecast] = useState<ForecastDay[]>([
    { date: "2025-09-11", expectedRequests: 12, level: "High" },
    { date: "2025-09-13", expectedRequests: 8, level: "Moderate" },
    { date: "2025-09-15", expectedRequests: 3, level: "Low" },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [blockStart, setBlockStart] = useState("12:00");
  const [blockEnd, setBlockEnd] = useState("13:30");

  // Fetch appointments from API
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getAppointments();
      setAppointments(response.data || []);
    } catch (err: any) {
      console.error("Error fetching appointments:", err);
      setError(err.response?.data?.error || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleRefresh = () => {
    fetchAppointments();
    setToast("Appointments refreshed");
    setTimeout(() => setToast(null), 3000);
  };

  const handleMarkAsClaimed = async (appointmentId: number) => {
    try {
      await apiService.updateAppointmentStatus(appointmentId, { status: 'claimed' });
      setAppointments(prev => 
        prev.map(appointment => 
          appointment.id === appointmentId 
            ? { ...appointment, status: 'claimed' as any }
            : appointment
        )
      );
      setToast("Appointment marked as claimed");
      setTimeout(() => setToast(null), 3000);
      
      // Get appointment data for notifications
      const appointment = appointments.find(apt => apt.id === appointmentId);
      const studentName = appointment?.student_name || 'Unknown Student';
      
      // Trigger notification for document request update
      notificationService.add({
        title: 'Document Claimed',
        message: `Document has been claimed for ${studentName}`,
        type: 'success'
      });
      
      // Show browser notification
      notificationService.showBrowserNotification(
        'Document Claimed',
        `Document has been claimed for ${studentName}`
      );
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('appointmentClaimed', {
        detail: { appointmentId: appointmentId, studentName: studentName }
      }));
    } catch (err: any) {
      console.error("Error marking appointment as claimed:", err);
      setToast("Failed to mark appointment as claimed");
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleMarkAsNoShow = async (appointmentId: number) => {
    try {
      const response = await apiService.updateAppointmentStatus(appointmentId, { status: 'no_show' });
      
      // Update local state
      setAppointments(prev => 
        prev.map(appointment => 
          appointment.id === appointmentId 
            ? { ...appointment, status: 'no_show' as any }
            : appointment
        )
      );
      
      // Handle rescheduling response
      if (response.data?.reschedule_info) {
        const rescheduleInfo = response.data.reschedule_info;
        
        if (rescheduleInfo.rescheduled) {
          let message = "Appointment marked as no show and automatically rescheduled";
          
          if (rescheduleInfo.reschedule_type === 'same_day') {
            message += " for the same day";
          } else if (rescheduleInfo.reschedule_type === 'next_day') {
            message += " for the next available day";
          }
          
          setToast(message);
          
          // Refresh appointments to show the new rescheduled appointment
          setTimeout(() => {
            fetchAppointments();
          }, 2000);
        } else {
          setToast("Appointment marked as no show - manual rescheduling required");
        }
      } else {
        setToast("Appointment marked as no show");
      }
      
      setTimeout(() => setToast(null), 5000);
    } catch (err: any) {
      console.error("Error marking appointment as no show:", err);
      setToast("Failed to mark appointment as no show");
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleReschedule = async (appointmentId: number) => {
    try {
      await apiService.updateAppointmentStatus(appointmentId, { status: 'rescheduled' });
      setAppointments(prev => 
        prev.map(appointment => 
          appointment.id === appointmentId 
            ? { ...appointment, status: 'rescheduled' as any }
            : appointment
        )
      );
      setToast("Appointment marked as rescheduled");
      setTimeout(() => setToast(null), 3000);
    } catch (err: any) {
      console.error("Error rescheduling appointment:", err);
      setToast("Failed to reschedule appointment");
      setTimeout(() => setToast(null), 3000);
    }
  };

  function getClaimInfo(appointment: Appointment) {
    if (appointment.status !== "scheduled") return null;

    const scheduleDate = new Date(appointment.schedule);
    const today = atMidnight(new Date());
    const appointmentDay = atMidnight(scheduleDate);

    if (today > appointmentDay) {
      return { kind: "expired", text: "Appointment date has passed" };
    }
    if (today.getTime() === appointmentDay.getTime()) {
      return { kind: "today", text: "Appointment is today" };
    }
    return { kind: "upcoming", text: `Scheduled for ${formatDate(scheduleDate)}` };
  }

  function hasAppointmentsOn(date: Date) {
    const ds = date.toISOString().split("T")[0];
    return appointments.some((a) => {
      const appointmentDate = new Date(a.schedule).toISOString().split("T")[0];
      return appointmentDate === ds;
    });
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case "scheduled":
        return <CheckCircle size={16} className="text-green-500" />;
      case "pending":
        return <Clock size={16} className="text-yellow-500" />;
      case "missed":
        return <AlertCircle size={16} className="text-red-500" />;
      case "cancelled":
        return <AlertCircle size={16} className="text-gray-500" />;
      case "claimed":
        return <CheckCircle size={16} className="text-blue-500" />;
      case "no_show":
        return <AlertCircle size={16} className="text-orange-500" />;
      case "rescheduled":
        return <Clock size={16} className="text-purple-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "scheduled":
        return "text-green-600 bg-green-50 border-green-200";
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "missed":
        return "text-red-600 bg-red-50 border-red-200";
      case "cancelled":
        return "text-gray-600 bg-gray-50 border-gray-200";
      case "claimed":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "no_show":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "rescheduled":
        return "text-purple-600 bg-purple-50 border-purple-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  }

  function getForecastFor(date: Date) {
    const ds = date.toISOString().split("T")[0];
    return requestForecast.find((f) => f.date === ds);
  }

  const filtered = appointments.filter((a) => {
    const appointmentDate = new Date(a.schedule).toISOString().split("T")[0];
    return appointmentDate === selectedDate.toISOString().split("T")[0];
  });

  function handleBlockTime() {
    const dateStr = selectedDate.toISOString().split("T")[0];

    // Check for overlapping blocks
    const hasConflict = appointments.some(
      (a) => {
        const appointmentDate = new Date(a.schedule).toISOString().split("T")[0];
        return appointmentDate === dateStr && a.status === "cancelled";
      }
    );

    if (hasConflict) {
      alert("A block already exists for this time.");
      return;
    }

    const reason = prompt("Reason for blocking this time? (optional)");

    const newBlock: Appointment = {
      id: Date.now(), // Temporary ID
      student_name: "Registrar Office",
      faculty_name: "System",
      document_type: "Blocked",
      purpose: reason || "Unavailable",
      schedule: `${dateStr}T${blockStart}:00`,
      status: "cancelled",
      created_at: new Date().toISOString(),
    };

    setAppointments((prev) => [...prev, newBlock]);
    setShowModal(false);
  }


  if (loading) {
    return (
      <div className="appointments-screen">
        <div className="loading-container">
          <RefreshCw className="loading-spinner" />
          <p>Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="appointments-screen">
        <div className="error-container">
          <AlertCircle size={32} />
          <h3>Error Loading Appointments</h3>
          <p>{error}</p>
          <button className="btn-primary" onClick={handleRefresh}>
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="appointments-screen">
      {toast && (
        <div className="toast">
          {toast}
        </div>
      )}

      <div className="appointments-header">
        <div className="header-content">
          <div className="header-icon">
            <CalendarIcon size={24} />
          </div>
          <div>
            <h1>Appointments</h1>
            <p>View and manage scheduled appointments</p>
          </div>
        </div>
        <button className="btn-primary" onClick={handleRefresh}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <Card title="Request Forecast">
        {requestForecast.length === 0 ? (
          <p className="small-muted">No forecast available.</p>
        ) : (
          <ul className="forecast-list">
            {requestForecast.map((f, i) => (
              <li key={i} className={`forecast-${f.level.toLowerCase()}`}>
                <strong>{new Date(f.date).toDateString()}</strong>
                <span className={`forecast-badge ${f.level.toLowerCase()}`}>
                  {f.level}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="grid-two">
        <Card title="Calendar">
          <Calendar
            value={selectedDate}
            onChange={(value) => {
              if (value instanceof Date) setSelectedDate(value);
            }}
            tileContent={({ date, view }: { date: Date; view: string }) => {
              if (view === "month") {
                if (hasAppointmentsOn(date)) return <div className="dot" />;
                const forecast = getForecastFor(date);
                if (forecast)
                  return (
                    <div
                      className={`forecast-dot ${forecast.level.toLowerCase()}`}
                    />
                  );
              }
              return null;
            }}
          />
          <button
            className="btn-primary block-btn"
            onClick={() => setShowModal(true)}
          >
            + Block Time
          </button>
        </Card>

        <Card title={`Appointments on ${selectedDate.toDateString()}`}>
          {filtered.length === 0 ? (
            <div className="empty-state">
              <CalendarIcon size={48} />
              <h3>No appointments scheduled</h3>
              <p>No appointments are scheduled for this date.</p>
            </div>
          ) : (
            <div className="appointments-list-container">
              <ul className="upcoming-list">
                {filtered.map((appointment) => {
                  const scheduleDate = new Date(appointment.schedule);
                  const timeString = scheduleDate.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  });

                  return (
                    <li key={appointment.id} className={`appointment-item status-${appointment.status}`}>
                      <div className="appointment-header">
                        <div className="appointment-main">
                          {getStatusIcon(appointment.status)}
                          <div className="appointment-info">
                            <strong>{appointment.student_name}</strong>
                            <span className="appointment-time">{timeString}</span>
                          </div>
                        </div>
                        <span className={`status-badge ${getStatusColor(appointment.status)}`}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </div>

                      <div className="appointment-details">
                        <div className="detail-item">
                          <User size={14} />
                          <span><strong>Student:</strong> {appointment.student_name}</span>
                        </div>
                        <div className="detail-item">
                          <FileCheck size={14} />
                          <span><strong>Document:</strong> {appointment.document_type}</span>
                        </div>
                        <div className="detail-item">
                          <Clock size={14} />
                          <span><strong>Purpose:</strong> {appointment.purpose}</span>
                        </div>
                        <div className="detail-item">
                          <CalendarIcon size={14} />
                          <span><strong>Scheduled:</strong> {formatDate(scheduleDate)} at {timeString}</span>
                        </div>
                      </div>

                      {getClaimInfo(appointment) && (
                        <div className="claim-actions">
                          <div className={`claim-badge claim-${getClaimInfo(appointment)?.kind}`}>
                            <FileCheck size={14} /> {getClaimInfo(appointment)?.text}
                          </div>
                        </div>
                      )}

                      {appointment.status === "scheduled" && (
                        <div className="appointment-actions">
                          <button
                            className="btn-claim"
                            onClick={() => handleMarkAsClaimed(appointment.id)}
                          >
                            <CheckCircle size={16} />
                            Mark as Claimed
                          </button>
                          <button
                            className="btn-no-show"
                            onClick={() => handleMarkAsNoShow(appointment.id)}
                          >
                            <AlertCircle size={16} />
                            Mark as No Show
                          </button>
                          <button
                            className="btn-reschedule"
                            onClick={() => handleReschedule(appointment.id)}
                          >
                            <Clock size={16} />
                            Reschedule
                          </button>
                        </div>
                      )}

                      {appointment.status === "claimed" && (
                        <div className="claimed-indicator">
                          <div className="claimed-badge">
                            <CheckCircle size={16} />
                            Document Claimed
                          </div>
                        </div>
                      )}

                      {appointment.status === "no_show" && (
                        <div className="no-show-indicator">
                          <div className="no-show-badge">
                            <AlertCircle size={16} />
                            No Show - Student Did Not Come
                          </div>
                        </div>
                      )}

                      {appointment.status === "rescheduled" && (
                        <div className="rescheduled-indicator">
                          <div className="rescheduled-badge">
                            <Clock size={16} />
                            Appointment Rescheduled
                          </div>
                          <div className="reschedule-note">
                            This appointment has been moved to a different time
                          </div>
                        </div>
                      )}

                      {appointment.status === "no_show" && (
                        <div className="no-show-indicator">
                          <div className="no-show-badge">
                            <AlertCircle size={16} />
                            No Show - Student Did Not Come
                          </div>
                          <div className="no-show-note">
                            Student did not show up for their appointment
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </Card>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Block Time</h3>
            <label>
              Start Time:
              <input
                type="time"
                value={blockStart}
                onChange={(e) => setBlockStart(e.target.value)}
              />
            </label>
            <label>
              End Time:
              <input
                type="time"
                value={blockEnd}
                onChange={(e) => setBlockEnd(e.target.value)}
              />
            </label>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleBlockTime}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
