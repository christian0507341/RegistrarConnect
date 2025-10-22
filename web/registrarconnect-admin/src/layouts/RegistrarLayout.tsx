import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import {
  Home,
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  ClipboardCheck
} from "lucide-react";
import { useState } from "react";

interface RegistrarLayoutProps {
  onLogout: () => void;
}

export default function RegistrarLayout({ onLogout }: RegistrarLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/registrar/dashboard", icon: Home },
    { name: "Document Requests", href: "/registrar/requests", icon: FileText },
    { name: "Trigger & Approve", href: "/registrar/approve", icon: CheckCircle },
    { name: "Appointments", href: "/registrar/appointments", icon: Calendar },
    { name: "Schedule Manager", href: "/registrar/schedule", icon: Clock },
    { name: "Notifications", href: "/registrar/notifications", icon: Bell },
    { name: "Profile", href: "/registrar/profile", icon: User },
  ];

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="registrar-layout">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`registrar-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">
              <ClipboardCheck size={28} />
            </div>
            <div className="logo-text">
              <h1>Registrar Portal</h1>
              <p>Document Processing</p>
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
      <div className="registrar-main">
        {/* Top Bar */}
        <header className="registrar-topbar">
          <button 
            className="menu-toggle"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>

          <div className="topbar-title">
            <h2>{navigation.find(item => isActive(item.href))?.name || 'Registrar Portal'}</h2>
          </div>

          <div className="topbar-actions">
            <button className="notification-btn">
              <Bell size={20} />
              <span className="badge">8</span>
            </button>
            <div className="user-menu">
              <div className="user-avatar">
                {localStorage.getItem("name")?.charAt(0).toUpperCase() || "R"}
              </div>
              <div className="user-info">
                <p className="user-name">{localStorage.getItem("name") || "Registrar"}</p>
                <p className="user-role">Registrar Office</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="registrar-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

