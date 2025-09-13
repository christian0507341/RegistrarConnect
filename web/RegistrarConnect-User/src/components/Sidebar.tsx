// src/components/Sidebar.tsx
import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: "🏠" },
    { path: "/transactions", label: "Transactions", icon: "💸" },
    { path: "/appointments", label: "Appointments", icon: "📅" },
    { path: "/chatbot", label: "Chatbot", icon: "💬" },
    { path: "/settings", label: "Settings", icon: "⚙️" },
    { path: "/profile", label: "Profile", icon: "👤" },
    { path: "/notifications", label: "Notifications", icon: "🔔" },
  ];

  return (
    <div className="sidebar w-64 flex-shrink-0 bg-gray-800 text-white flex flex-col justify-between h-screen fixed left-0 top-0 p-5">
      <div className="sidebar-header">
        <div className="logo-circle text-2xl font-bold">RC</div>
        <h2 className="text-xl font-semibold mt-2">RegistrarConnect</h2>
        <span className="text-sm text-gray-400">Student</span>
      </div>

      <ul className="menu space-y-2 mt-5 flex-grow">
        {menuItems.map((item) => (
          <li
            key={item.path}
            className={location.pathname === item.path ? "bg-gray-700" : ""}
          >
            <Link
              to={item.path}
              className="block p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <span className="icon mr-3">{item.icon}</span>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="sidebar-footer">
        <button className="logout-btn w-full p-3 bg-red-600 rounded-lg hover:bg-red-700 transition-colors text-white font-medium">
          Logout
        </button>
      </div>
    </div>
  );
}