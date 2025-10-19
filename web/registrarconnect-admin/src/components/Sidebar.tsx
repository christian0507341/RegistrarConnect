import { NavLink } from "react-router-dom";
import { useState } from "react";
import { 
  LayoutDashboard, FileText, Calendar, 
  BarChart2, Bell, Settings, ChevronDown, ChevronRight
} from "lucide-react";
import "../styles/components/Sidebar.css";

type Props = {
  onLogout: () => void;
};

export default function Sidebar({ onLogout }: Props) {
  const [appointmentsExpanded, setAppointmentsExpanded] = useState(false);

  return (
    <aside className="sidebar">
      {/* Brand / Logo */}
      <div className="sidebar-top">
        <div className="brand">
          <div className="brand-mark">RC</div>
          <div className="brand-text">
            <div className="brand-name">RegistrarConnect</div>
            <div className="brand-sub">Admin</div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
          <LayoutDashboard size={18} /> <span>Dashboard</span>
        </NavLink>
        <NavLink to="/requests" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
          <FileText size={18} /> <span>Requests</span>
        </NavLink>
        <div className="nav-group">
          <button 
            className="nav-item nav-toggle"
            onClick={() => setAppointmentsExpanded(!appointmentsExpanded)}
          >
            <Calendar size={18} /> 
            <span>Appointments</span>
            {appointmentsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          {appointmentsExpanded && (
            <div className="nav-submenu">
              <NavLink to="/appointments" className={({ isActive }) => (isActive ? "nav-subitem active" : "nav-subitem")}>
                <span>View Appointments</span>
              </NavLink>
              <NavLink to="/appointments/settings" className={({ isActive }) => (isActive ? "nav-subitem active" : "nav-subitem")}>
                <span>Settings</span>
              </NavLink>
            </div>
          )}
        </div>
        <NavLink to="/reports" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
          <BarChart2 size={18} /> <span>Reports</span>
        </NavLink>
        <NavLink to="/notifications" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
          <Bell size={18} /> <span>Notifications</span>
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
          <Settings size={18} /> <span>Settings</span>
        </NavLink>
      </nav>

      {/* Sidebar Footer with Logout */}
      <div className="sidebar-footer">
        <button onClick={onLogout} className="logout-btn">
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
