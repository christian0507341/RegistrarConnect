// src/layouts/AdminLayout.tsx
import { useLocation, Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar.tsx";
import Topbar from "../components/Topbar.tsx";
type AdminLayoutProps = {
  onLogout: () => void;
};

export default function AdminLayout({ onLogout }: AdminLayoutProps) {
  const location = useLocation();

  const pageTitles: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/appointments": "Appointments",
    "/requests": "Requests",
    "/reports": "Reports",
    "/settings": "Settings",
    "/notifications": "Notifications",
  };

  const title = pageTitles[location.pathname] || "RegistrarConnect";

  return (
    <div className="admin-layout">
      {/* Sidebar with Logout */}
      <Sidebar onLogout={onLogout} />

      {/* Main Area */}
      <div className="main-area">
        {/* ✅ Removed logout from Topbar */}
        <Topbar title={title} />

        <div className="content-area">
          {/* Nested Routes will render here */}
          <Outlet />
        </div>
      </div>
    </div>
  );
}
