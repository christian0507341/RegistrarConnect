import React from "react";
import Calendar from "react-calendar";
import "./AppointmentsTab.css";

const AppointmentsTab: React.FC = () => {
  return (
    <div className="appointments">
      <h2>Appointments & Payments</h2>

      <div className="card">
        <h3>📅 Upcoming Deadlines</h3>
        <p>Exam Payment - Sept 20, 2025</p>
        <p>Library Fee - Sept 28, 2025</p>
      </div>

      <div className="card">
        <Calendar
          value={new Date()} // Default to today's date (Sept 6, 2025, 12:04 PM PST)
          onChange={() => {}}
          className="custom-calendar"
        />
      </div>
    </div>
  );
};

export default AppointmentsTab;