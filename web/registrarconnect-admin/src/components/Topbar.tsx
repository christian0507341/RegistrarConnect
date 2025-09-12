import { Search, Bell } from "lucide-react";
import "../styles/components/Topbar.css";

type Props = {
  title: string;
};

export default function Topbar({ title }: Props) {
  return (
    <header className="topbar">
      <div className="topbar">
        <h1 className="topbar-title">{title}</h1>
      </div>

      <div className="topbar-right">
        <div className="search">
          <Search size={16} />
          <input placeholder="Search requests, students..." />
        </div>

        <button className="icon-btn">
          <Bell size={18} />
          <span className="badge">3</span>
        </button>

        <div className="profile">
          <div className="avatar">A</div>
          <div className="profile-name">Admin</div>
        </div>
      </div>
    </header>
  );
}
