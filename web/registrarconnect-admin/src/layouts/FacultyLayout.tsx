import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import {
  Home,
  Calendar,
  Users,
  FileText,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Clock,
  CheckCircle
} from "lucide-react";
import { useState } from "react";

interface FacultyLayoutProps {
  onLogout: () => void;
}

export default function FacultyLayout({ onLogout }: FacultyLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/faculty/dashboard", icon: Home },
    { name: "My Appointments", href: "/faculty/appointments", icon: Calendar },
    { name: "Students", href: "/faculty/students", icon: Users },
    { name: "Schedule", href: "/faculty/schedule", icon: Clock },
    { name: "Reports", href: "/faculty/reports", icon: FileText },
    { name: "Notifications", href: "/faculty/notifications", icon: Bell },
    { name: "Profile", href: "/faculty/profile", icon: User },
  ];

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="faculty-layout">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`faculty-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">F</div>
            <div className="logo-text">
              <h1>Faculty Portal</h1>
              <p>RegistrarConnect</p>
            </div>
          </div>
          <button 
            className="close-sidebar"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="faculty-main">
        {/* Top Bar */}
        <header className="faculty-topbar">
          <button 
            className="menu-toggle"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>

          <div className="topbar-title">
            <h2>{navigation.find(item => isActive(item.href))?.name || 'Faculty Portal'}</h2>
          </div>

          <div className="topbar-actions">
            <button className="notification-btn">
              <Bell size={20} />
              <span className="badge">3</span>
            </button>
            <div className="user-menu">
              <div className="user-avatar">
                {localStorage.getItem("name")?.charAt(0).toUpperCase() || "F"}
              </div>
              <div className="user-info">
                <p className="user-name">{localStorage.getItem("name") || "Faculty"}</p>
                <p className="user-role">Faculty Member</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="faculty-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

