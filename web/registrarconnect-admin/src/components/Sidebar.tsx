import { NavLink } from "react-router-dom";
import { LayoutDashboard, FileText, Calendar, BarChart2, Bell, Settings } from "lucide-react";
import "../styles/components/Sidebar.css";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="brand">
          <div className="brand-mark">RC</div>
          <div className="brand-text">
            <div className="brand-name">RegistrarConnect</div>
            <div className="brand-sub">Admin</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <LayoutDashboard size={18} /> <span>Dashboard</span>
        </NavLink>
        <NavLink to="/requests" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <FileText size={18} /> <span>Requests</span>
        </NavLink>
        <NavLink to="/appointments" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <Calendar size={18} /> <span>Appointments</span>
        </NavLink>
        <NavLink to="/reports" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <BarChart2 size={18} /> <span>Reports</span>
        </NavLink>
        <NavLink to="/notifications" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <Bell size={18} /> <span>Notifications</span>
        </NavLink>
        <NavLink to="/settings" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <Settings size={18} /> <span>Settings</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn">Logout</button>
      </div>
    </aside>
  );
}
