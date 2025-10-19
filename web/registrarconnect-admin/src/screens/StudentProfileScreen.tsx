import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../services/api";
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
  LogOut
} from "lucide-react";
import "../styles/screens/StudentProfileScreen.css";

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  student_id: string;
  course: string;
  year_level: string;
  enrollment_date: string;
  profile_image?: string;
}

export default function StudentProfileScreen() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    course: "",
    year_level: ""
  });

  // Fetch student profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        // Check authentication
        const token = localStorage.getItem("accessToken");
        if (!token) {
          navigate("/student/login");
          return;
        }

        // For now, create a mock profile with localStorage data
        const mockProfile: StudentProfile = {
          id: "1",
          name: localStorage.getItem("name") || "Student Name",
          email: localStorage.getItem("email") || "student@phinmaed.com",
          phone: "+63 912 345 6789",
          address: "123 Main Street, City, Province",
          student_id: "2024-0001",
          course: "Bachelor of Science in Computer Science",
          year_level: "3rd Year",
          enrollment_date: "2022-08-15",
          profile_image: "/default-avatar.png"
        };

        setProfile(mockProfile);
        setFormData({
          name: mockProfile.name,
          email: mockProfile.email,
          phone: mockProfile.phone || "",
          address: mockProfile.address || "",
          course: mockProfile.course,
          year_level: mockProfile.year_level
        });

      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Update profile logic would go here
      // For now, just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProfile(prev => prev ? { ...prev, ...formData } : null);
      setEditing(false);
      setToast("Profile updated successfully!");
      setTimeout(() => setToast(null), 3000);
      
    } catch (err) {
      console.error("Error updating profile:", err);
      setToast("Failed to update profile");
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    navigate("/student/login");
  };

  if (loading) {
    return (
      <div className="student-profile-screen">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-profile-screen">
        <div className="error-container">
          <User size={48} />
          <h3>Error Loading Profile</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="student-profile-screen">
      {/* Header Section */}
      <div className="profile-header">
        <div className="header-content">
          <div className="header-title">
            <h1 className="page-title">
              <span className="title-icon">👤</span>
              My Profile
            </h1>
            <p className="page-subtitle">Manage your personal information and settings</p>
          </div>
          <div className="header-actions">
            {editing ? (
              <div className="edit-actions">
                <button 
                  className="action-btn secondary"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
                <button 
                  className="action-btn primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <div className="spinner"></div>
                  ) : (
                    <Save size={16} />
                  )}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            ) : (
              <button 
                className="action-btn primary"
                onClick={() => setEditing(true)}
              >
                <Edit3 size={16} />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="profile-content">
        {/* Profile Card */}
        <Card className="profile-card">
          <div className="profile-main">
            <div className="profile-avatar-section">
              <div className="profile-avatar">
                <img 
                  src={profile?.profile_image || "/default-avatar.png"} 
                  alt="Profile"
                  className="avatar-image"
                />
                <button className="avatar-edit-btn">
                  <Camera size={16} />
                </button>
              </div>
              <div className="profile-basic-info">
                <h2 className="profile-name">{profile?.name}</h2>
                <p className="profile-role">Student</p>
                <div className="profile-badge">
                  <GraduationCap size={14} />
                  <span>{profile?.student_id}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Personal Information */}
        <Card 
          title={
            <div className="card-header-content">
              <div className="card-title">
                <User size={20} />
                <span>Personal Information</span>
              </div>
            </div>
          }
          className="info-card"
        >
          <div className="info-grid">
            <div className="info-group">
              <label className="info-label">
                <User size={16} />
                Full Name
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="form-input"
                />
              ) : (
                <div className="info-value">{profile?.name}</div>
              )}
            </div>

            <div className="info-group">
              <label className="info-label">
                <Mail size={16} />
                Email Address
              </label>
              {editing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="form-input"
                />
              ) : (
                <div className="info-value">{profile?.email}</div>
              )}
            </div>

            <div className="info-group">
              <label className="info-label">
                <Phone size={16} />
                Phone Number
              </label>
              {editing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="form-input"
                />
              ) : (
                <div className="info-value">{profile?.phone || "Not provided"}</div>
              )}
            </div>

            <div className="info-group">
              <label className="info-label">
                <MapPin size={16} />
                Address
              </label>
              {editing ? (
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="form-textarea"
                  rows={3}
                />
              ) : (
                <div className="info-value">{profile?.address || "Not provided"}</div>
              )}
            </div>
          </div>
        </Card>

        {/* Academic Information */}
        <Card 
          title={
            <div className="card-header-content">
              <div className="card-title">
                <BookOpen size={20} />
                <span>Academic Information</span>
              </div>
            </div>
          }
          className="info-card"
        >
          <div className="info-grid">
            <div className="info-group">
              <label className="info-label">
                <GraduationCap size={16} />
                Student ID
              </label>
              <div className="info-value">{profile?.student_id}</div>
            </div>

            <div className="info-group">
              <label className="info-label">
                <BookOpen size={16} />
                Course
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.course}
                  onChange={(e) => setFormData({...formData, course: e.target.value})}
                  className="form-input"
                />
              ) : (
                <div className="info-value">{profile?.course}</div>
              )}
            </div>

            <div className="info-group">
              <label className="info-label">
                <Calendar size={16} />
                Year Level
              </label>
              {editing ? (
                <select
                  value={formData.year_level}
                  onChange={(e) => setFormData({...formData, year_level: e.target.value})}
                  className="form-select"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="5th Year">5th Year</option>
                </select>
              ) : (
                <div className="info-value">{profile?.year_level}</div>
              )}
            </div>

            <div className="info-group">
              <label className="info-label">
                <Calendar size={16} />
                Enrollment Date
              </label>
              <div className="info-value">
                {profile?.enrollment_date ? new Date(profile.enrollment_date).toLocaleDateString() : "Not available"}
              </div>
            </div>
          </div>
        </Card>

        {/* Settings and Actions */}
        <Card 
          title={
            <div className="card-header-content">
              <div className="card-title">
                <Settings size={20} />
                <span>Settings & Actions</span>
              </div>
            </div>
          }
          className="settings-card"
        >
          <div className="settings-grid">
            <button className="setting-item">
              <div className="setting-icon">
                <Bell size={20} />
              </div>
              <div className="setting-content">
                <div className="setting-name">Notifications</div>
                <div className="setting-description">Manage your notification preferences</div>
              </div>
            </button>

            <button className="setting-item">
              <div className="setting-icon">
                <Shield size={20} />
              </div>
              <div className="setting-content">
                <div className="setting-name">Privacy & Security</div>
                <div className="setting-description">Update your password and security settings</div>
              </div>
            </button>

            <button className="setting-item logout" onClick={handleLogout}>
              <div className="setting-icon">
                <LogOut size={20} />
              </div>
              <div className="setting-content">
                <div className="setting-name">Sign Out</div>
                <div className="setting-description">Sign out of your account</div>
              </div>
            </button>
          </div>
        </Card>
      </div>

      {/* Toast Notifications */}
      {toast && (
        <div className="toast-notification">
          <div className="toast-content">
            <Save size={16} />
            <span>{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}
