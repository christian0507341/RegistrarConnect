import { useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import Sidebar from "../components/Sidebar.tsx";
import Topbar from "../components/Topbar.tsx";
import "../styles/layouts/AdminLayout.css";

type Props = {
  children: ReactNode;
};

export default function AdminLayout({ children }: Props) {
  const location = useLocation();

  // Map routes to titles
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
      <Sidebar />
      <div className="main-area">
        <Topbar title={title} />
        <div className="content-area">{children}</div>
      </div>
    </div>
  );
}
