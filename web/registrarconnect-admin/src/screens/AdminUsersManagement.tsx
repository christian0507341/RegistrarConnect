import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Filter, Plus, Edit, Trash2, Shield, UserCheck, UserX, X, AlertCircle } from 'lucide-react';
import { apiService } from '../services/api';

interface User {
  id: number;
  full_name: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'student' | 'faculty' | 'registrar' | 'finance' | 'admin';
  is_active: boolean;
  date_joined: string;
  last_active: string;
}

export default function AdminUsersManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [filterRole, filterStatus, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filterRole !== 'all') params.role = filterRole;
      if (filterStatus !== 'all') params.status = filterStatus;
      if (searchTerm) params.search = searchTerm;
      
      const response = await apiService.admin.getUsers(params);
      setUsers(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;
    
    try {
      await apiService.admin.deleteUser(userId);
      await fetchUsers();
      alert('User deactivated successfully');
    } catch (err: any) {
      console.error('Error deleting user:', err);
      alert('Failed to deactivate user');
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  return (
    <div className="admin-users-screen">
      <div className="screen-header">
        <div className="header-content">
          <h1>User Management</h1>
          <p>Manage all system users and their permissions</p>
        </div>
        <button className="action-btn primary" onClick={() => setShowAddModal(true)}>
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
            <p className="stat-value">{users.filter(u => u.is_active).length}</p>
            <p className="stat-label">Active</p>
          </div>
        </div>
        <div className="stat-box orange">
          <UserX size={24} />
          <div>
            <p className="stat-value">{users.filter(u => !u.is_active).length}</p>
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
            <option value="registrar">Registrar</option>
            <option value="finance">Finance</option>
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
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading users...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <AlertCircle size={48} />
            <h3>{error}</h3>
            <button onClick={fetchUsers} className="retry-btn">Retry</button>
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <Users size={48} />
            <h3>No users found</h3>
            <p>Try adjusting your filters</p>
          </div>
        ) : (
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
              {users.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar">{user.full_name.charAt(0) || user.email.charAt(0)}</div>
                      <div>
                        <p className="user-name">{user.full_name || user.email}</p>
                        <p className="user-email">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`role-badge ${user.role}`}>{user.role}</span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                      {user.is_active ? 'active' : 'inactive'}
                    </span>
                  </td>
                  <td>{new Date(user.date_joined).toLocaleDateString()}</td>
                  <td>{user.last_active}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="icon-btn" onClick={() => handleEditUser(user)} title="Edit user">
                        <Edit size={16} />
                      </button>
                      <button 
                        className="icon-btn danger" 
                        onClick={() => handleDeleteUser(user.id)}
                        title="Deactivate user"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <AddUserModal 
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchUsers();
          }}
        />
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <EditUserModal 
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedUser(null);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
}

// Add User Modal Component
function AddUserModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'student'
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await apiService.admin.createUser(formData);
      alert('User created successfully');
      onSuccess();
    } catch (err: any) {
      console.error('Error creating user:', err);
      alert(err.response?.data?.error || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New User</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              required
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              required
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="registrar">Registrar</option>
              <option value="finance">Finance</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit User Modal Component
function EditUserModal({ user, onClose, onSuccess }: { user: User; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    role: user.role,
    is_active: user.is_active,
    password: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await apiService.admin.updateUser(user.id, formData);
      alert('User updated successfully');
      onSuccess();
    } catch (err: any) {
      console.error('Error updating user:', err);
      alert(err.response?.data?.error || 'Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit User</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              required
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              required
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="registrar">Registrar</option>
              <option value="finance">Finance</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              {' '}Active
            </label>
          </div>
          <div className="form-group">
            <label>New Password (leave empty to keep current)</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Updating...' : 'Update User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

