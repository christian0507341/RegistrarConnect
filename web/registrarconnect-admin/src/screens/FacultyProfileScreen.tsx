import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Edit3,
  Save,
  X,
  Lock,
  Eye,
  EyeOff,
  Shield
} from 'lucide-react';

interface Profile {
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  office: string;
  joinDate: string;
  specialization: string;
}

export default function FacultyProfileScreen() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    name: localStorage.getItem("name") || "Faculty Member",
    email: localStorage.getItem("email") || "faculty@phinmaed.com",
    phone: "+63 912 345 6789",
    department: "Computer Science",
    position: "Associate Professor",
    office: "Room 301, Building A",
    joinDate: "2020-01-15",
    specialization: "Software Engineering"
  });
  const [editForm, setEditForm] = useState<Profile>(profile);
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    // Authentication is handled by the protected route in App.tsx
    // TODO: Fetch profile data from backend
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm(profile);
  };

  const handleSave = () => {
    setProfile(editForm);
    setIsEditing(false);
    // TODO: Save to backend
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm(profile);
  };

  const handlePasswordChange = () => {
    if (passwordForm.new !== passwordForm.confirm) {
      alert('Passwords do not match!');
      return;
    }
    // TODO: Call backend API
    alert('Password changed successfully!');
    setPasswordForm({ current: '', new: '', confirm: '' });
    setShowPasswordForm(false);
  };

  return (
    <div className="faculty-profile-screen">
      <div className="profile-header">
        <div className="profile-avatar-large">
          {profile.name.charAt(0).toUpperCase()}
        </div>
        <div className="profile-info">
          <h1>{profile.name}</h1>
          <p className="profile-position">{profile.position}</p>
          <p className="profile-department">{profile.department} Department</p>
        </div>
        {!isEditing && (
          <button onClick={handleEdit} className="action-btn primary">
            <Edit3 size={16} />
            Edit Profile
          </button>
        )}
      </div>

      <div className="profile-content">
        {/* Personal Information */}
        <div className="profile-section">
          <h2>Personal Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>
                <Mail size={18} />
                Email Address
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="form-input"
                />
              ) : (
                <span>{profile.email}</span>
              )}
            </div>

            <div className="info-item">
              <label>
                <Phone size={18} />
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="form-input"
                />
              ) : (
                <span>{profile.phone}</span>
              )}
            </div>

            <div className="info-item">
              <label>
                <MapPin size={18} />
                Office Location
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.office}
                  onChange={(e) => setEditForm({ ...editForm, office: e.target.value })}
                  className="form-input"
                />
              ) : (
                <span>{profile.office}</span>
              )}
            </div>

            <div className="info-item">
              <label>
                <Briefcase size={18} />
                Specialization
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.specialization}
                  onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
                  className="form-input"
                />
              ) : (
                <span>{profile.specialization}</span>
              )}
            </div>

            <div className="info-item">
              <label>
                <Calendar size={18} />
                Join Date
              </label>
              <span>{new Date(profile.joinDate).toLocaleDateString()}</span>
            </div>
          </div>

          {isEditing && (
            <div className="form-actions">
              <button onClick={handleCancel} className="action-btn secondary">
                <X size={16} />
                Cancel
              </button>
              <button onClick={handleSave} className="action-btn primary">
                <Save size={16} />
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* Security Section */}
        <div className="profile-section">
          <h2>Security</h2>
          
          {!showPasswordForm ? (
            <button 
              onClick={() => setShowPasswordForm(true)}
              className="action-btn secondary"
            >
              <Lock size={16} />
              Change Password
            </button>
          ) : (
            <div className="password-form">
              <div className="form-group">
                <label>Current Password</label>
                <div className="password-input">
                  <input
                    type={showPassword.current ? "text" : "password"}
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                    className="form-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                    className="password-toggle"
                  >
                    {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>New Password</label>
                <div className="password-input">
                  <input
                    type={showPassword.new ? "text" : "password"}
                    value={passwordForm.new}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                    className="form-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                    className="password-toggle"
                  >
                    {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <div className="password-input">
                  <input
                    type={showPassword.confirm ? "text" : "password"}
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                    className="form-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                    className="password-toggle"
                  >
                    {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-actions">
                <button 
                  onClick={() => setShowPasswordForm(false)}
                  className="action-btn secondary"
                >
                  Cancel
                </button>
                <button 
                  onClick={handlePasswordChange}
                  className="action-btn primary"
                >
                  <Shield size={16} />
                  Update Password
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="profile-section">
          <h2>Activity Statistics</h2>
          <div className="stats-grid">
            <div className="stat-box">
              <p className="stat-value">45</p>
              <p className="stat-label">Total Appointments</p>
            </div>
            <div className="stat-box">
              <p className="stat-value">32</p>
              <p className="stat-label">Students Advised</p>
            </div>
            <div className="stat-box">
              <p className="stat-value">12</p>
              <p className="stat-label">This Week</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

