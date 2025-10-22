import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Filter, Plus, Edit, Trash2, Shield, UserCheck, UserX } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'faculty' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  joinDate: string;
  lastActive: string;
}

export default function AdminUsersManagement() {
  const navigate = useNavigate();
  const [users] = useState<User[]>([
    { id: '1', name: 'John Doe', email: 'john@student.com', role: 'student', status: 'active', joinDate: '2024-01-15', lastActive: '2 mins ago' },
    { id: '2', name: 'Jane Smith', email: 'jane@faculty.com', role: 'faculty', status: 'active', joinDate: '2023-08-20', lastActive: '1 hour ago' },
    { id: '3', name: 'Mike Johnson', email: 'mike@admin.com', role: 'admin', status: 'active', joinDate: '2022-05-10', lastActive: 'Just now' },
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    // Authentication is handled by the protected route in App.tsx
    // TODO: Fetch users data from backend
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="admin-users-screen">
      <div className="screen-header">
        <div className="header-content">
          <h1>User Management</h1>
          <p>Manage all system users and their permissions</p>
        </div>
        <button className="action-btn primary">
          <Plus size={16} />
          Add New User
        </button>
      </div>

      {/* Stats Overview */}
      <div className="user-stats">
        <div className="stat-box purple">
          <Users size={24} />
          <div>
            <p className="stat-value">{users.length}</p>
            <p className="stat-label">Total Users</p>
          </div>
        </div>
        <div className="stat-box blue">
          <UserCheck size={24} />
          <div>
            <p className="stat-value">{users.filter(u => u.status === 'active').length}</p>
            <p className="stat-label">Active</p>
          </div>
        </div>
        <div className="stat-box orange">
          <UserX size={24} />
          <div>
            <p className="stat-value">{users.filter(u => u.status === 'inactive').length}</p>
            <p className="stat-label">Inactive</p>
          </div>
        </div>
        <div className="stat-box green">
          <Shield size={24} />
          <div>
            <p className="stat-value">{users.filter(u => u.role === 'admin').length}</p>
            <p className="stat-label">Admins</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="controls-section">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <Filter size={20} />
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="faculty">Faculty</option>
            <option value="admin">Admins</option>
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Join Date</th>
              <th>Last Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar">{user.name.charAt(0)}</div>
                    <div>
                      <p className="user-name">{user.name}</p>
                      <p className="user-email">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`role-badge ${user.role}`}>{user.role}</span>
                </td>
                <td>
                  <span className={`status-badge ${user.status}`}>{user.status}</span>
                </td>
                <td>{user.joinDate}</td>
                <td>{user.lastActive}</td>
                <td>
                  <div className="action-buttons">
                    <button className="icon-btn">
                      <Edit size={16} />
                    </button>
                    <button className="icon-btn danger">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

