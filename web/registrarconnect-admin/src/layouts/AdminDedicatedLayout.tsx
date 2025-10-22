import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  Settings,
  Bell,
  BarChart3,
  Shield,
  LogOut,
  Menu,
  X,
  Database,
  Activity
} from "lucide-react";
import { useState } from "react";

interface AdminDedicatedLayoutProps {
  onLogout: () => void;
}

export default function AdminDedicatedLayout({ onLogout }: AdminDedicatedLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "User Management", href: "/admin/users", icon: Users },
    { name: "Document Requests", href: "/admin/requests", icon: FileText },
    { name: "Appointments", href: "/admin/appointments", icon: Calendar },
    { name: "Reports & Analytics", href: "/admin/reports", icon: BarChart3 },
    { name: "System Settings", href: "/admin/settings", icon: Settings },
    { name: "Activity Logs", href: "/admin/logs", icon: Activity },
    { name: "Database", href: "/admin/database", icon: Database },
    { name: "Notifications", href: "/admin/notifications", icon: Bell },
  ];

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="admin-dedicated-layout">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-dedicated-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">
              <Shield size={28} />
            </div>
            <div className="logo-text">
              <h1>Admin Portal</h1>
              <p>System Management</p>
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
          <div className="admin-badge">
            <Shield size={16} />
            <span>Super Admin</span>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-dedicated-main">
        {/* Top Bar */}
        <header className="admin-dedicated-topbar">
          <button 
            className="menu-toggle"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>

          <div className="topbar-title">
            <h2>{navigation.find(item => isActive(item.href))?.name || 'Admin Portal'}</h2>
          </div>

          <div className="topbar-actions">
            <button className="notification-btn">
              <Bell size={20} />
              <span className="badge">5</span>
            </button>
            <div className="user-menu">
              <div className="user-avatar">
                {localStorage.getItem("name")?.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="user-info">
                <p className="user-name">{localStorage.getItem("name") || "Administrator"}</p>
                <p className="user-role">System Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-dedicated-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

