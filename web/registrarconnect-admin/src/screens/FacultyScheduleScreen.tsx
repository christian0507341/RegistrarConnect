import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Plus, Save } from 'lucide-react';

export default function FacultyScheduleScreen() {
  const navigate = useNavigate();
  const [schedule] = useState([
    { day: "Monday", slots: ["09:00 AM - 11:00 AM", "02:00 PM - 04:00 PM"] },
    { day: "Tuesday", slots: ["10:00 AM - 12:00 PM", "03:00 PM - 05:00 PM"] },
    { day: "Wednesday", slots: ["09:00 AM - 11:00 AM", "02:00 PM - 04:00 PM"] },
    { day: "Thursday", slots: ["10:00 AM - 12:00 PM", "03:00 PM - 05:00 PM"] },
    { day: "Friday", slots: ["09:00 AM - 12:00 PM"] },
  ]);

  useEffect(() => {
    // Authentication is handled by the protected route in App.tsx
    // TODO: Fetch schedule data from backend
  }, []);

  return (
    <div className="faculty-schedule-screen">
      <div className="screen-header">
        <h1>My Schedule</h1>
        <p>Manage your availability</p>
        <button className="action-btn primary">
          <Plus size={16} />
          Add Time Slot
        </button>
      </div>

      <div className="schedule-grid">
        {schedule.map((day, index) => (
          <div key={index} className="schedule-card">
            <div className="day-header">
              <Calendar size={20} />
              <h3>{day.day}</h3>
            </div>
            <div className="time-slots">
              {day.slots.map((slot, i) => (
                <div key={i} className="time-slot">
                  <Clock size={16} />
                  <span>{slot}</span>
                  <button className="remove-btn">×</button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="schedule-actions">
        <button className="action-btn secondary">Reset</button>
        <button className="action-btn primary">
          <Save size={16} />
          Save Schedule
        </button>
      </div>
    </div>
  );
}

