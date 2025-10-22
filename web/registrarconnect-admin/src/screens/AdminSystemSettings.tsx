import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Save, Mail, Shield, Bell, AlertCircle, RefreshCw } from 'lucide-react';
import { apiService } from '../services/api';

export default function AdminSystemSettings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    general: {
      site_name: 'RegistrarConnect',
      site_url: 'https://registrar.phinmaed.com',
      admin_email: 'admin@phinmaed.com',
      timezone: 'Asia/Manila',
      date_format: 'MM/DD/YYYY',
    },
    email: {
      smtp_host: 'smtp.gmail.com',
      smtp_port: '587',
      smtp_username: '',
      smtp_password: '',
      email_from: 'noreply@phinmaed.com',
    },
    security: {
      allow_registration: true,
      require_email_verification: true,
      max_file_size: 10,
      allowed_file_types: 'pdf, jpg, png',
    },
    notifications: {
      enable_notifications: true,
      notification_sound: true,
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await apiService.admin.getSettings();
      setSettings(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await apiService.admin.updateSettings(settings);
      alert('Settings saved successfully!');
      setError(null);
    } catch (err: any) {
      console.error('Error saving settings:', err);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Reset all settings to defaults? This cannot be undone.')) return;
    
    try {
      setSaving(true);
      const response = await apiService.admin.resetSettings();
      setSettings(response.data.settings);
      alert('Settings reset to defaults!');
    } catch (err: any) {
      console.error('Error resetting settings:', err);
      alert('Failed to reset settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-settings-screen">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-settings-screen">
        <div className="error-state">
          <AlertCircle size={48} />
          <h2>{error}</h2>
          <button onClick={fetchSettings} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
  ];

  return (
    <div className="admin-settings-screen">
      <div className="screen-header">
        <div className="header-content">
          <h1>System Settings</h1>
          <p>Configure system-wide parameters and preferences</p>
        </div>
        <div className="header-actions">
          <button onClick={handleReset} className="action-btn secondary" disabled={saving}>
            <RefreshCw size={16} />
            Reset to Defaults
          </button>
        </div>
      </div>

      <div className="settings-container">
        {/* Tabs Navigation */}
        <div className="settings-tabs">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Settings Content */}
        <div className="settings-content">
          {activeTab === 'general' && (
            <div className="settings-section">
              <h2>General Settings</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Site Name</label>
                  <input
                    type="text"
                    value={settings.general.site_name}
                    onChange={(e) => setSettings({
                      ...settings, 
                      general: {...settings.general, site_name: e.target.value}
                    })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Site URL</label>
                  <input
                    type="url"
                    value={settings.general.site_url}
                    onChange={(e) => setSettings({
                      ...settings, 
                      general: {...settings.general, site_url: e.target.value}
                    })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Admin Email</label>
                  <input
                    type="email"
                    value={settings.general.admin_email}
                    onChange={(e) => setSettings({
                      ...settings, 
                      general: {...settings.general, admin_email: e.target.value}
                    })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Timezone</label>
                  <select
                    value={settings.general.timezone}
                    onChange={(e) => setSettings({
                      ...settings, 
                      general: {...settings.general, timezone: e.target.value}
                    })}
                    className="form-input"
                  >
                    <option value="Asia/Manila">Asia/Manila (GMT+8)</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New York (EST)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Date Format</label>
                  <select
                    value={settings.general.date_format}
                    onChange={(e) => setSettings({
                      ...settings, 
                      general: {...settings.general, date_format: e.target.value}
                    })}
                    className="form-input"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="settings-section">
              <h2>Email Configuration</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>SMTP Host</label>
                  <input
                    type="text"
                    value={settings.email.smtp_host}
                    onChange={(e) => setSettings({
                      ...settings, 
                      email: {...settings.email, smtp_host: e.target.value}
                    })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>SMTP Port</label>
                  <input
                    type="text"
                    value={settings.email.smtp_port}
                    onChange={(e) => setSettings({
                      ...settings, 
                      email: {...settings.email, smtp_port: e.target.value}
                    })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>SMTP Username</label>
                  <input
                    type="text"
                    value={settings.email.smtp_username}
                    onChange={(e) => setSettings({
                      ...settings, 
                      email: {...settings.email, smtp_username: e.target.value}
                    })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Email From Address</label>
                  <input
                    type="email"
                    value={settings.email.email_from}
                    onChange={(e) => setSettings({
                      ...settings, 
                      email: {...settings.email, email_from: e.target.value}
                    })}
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-section">
              <h2>Security Settings</h2>
              <div className="form-grid">
                <div className="form-group-checkbox">
                  <input
                    type="checkbox"
                    id="allowRegistration"
                    checked={settings.security.allow_registration}
                    onChange={(e) => setSettings({
                      ...settings, 
                      security: {...settings.security, allow_registration: e.target.checked}
                    })}
                  />
                  <label htmlFor="allowRegistration">Allow User Registration</label>
                </div>
                <div className="form-group-checkbox">
                  <input
                    type="checkbox"
                    id="requireEmailVerification"
                    checked={settings.security.require_email_verification}
                    onChange={(e) => setSettings({
                      ...settings, 
                      security: {...settings.security, require_email_verification: e.target.checked}
                    })}
                  />
                  <label htmlFor="requireEmailVerification">Require Email Verification</label>
                </div>
                <div className="form-group">
                  <label>Max File Upload Size (MB)</label>
                  <input
                    type="number"
                    value={settings.security.max_file_size}
                    onChange={(e) => setSettings({
                      ...settings, 
                      security: {...settings.security, max_file_size: parseInt(e.target.value)}
                    })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Allowed File Types</label>
                  <input
                    type="text"
                    value={settings.security.allowed_file_types}
                    onChange={(e) => setSettings({
                      ...settings, 
                      security: {...settings.security, allowed_file_types: e.target.value}
                    })}
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>Notification Settings</h2>
              <div className="form-grid">
                <div className="form-group-checkbox">
                  <input
                    type="checkbox"
                    id="enableNotifications"
                    checked={settings.notifications.enable_notifications}
                    onChange={(e) => setSettings({
                      ...settings, 
                      notifications: {...settings.notifications, enable_notifications: e.target.checked}
                    })}
                  />
                  <label htmlFor="enableNotifications">Enable System Notifications</label>
                </div>
                <div className="form-group-checkbox">
                  <input
                    type="checkbox"
                    id="notificationSound"
                    checked={settings.notifications.notification_sound}
                    onChange={(e) => setSettings({
                      ...settings, 
                      notifications: {...settings.notifications, notification_sound: e.target.checked}
                    })}
                  />
                  <label htmlFor="notificationSound">Enable Notification Sounds</label>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="settings-actions">
            <button onClick={() => navigate(-1)} className="action-btn secondary" disabled={saving}>
              Cancel
            </button>
            <button onClick={handleSave} className="action-btn primary" disabled={saving}>
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

