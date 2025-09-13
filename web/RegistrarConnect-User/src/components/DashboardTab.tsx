import React from "react";

const DashboardTab: React.FC = () => {
  return (
    <div className="dashboard">
      <h2>Student Dashboard</h2>

      <section className="card">
        <h3>📂 Approved Files</h3>
        <ul>
          <li>Transcript of Records - Approved</li>
          <li>Good Moral Certificate - Approved</li>
        </ul>
      </section>

      <section className="card">
        <h3>📅 Deadlines & Payments</h3>
        <p>Tuition Payment Deadline: <strong>Sept 15, 2025</strong></p>
        <p>Exam Payment Deadline: <strong>Sept 25, 2025</strong></p>
      </section>

      <section className="card">
        <h3>📝 Recent Requests</h3>
        <ul>
          <li>Certificate of Enrollment - Pending</li>
          <li>Transcript Copy - Approved</li>
        </ul>
      </section>
    </div>
  );
};

export default DashboardTab;
