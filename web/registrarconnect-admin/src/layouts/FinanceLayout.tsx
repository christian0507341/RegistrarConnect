import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import {
  Home,
  DollarSign,
  CheckCircle,
  FileText,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Wallet
} from "lucide-react";
import { useState } from "react";

interface FinanceLayoutProps {
  onLogout: () => void;
}

export default function FinanceLayout({ onLogout }: FinanceLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/finance/dashboard", icon: Home },
    { name: "Payments", href: "/finance/payments", icon: DollarSign },
    { name: "Verification", href: "/finance/verification", icon: CheckCircle },
    { name: "Reports", href: "/finance/reports", icon: FileText },
    { name: "Notifications", href: "/finance/notifications", icon: Bell },
    { name: "Profile", href: "/finance/profile", icon: User },
  ];

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="finance-layout">
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`finance-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">
              <Wallet size={28} />
            </div>
            <div className="logo-text">
              <h1>Finance Portal</h1>
              <p>Payment Processing</p>
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

      <div className="finance-main">
        <header className="finance-topbar">
          <button 
            className="menu-toggle"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>

          <div className="topbar-title">
            <h2>{navigation.find(item => isActive(item.href))?.name || 'Finance Portal'}</h2>
          </div>

          <div className="topbar-actions">
            <button className="notification-btn">
              <Bell size={20} />
              <span className="badge">6</span>
            </button>
            <div className="user-menu">
              <div className="user-avatar">
                {localStorage.getItem("name")?.charAt(0).toUpperCase() || "F"}
              </div>
              <div className="user-info">
                <p className="user-name">{localStorage.getItem("name") || "Finance"}</p>
                <p className="user-role">Finance Office</p>
              </div>
            </div>
          </div>
        </header>

        <main className="finance-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

