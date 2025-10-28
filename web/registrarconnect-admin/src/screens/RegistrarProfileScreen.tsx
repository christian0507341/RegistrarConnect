import { useState, useEffect } from 'react';
import { User, Mail, Lock, Save, Eye, EyeOff } from 'lucide-react';
import { apiService } from '../services/api';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';

export default function RegistrarProfileScreen() {
  const toast = useToast();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    role: 'Registrar'
  });

  useEffect(() => {
    // Load profile from localStorage
    const storedName = localStorage.getItem('name') || 'Registrar';
    const storedEmail = localStorage.getItem('email') || 'registrar@phinmaed.com';
    setProfile({
      name: storedName,
      email: storedEmail,
      role: 'Registrar'
    });
  }, []);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleProfileUpdate = async () => {
    setIsSaving(true);
    try {
      // Split name into first_name and last_name
      const nameParts = profile.name.trim().split(' ');
      const first_name = nameParts[0] || '';
      const last_name = nameParts.slice(1).join(' ') || '';
      
      // API call to update profile
      await apiService.updateProfile({
        first_name,
        last_name,
        email: profile.email
      });
      
      // Update localStorage
      localStorage.setItem('name', profile.name);
      localStorage.setItem('email', profile.email);
      
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.error || 'Failed to update profile';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match!');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsSaving(true);
    try {
      // API call to change password
      await apiService.changePassword({
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
        confirm_password: passwordForm.confirmPassword
      });
      
      toast.success('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      const errorMessage = error.response?.data?.error || 'Failed to change password';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="registrar-profile-screen">
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
      <div className="profile-header">
        <h1>Profile Settings</h1>
        <p>Manage your account information and security</p>
      </div>

      <div className="profile-content">
        {/* Profile Information */}
        <div className="profile-card">
          <div className="card-header">
            <User size={24} />
            <h2>Profile Information</h2>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Role</label>
              <input
                type="text"
                value={profile.role}
                disabled
              />
            </div>
            <button
              className="btn-primary"
              onClick={handleProfileUpdate}
              disabled={isSaving}
            >
              <Save size={18} />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Password Change */}
        <div className="profile-card">
          <div className="card-header">
            <Lock size={24} />
            <h2>Change Password</h2>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label>Current Password</label>
              <div className="password-input">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>New Password</label>
              <div className="password-input">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <div className="password-input">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button
              className="btn-primary"
              onClick={handlePasswordChange}
              disabled={isSaving}
            >
              <Lock size={18} />
              {isSaving ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
