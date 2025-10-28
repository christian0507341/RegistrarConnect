import { Search, Bell } from "lucide-react";
type Props = {
  title: string;
};

export default function Topbar({ title }: Props) {
  const adminName = localStorage.getItem("name") || "Admin";

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">{title}</h1>
      </div>

      <div className="topbar-right">
        {/* Search bar */}
        <div className="search">
          <Search size={16} />
          <input placeholder="Search requests, students..." />
        </div>

        {/* Notifications */}
        <button className="icon-btn">
          <Bell size={18} />
          <span className="badge">3</span>
        </button>

        {/* Profile */}
        <div className="profile">
          <div className="avatar">{adminName.charAt(0).toUpperCase()}</div>
          <div className="profile-name">{adminName}</div>
        </div>
      </div>
    </header>
  );
}
