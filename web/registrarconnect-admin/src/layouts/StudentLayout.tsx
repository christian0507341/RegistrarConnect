import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { 
  Home, 
  FileText, 
  Calendar, 
  User, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import "../styles/layouts/StudentLayout.css";

type StudentLayoutProps = {
  onLogout: () => void;
};

export default function StudentLayout({ onLogout }: StudentLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/student/dashboard", icon: Home },
    { name: "My Requests", href: "/student/requests", icon: FileText },
    { name: "Appointments", href: "/student/appointments", icon: Calendar },
    { name: "Profile", href: "/student/profile", icon: User },
  ];

  const handleLogout = () => {
    onLogout();
    navigate("/student/login");
  };

  return (
    <div className="student-layout">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand">
            <div className="brand-icon">🎓</div>
            <div className="brand-text">
              <div className="brand-name">RegistrarConnect</div>
              <div className="brand-subtitle">Student Portal</div>
            </div>
          </div>
          <button 
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <button
                key={item.name}
                onClick={() => {
                  navigate(item.href);
                  setSidebarOpen(false);
                }}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button 
            className="logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="main-content">
        {/* Top bar */}
        <div className="topbar">
          <div className="topbar-left">
            <button 
              className="menu-btn"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h1 className="page-title">
              {navigation.find(item => item.href === location.pathname)?.name || "Dashboard"}
            </h1>
          </div>
          <div className="topbar-right">
            <div className="user-info">
              <div className="user-avatar">
                {localStorage.getItem("name")?.charAt(0).toUpperCase() || "S"}
              </div>
              <div className="user-details">
                <div className="user-name">{localStorage.getItem("name") || "Student"}</div>
                <div className="user-role">Student</div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
