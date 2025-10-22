import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, 
  User, 
  Bell, 
  Lock,
  Palette, 
  Globe,
  Save, 
  RotateCcw, 
  Check,
  Moon,
  Sun,
  Monitor,
  Eye,
  EyeOff,
  Mail,
  Smartphone,
  Shield,
  AlertCircle,
  Info,
  ChevronRight
} from 'lucide-react';
import { apiService } from '../services/api';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';

interface StudentSettings {
  theme: 'light' | 'dark' | 'auto';
  language: 'en' | 'fil';
  notifications: {
    email: boolean;
    push: boolean;
    sound: boolean;
    appointmentReminders: boolean;
    requestUpdates: boolean;
    generalAnnouncements: boolean;
  };
  privacy: {
    showProfile: boolean;
    allowNotifications: boolean;
  };
}

export default function StudentSettingsScreen() {
  const navigate = useNavigate();
  const toast = useToast();
  const [settings, setSettings] = useState<StudentSettings>({
    theme: 'auto',
    language: 'en',
    notifications: {
      email: true,
      push: true,
      sound: false,
      appointmentReminders: true,
      requestUpdates: true,
      generalAnnouncements: false,
    },
    privacy: {
      showProfile: true,
      allowNotifications: true,
    }
  });

  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'privacy' | 'account'>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const role = localStorage.getItem("role");
    
    if (!token || role !== 'student') {
      navigate('/login');
      return;
    }

    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('studentSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, [navigate]);

  // Apply theme on settings change
  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);

  const applyTheme = (theme: string) => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark-theme');
      root.style.colorScheme = 'dark';
    } else if (theme === 'light') {
      root.classList.remove('dark-theme');
      root.style.colorScheme = 'light';
    } else {
      // Auto theme - use system preference
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        root.classList.add('dark-theme');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark-theme');
        root.style.colorScheme = 'light';
      }
    }
  };

  const updateSetting = (path: string, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      const keys = path.split('.');
      let current: any = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('saving');
    
    try {
      // Save to localStorage
      localStorage.setItem('studentSettings', JSON.stringify(settings));
      
      // TODO: Send to backend API
      // await apiService.updateStudentSettings(settings);
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      const defaultSettings: StudentSettings = {
        theme: 'auto',
        language: 'en',
        notifications: {
          email: true,
          push: true,
          sound: false,
          appointmentReminders: true,
          requestUpdates: true,
          generalAnnouncements: false,
        },
        privacy: {
          showProfile: true,
          allowNotifications: true,
        }
      };
      setSettings(defaultSettings);
      localStorage.setItem('studentSettings', JSON.stringify(defaultSettings));
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match!');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long!');
      return;
    }

    try {
      await apiService.changePassword({
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
        confirm_password: passwordForm.confirmPassword
      });
      
      toast.success('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowChangePassword(false);
    } catch (error: any) {
      console.error('Error changing password:', error);
      const errorMessage = error.response?.data?.error || 'Failed to change password. Please try again.';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="student-settings-screen">
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
      {/* Header */}
      <div className="settings-header">
        <div className="header-content">
          <div className="header-info">
            <Settings size={32} className="header-icon" />
            <div className="header-text">
              <h1>Settings</h1>
              <p>Manage your account preferences and settings</p>
            </div>
          </div>
          <div className="header-actions">
            <button onClick={handleReset} className="action-btn secondary" disabled={isSaving}>
              <RotateCcw size={16} />
              <span>Reset to Default</span>
            </button>
            <button onClick={handleSave} className="action-btn primary" disabled={isSaving}>
              {saveStatus === 'saving' ? (
                <>
                  <div className="spinner-small"></div>
                  <span>Saving...</span>
                </>
              ) : saveStatus === 'saved' ? (
                <>
                  <Check size={16} />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <div className="settings-content">
        {/* Tabs Navigation */}
        <div className="settings-tabs">
          <button
            className={`tab-item ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <Palette size={20} />
            <span>General</span>
            <ChevronRight size={16} className="tab-arrow" />
          </button>
          <button
            className={`tab-item ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell size={20} />
            <span>Notifications</span>
            <ChevronRight size={16} className="tab-arrow" />
          </button>
          <button
            className={`tab-item ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            <Shield size={20} />
            <span>Privacy</span>
            <ChevronRight size={16} className="tab-arrow" />
          </button>
          <button
            className={`tab-item ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
          >
            <Lock size={20} />
            <span>Account Security</span>
            <ChevronRight size={16} className="tab-arrow" />
          </button>
        </div>

        {/* Tab Content */}
        <div className="settings-panels">
          {/* GENERAL SETTINGS */}
          {activeTab === 'general' && (
            <div className="settings-panel">
              <h2 className="panel-title">
                <Palette size={24} />
                General Settings
              </h2>

              {/* Theme Selection */}
              <div className="setting-group">
                <div className="setting-header">
                  <h3>Appearance</h3>
                  <p>Choose how the app looks to you</p>
                </div>
                <div className="theme-options">
                  <button
                    className={`theme-option ${settings.theme === 'light' ? 'active' : ''}`}
                    onClick={() => updateSetting('theme', 'light')}
                  >
                    <Sun size={24} />
                    <span>Light</span>
                    {settings.theme === 'light' && <Check size={20} className="check-icon" />}
                  </button>
                  <button
                    className={`theme-option ${settings.theme === 'dark' ? 'active' : ''}`}
                    onClick={() => updateSetting('theme', 'dark')}
                  >
                    <Moon size={24} />
                    <span>Dark</span>
                    {settings.theme === 'dark' && <Check size={20} className="check-icon" />}
                  </button>
                  <button
                    className={`theme-option ${settings.theme === 'auto' ? 'active' : ''}`}
                    onClick={() => updateSetting('theme', 'auto')}
                  >
                    <Monitor size={24} />
                    <span>Auto</span>
                    {settings.theme === 'auto' && <Check size={20} className="check-icon" />}
                  </button>
                </div>
              </div>

              {/* Language Selection */}
              <div className="setting-group">
                <div className="setting-header">
                  <h3>Language</h3>
                  <p>Select your preferred language</p>
                </div>
                <div className="language-options">
                  <button
                    className={`language-option ${settings.language === 'en' ? 'active' : ''}`}
                    onClick={() => updateSetting('language', 'en')}
                  >
                    <Globe size={20} />
                    <span>English</span>
                    {settings.language === 'en' && <Check size={20} className="check-icon" />}
                  </button>
                  <button
                    className={`language-option ${settings.language === 'fil' ? 'active' : ''}`}
                    onClick={() => updateSetting('language', 'fil')}
                  >
                    <Globe size={20} />
                    <span>Filipino</span>
                    {settings.language === 'fil' && <Check size={20} className="check-icon" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS SETTINGS */}
          {activeTab === 'notifications' && (
            <div className="settings-panel">
              <h2 className="panel-title">
                <Bell size={24} />
                Notification Preferences
              </h2>

              <div className="info-banner">
                <Info size={20} />
                <p>Control when and how you receive notifications about your requests and appointments.</p>
              </div>

              {/* General Notifications */}
              <div className="setting-group">
                <div className="setting-header">
                  <h3>General Notifications</h3>
                  <p>Choose how you want to be notified</p>
                </div>
                <div className="setting-items">
                  <div className="setting-item">
                    <div className="setting-info">
                      <Mail size={20} />
                      <div>
                        <h4>Email Notifications</h4>
                        <p>Receive updates via email</p>
                      </div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.notifications.email}
                        onChange={(e) => updateSetting('notifications.email', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <Smartphone size={20} />
                      <div>
                        <h4>Push Notifications</h4>
                        <p>Receive push notifications on your device</p>
                      </div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.notifications.push}
                        onChange={(e) => updateSetting('notifications.push', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <Bell size={20} />
                      <div>
                        <h4>Notification Sound</h4>
                        <p>Play sound for notifications</p>
                      </div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.notifications.sound}
                        onChange={(e) => updateSetting('notifications.sound', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Specific Notifications */}
              <div className="setting-group">
                <div className="setting-header">
                  <h3>Notification Types</h3>
                  <p>Choose what you want to be notified about</p>
                </div>
                <div className="setting-items">
                  <div className="setting-item">
                    <div className="setting-info">
                      <AlertCircle size={20} />
                      <div>
                        <h4>Appointment Reminders</h4>
                        <p>Get reminded about upcoming appointments</p>
                      </div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.notifications.appointmentReminders}
                        onChange={(e) => updateSetting('notifications.appointmentReminders', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <Info size={20} />
                      <div>
                        <h4>Request Updates</h4>
                        <p>Notifications when your request status changes</p>
                      </div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.notifications.requestUpdates}
                        onChange={(e) => updateSetting('notifications.requestUpdates', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <Bell size={20} />
                      <div>
                        <h4>General Announcements</h4>
                        <p>Receive important announcements from the registrar</p>
                      </div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.notifications.generalAnnouncements}
                        onChange={(e) => updateSetting('notifications.generalAnnouncements', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PRIVACY SETTINGS */}
          {activeTab === 'privacy' && (
            <div className="settings-panel">
              <h2 className="panel-title">
                <Shield size={24} />
                Privacy & Security
              </h2>

              <div className="info-banner warning">
                <AlertCircle size={20} />
                <p>These settings control your privacy and how your information is used.</p>
              </div>

              <div className="setting-group">
                <div className="setting-header">
                  <h3>Privacy Settings</h3>
                  <p>Control your privacy preferences</p>
                </div>
                <div className="setting-items">
                  <div className="setting-item">
                    <div className="setting-info">
                      <Eye size={20} />
                      <div>
                        <h4>Show Profile</h4>
                        <p>Allow registrar staff to view your profile information</p>
                      </div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.privacy.showProfile}
                        onChange={(e) => updateSetting('privacy.showProfile', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <Bell size={20} />
                      <div>
                        <h4>Allow Notifications</h4>
                        <p>Enable the app to send you notifications</p>
                      </div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.privacy.allowNotifications}
                        onChange={(e) => updateSetting('privacy.allowNotifications', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ACCOUNT SECURITY */}
          {activeTab === 'account' && (
            <div className="settings-panel">
              <h2 className="panel-title">
                <Lock size={24} />
                Account Security
              </h2>

              <div className="info-banner">
                <Shield size={20} />
                <p>Keep your account secure by using a strong password and enabling security features.</p>
              </div>

              {/* Change Password Section */}
              <div className="setting-group">
                <div className="setting-header">
                  <h3>Password</h3>
                  <p>Update your account password</p>
                </div>

                {!showChangePassword ? (
                  <button
                    onClick={() => setShowChangePassword(true)}
                    className="action-btn secondary full-width"
                  >
                    <Lock size={16} />
                    <span>Change Password</span>
                  </button>
                ) : (
                  <div className="password-change-form">
                    <div className="form-group">
                      <label>Current Password</label>
                      <div className="password-input-wrapper">
                        <input
                          type={showPasswords.current ? "text" : "password"}
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                          placeholder="Enter current password"
                          className="form-input"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                          className="password-toggle-btn"
                        >
                          {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>New Password</label>
                      <div className="password-input-wrapper">
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                          placeholder="Enter new password"
                          className="form-input"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                          className="password-toggle-btn"
                        >
                          {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <p className="input-hint">Must be at least 8 characters long</p>
                    </div>

                    <div className="form-group">
                      <label>Confirm New Password</label>
                      <div className="password-input-wrapper">
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                          placeholder="Confirm new password"
                          className="form-input"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                          className="password-toggle-btn"
                        >
                          {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="form-actions">
                      <button
                        onClick={() => {
                          setShowChangePassword(false);
                          setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                        }}
                        className="action-btn secondary"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleChangePassword}
                        className="action-btn primary"
                      >
                        <Check size={16} />
                        Update Password
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Security Info */}
              <div className="security-info-card">
                <Shield size={24} />
                <div>
                  <h4>Your account is secure</h4>
                  <p>Last password change: Recently</p>
                  <p>Two-factor authentication: Not enabled</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




