import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../services/api";
import Card from "../components/Card";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  BookOpen,
  Settings,
  Save,
  Edit3,
  Camera,
  Bell,
  Shield,
  LogOut,
  Award,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Lock,
  Key,
  Smartphone,
  Globe,
  Heart,
  Star,
  MessageCircle,
  FileText,
  Calendar as CalendarIcon,
  X
} from "lucide-react";
interface StudentProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  student_id: string;
  course: string;
  year_level: string;
  gpa?: number;
  enrollment_date: string;
  graduation_date?: string;
  status: 'active' | 'inactive' | 'graduated';
  profile_picture?: string;
}

interface AcademicRecord {
  semester: string;
  school_year: string;
  gpa: number;
  units_earned: number;
  status: string;
}

export default function StudentProfileScreen() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [academicRecords, setAcademicRecords] = useState<AcademicRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<StudentProfile>>({});
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    // Check if user is authenticated and is a student
    const token = localStorage.getItem("accessToken");
    const role = localStorage.getItem("role");
    
    if (!token || role !== 'student') {
      navigate('/login');
      return;
    }
    
    fetchProfile();
  }, [navigate]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiService.getStudentProfile();
      setProfile(response.data);
      setEditForm(response.data);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm(profile || {});
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm(profile || {});
  };

  const handleSave = async () => {
    try {
      await apiService.updateStudentProfile(editForm);
      setProfile(editForm as StudentProfile);
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again.");
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setError("New passwords do not match");
      return;
    }

    try {
      await apiService.changePassword(passwordForm);
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      setShowPasswordForm(false);
    } catch (err) {
      console.error("Error changing password:", err);
      setError("Failed to change password. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'orange';
      case 'graduated':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 size={16} className="text-green-500" />;
      case 'inactive':
        return <AlertTriangle size={16} className="text-orange-500" />;
      case 'graduated':
        return <Award size={16} className="text-blue-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-error">
        <p>{error}</p>
        <button onClick={fetchProfile} className="retry-button">Retry</button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-not-found">
        <User size={64} className="empty-icon" />
        <h3>Profile Not Found</h3>
        <p>Unable to load your profile information.</p>
      </div>
    );
  }

  return (
    <div className="student-profile-screen">
      {/* Professional Header */}
      <div className="profile-header">
        <div className="header-content">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              {profile.profile_picture ? (
                <img src={profile.profile_picture} alt="Profile" />
              ) : (
                <span>{profile.name?.charAt(0)?.toUpperCase() || 'U'}</span>
              )}
              <button className="avatar-edit-btn">
                <Camera size={16} />
              </button>
            </div>
            <div className="profile-info">
              <h1>{profile.name || 'User'}</h1>
              <p className="profile-email">{profile.email || 'No email'}</p>
              <div className="profile-status">
                {getStatusIcon(profile.status)}
                <span className={`status-text ${getStatusColor(profile.status)}`}>
                  {profile.status?.charAt(0)?.toUpperCase() + profile.status?.slice(1) || 'Active'}
                </span>
              </div>
            </div>
          </div>
          <div className="header-actions">
            {!isEditing ? (
              <button onClick={handleEdit} className="action-btn primary">
                <Edit3 size={16} />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="edit-actions">
                <button onClick={handleSave} className="action-btn primary">
                  <Save size={16} />
                  <span>Save Changes</span>
                </button>
                <button onClick={handleCancel} className="action-btn secondary">
                  <X size={16} />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="profile-content">
        {/* Personal Information */}
        <Card className="profile-card">
          <div className="card-header">
            <h2>
              <User size={24} />
              Personal Information
            </h2>
            <div className="card-actions">
              <button className="action-btn small secondary">
                <Settings size={16} />
                <span>Privacy Settings</span>
              </button>
            </div>
          </div>
          <div className="card-content">
            <div className="info-grid">
              <div className="info-item">
                <label>
                  <Mail size={20} />
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editForm.email || ''}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className="form-input"
                  />
                ) : (
                  <span>{profile.email || 'No email'}</span>
                )}
              </div>
              <div className="info-item">
                <label>
                  <Phone size={20} />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editForm.phone || ''}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    className="form-input"
                    placeholder="Enter phone number"
                  />
                ) : (
                  <span>{profile.phone || 'Not provided'}</span>
                )}
              </div>
              <div className="info-item">
                <label>
                  <MapPin size={20} />
                  Address
                </label>
                {isEditing ? (
                  <textarea
                    value={editForm.address || ''}
                    onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                    className="form-textarea"
                    placeholder="Enter your address"
                    rows={3}
                  />
                ) : (
                  <span>{profile.address || 'Not provided'}</span>
                )}
              </div>
              <div className="info-item">
                <label>
                  <Calendar size={20} />
                  Date of Birth
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={editForm.date_of_birth || ''}
                    onChange={(e) => setEditForm({...editForm, date_of_birth: e.target.value})}
                    className="form-input"
                  />
                ) : (
                  <span>{profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : 'Not provided'}</span>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Academic Information */}
        <Card className="profile-card">
          <div className="card-header">
            <h2>
              <GraduationCap size={24} />
              Academic Information
            </h2>
            <div className="card-actions">
              <button className="action-btn small secondary">
                <FileText size={16} />
                <span>View Transcript</span>
              </button>
            </div>
          </div>
          <div className="card-content">
            <div className="academic-grid">
              <div className="academic-item">
                <label>
                  <BookOpen size={20} />
                  Student ID
                </label>
                <span className="academic-value">{profile.student_id}</span>
              </div>
              <div className="academic-item">
                <label>
                  <GraduationCap size={20} />
                  Course
                </label>
                <span className="academic-value">{profile.course}</span>
              </div>
              <div className="academic-item">
                <label>
                  <TrendingUp size={20} />
                  Year Level
                </label>
                <span className="academic-value">{profile.year_level}</span>
              </div>
              <div className="academic-item">
                <label>
                  <Award size={20} />
                  GPA
                </label>
                <span className="academic-value">{profile.gpa ? profile.gpa.toFixed(2) : 'N/A'}</span>
              </div>
              <div className="academic-item">
                <label>
                  <Calendar size={20} />
                  Enrollment Date
                </label>
                <span className="academic-value">{new Date(profile.enrollment_date).toLocaleDateString()}</span>
              </div>
              <div className="academic-item">
                <label>
                  <CalendarIcon size={20} />
                  Graduation Date
                </label>
                <span className="academic-value">
                  {profile.graduation_date ? new Date(profile.graduation_date).toLocaleDateString() : 'Not graduated'}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Security Settings */}
        <Card className="profile-card">
          <div className="card-header">
            <h2>
              <Shield size={24} />
              Security & Privacy
            </h2>
            <div className="card-actions">
              <button 
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="action-btn small secondary"
              >
                <Key size={16} />
                <span>Change Password</span>
              </button>
            </div>
          </div>
          <div className="card-content">
            {showPasswordForm ? (
              <div className="password-form">
                <div className="form-group">
                  <label>
                    <Lock size={20} />
                    Current Password
                  </label>
                  <div className="password-input">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordForm.current_password}
                      onChange={(e) => setPasswordForm({...passwordForm, current_password: e.target.value})}
                      className="form-input"
                      placeholder="Enter current password"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                      className="password-toggle"
                    >
                      {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label>
                    <Key size={20} />
                    New Password
                  </label>
                  <div className="password-input">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordForm.new_password}
                      onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})}
                      className="form-input"
                      placeholder="Enter new password"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                      className="password-toggle"
                    >
                      {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label>
                    <Lock size={20} />
                    Confirm New Password
                  </label>
                  <div className="password-input">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordForm.confirm_password}
                      onChange={(e) => setPasswordForm({...passwordForm, confirm_password: e.target.value})}
                      className="form-input"
                      placeholder="Confirm new password"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                      className="password-toggle"
                    >
                      {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="password-actions">
                  <button onClick={handlePasswordChange} className="action-btn primary">
                    <Save size={16} />
                    <span>Update Password</span>
                  </button>
                  <button 
                    onClick={() => setShowPasswordForm(false)}
                    className="action-btn secondary"
                  >
                    <X size={16} />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="security-info">
                <div className="security-item">
                  <Shield size={20} />
                  <div>
                    <h4>Password Security</h4>
                    <p>Your password was last changed recently. Keep it secure and don't share it with anyone.</p>
                  </div>
                </div>
                <div className="security-item">
                  <Bell size={20} />
                  <div>
                    <h4>Login Notifications</h4>
                    <p>You'll receive email notifications for new login attempts and security alerts.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="profile-card">
          <div className="card-header">
            <h2>
              <Settings size={24} />
              Quick Actions
            </h2>
          </div>
          <div className="card-content">
            <div className="quick-actions-grid">
              <button className="quick-action-btn">
                <MessageCircle size={24} />
                <span>Contact Support</span>
              </button>
              <button className="quick-action-btn">
                <FileText size={24} />
                <span>Download Documents</span>
              </button>
              <button className="quick-action-btn">
                <Bell size={24} />
                <span>Notification Settings</span>
              </button>
              <button 
                onClick={handleLogout}
                className="quick-action-btn danger"
              >
                <LogOut size={24} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}