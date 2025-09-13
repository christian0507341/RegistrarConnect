import React from "react";

const NotificationsTab: React.FC = () => {
  return (
    <div className="notifications">
      <h2>Notifications</h2>
      <ul>
        <li>📢 Your Transcript request has been approved!</li>
        <li>⚠️ Tuition Payment is due on Sept 15.</li>
        <li>📢 Certificate of Enrollment is ready for pickup.</li>
      </ul>
    </div>
  );
};

export default NotificationsTab;
