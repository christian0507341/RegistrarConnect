import React from "react";

export default function Topbar() {
  return (
    <div className="topbar">
      <input
        type="text"
        placeholder="Search requests, students..."
        className="search"
      />
      <div className="topbar-right">
        <span className="notification">🔔 3</span>
        <span className="user">👤 Student</span>
      </div>
    </div>
  );
}
