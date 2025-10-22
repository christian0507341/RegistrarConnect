import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Save, Database, Mail, Shield, Bell, Globe, Calendar } from 'lucide-react';

export default function AdminSystemSettings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    siteName: 'RegistrarConnect',
    siteUrl: 'https://registrar.phinmaed.com',
    adminEmail: 'admin@phinmaed.com',
    timezone: 'Asia/Manila',
    dateFormat: 'MM/DD/YYYY',
    allowRegistration: true,
    requireEmailVerification: true,
    maxFileSize: 10,
    allowedFileTypes: 'pdf, jpg, png',
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUsername: '',
    emailFrom: 'noreply@phinmaed.com',
    enableNotifications: true,
    notificationSound: true,
  });

  useEffect(() => {
    // Authentication is handled by the protected route in App.tsx
    // TODO: Fetch settings data from backend
  }, []);

  const handleSave = () => {
    // TODO: Save to backend
    alert('Settings saved successfully!');
  };

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
  ];

  return (
    <div className="admin-settings-screen">
      <div className="screen-header">
        <h1>System Settings</h1>
        <p>Configure system-wide parameters and preferences</p>
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
                    value={settings.siteName}
                    onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Site URL</label>
                  <input
                    type="url"
                    value={settings.siteUrl}
                    onChange={(e) => setSettings({...settings, siteUrl: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Admin Email</label>
                  <input
                    type="email"
                    value={settings.adminEmail}
                    onChange={(e) => setSettings({...settings, adminEmail: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Timezone</label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => setSettings({...settings, timezone: e.target.value})}
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
                    value={settings.dateFormat}
                    onChange={(e) => setSettings({...settings, dateFormat: e.target.value})}
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
                    value={settings.smtpHost}
                    onChange={(e) => setSettings({...settings, smtpHost: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>SMTP Port</label>
                  <input
                    type="text"
                    value={settings.smtpPort}
                    onChange={(e) => setSettings({...settings, smtpPort: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>SMTP Username</label>
                  <input
                    type="text"
                    value={settings.smtpUsername}
                    onChange={(e) => setSettings({...settings, smtpUsername: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Email From Address</label>
                  <input
                    type="email"
                    value={settings.emailFrom}
                    onChange={(e) => setSettings({...settings, emailFrom: e.target.value})}
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
                    checked={settings.allowRegistration}
                    onChange={(e) => setSettings({...settings, allowRegistration: e.target.checked})}
                  />
                  <label htmlFor="allowRegistration">Allow User Registration</label>
                </div>
                <div className="form-group-checkbox">
                  <input
                    type="checkbox"
                    id="requireEmailVerification"
                    checked={settings.requireEmailVerification}
                    onChange={(e) => setSettings({...settings, requireEmailVerification: e.target.checked})}
                  />
                  <label htmlFor="requireEmailVerification">Require Email Verification</label>
                </div>
                <div className="form-group">
                  <label>Max File Upload Size (MB)</label>
                  <input
                    type="number"
                    value={settings.maxFileSize}
                    onChange={(e) => setSettings({...settings, maxFileSize: parseInt(e.target.value)})}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Allowed File Types</label>
                  <input
                    type="text"
                    value={settings.allowedFileTypes}
                    onChange={(e) => setSettings({...settings, allowedFileTypes: e.target.value})}
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
                    checked={settings.enableNotifications}
                    onChange={(e) => setSettings({...settings, enableNotifications: e.target.checked})}
                  />
                  <label htmlFor="enableNotifications">Enable System Notifications</label>
                </div>
                <div className="form-group-checkbox">
                  <input
                    type="checkbox"
                    id="notificationSound"
                    checked={settings.notificationSound}
                    onChange={(e) => setSettings({...settings, notificationSound: e.target.checked})}
                  />
                  <label htmlFor="notificationSound">Enable Notification Sounds</label>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="settings-actions">
            <button onClick={() => navigate(-1)} className="action-btn secondary">
              Cancel
            </button>
            <button onClick={handleSave} className="action-btn primary">
              <Save size={16} />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

