import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { 
  Home, 
  FileText, 
  Calendar, 
  User, 
  LogOut,
  Menu,
  X,
  MessageCircle,
  Bell,
  Plus,
  Settings,
  HelpCircle
} from "lucide-react";
import { useState } from "react";
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
    { name: "New Request", href: "/student/requests/new", icon: Plus },
    { name: "Appointments", href: "/student/appointments", icon: Calendar },
    { name: "AI Assistant", href: "/student/chat", icon: MessageCircle },
    { name: "Notifications", href: "/student/notifications", icon: Bell },
    { name: "Profile", href: "/student/profile", icon: User },
  ];

  const handleLogout = () => {
    onLogout();
    navigate("/student/login");
  };

  const getPageTitle = () => {
    const currentPage = navigation.find(item => item.href === location.pathname);
    return currentPage?.name || "Dashboard";
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

      {/* Professional Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand">
            <div className="brand-icon">
              <div className="brand-logo">🎓</div>
            </div>
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
                {isActive && <div className="nav-indicator" />}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {localStorage.getItem("name")?.charAt(0).toUpperCase() || "S"}
            </div>
            <div className="user-details">
              <div className="user-name">{localStorage.getItem("name") || "Student"}</div>
              <div className="user-role">Student</div>
            </div>
          </div>
          <button 
            className="logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="main-content">
        {/* Professional Topbar */}
        <div className="topbar">
          <div className="topbar-left">
            <button 
              className="menu-btn"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="page-info">
              <h1 className="page-title">{getPageTitle()}</h1>
              <p className="page-subtitle">Manage your academic documents and requests</p>
            </div>
          </div>
          <div className="topbar-right">
            <div className="topbar-actions">
              <button 
                className="action-btn"
                onClick={() => navigate('/student/notifications')}
                title="Notifications"
              >
                <Bell size={18} />
                <span className="notification-badge">3</span>
              </button>
              <button 
                className="action-btn"
                onClick={() => navigate('/student/chat')}
                title="AI Assistant"
              >
                <MessageCircle size={18} />
              </button>
              <button 
                className="action-btn"
                onClick={() => navigate('/student/requests/new')}
                title="New Request"
              >
                <Plus size={18} />
              </button>
            </div>
            <div className="user-profile">
              <div className="user-avatar">
                {localStorage.getItem("name")?.charAt(0).toUpperCase() || "S"}
              </div>
              <div className="user-info">
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