import { useState, useEffect } from 'react';
import { 
  Settings, 
  User, 
  Bell, 
  Palette, 
  Shield, 
  Database, 
  Save, 
  RotateCcw, 
  Check,
  Moon,
  Sun,
  Monitor,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Zap,
  Sparkles
} from 'lucide-react';
import '../styles/screens/SettingsScreen.css';

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    email: boolean;
    push: boolean;
    sound: boolean;
  };
  personalization: {
    greeting: string;
    dashboardLayout: 'compact' | 'comfortable' | 'spacious';
    showPersonalizedTips: boolean;
  };
  privacy: {
    showOnlineStatus: boolean;
    allowDataCollection: boolean;
    shareAnalytics: boolean;
  };
}

export default function SettingsScreen() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'auto',
    notifications: {
      email: true,
      push: true,
      sound: false
    },
    personalization: {
      greeting: 'Welcome back',
      dashboardLayout: 'comfortable',
      showPersonalizedTips: true
    },
    privacy: {
      showOnlineStatus: true,
      allowDataCollection: true,
      shareAnalytics: false
    }
  });

  const [activeTab, setActiveTab] = useState<'general' | 'personalization' | 'privacy' | 'notifications'>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    // Load preferences from localStorage
    const saved = localStorage.getItem('userPreferences');
    if (saved) {
      setPreferences(JSON.parse(saved));
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('saving');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
      setSaveStatus('saved');
      
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setPreferences({
      theme: 'auto',
      notifications: {
        email: true,
        push: true,
        sound: false
      },
      personalization: {
        greeting: 'Welcome back',
        dashboardLayout: 'comfortable',
        showPersonalizedTips: true
      },
      privacy: {
        showOnlineStatus: true,
        allowDataCollection: true,
        shareAnalytics: false
      }
    });
  };

  const updatePreference = (path: string, value: any) => {
    setPreferences(prev => {
      const newPrefs = { ...prev };
      const keys = path.split('.');
      let current = newPrefs;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newPrefs;
    });
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'personalization', label: 'Personalization', icon: Sparkles },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield }
  ];

  return (
    <div className="settings-screen">
      <div className="settings-header">
        <div className="header-content">
          <h1 className="settings-title">
            <Settings size={24} />
            Settings
          </h1>
          <p className="settings-subtitle">Customize your experience</p>
        </div>
        <div className="header-actions">
          <button 
            className="action-btn secondary"
            onClick={handleReset}
            disabled={isSaving}
          >
            <RotateCcw size={16} />
            Reset
          </button>
          <button 
            className="action-btn primary"
            onClick={handleSave}
            disabled={isSaving}
          >
            {saveStatus === 'saving' ? (
              <div className="spinner"></div>
            ) : saveStatus === 'saved' ? (
              <Check size={16} />
            ) : (
              <Save size={16} />
            )}
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="settings-content">
        <div className="settings-sidebar">
          <nav className="settings-nav">
            {tabs.map(tab => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id as any)}
                >
                  <IconComponent size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="settings-main">
          {activeTab === 'general' && (
            <div className="settings-section">
              <h2 className="section-title">
                <User size={20} />
                General Settings
              </h2>
              
              <div className="setting-group">
                <label className="setting-label">
                  <div className="label-content">
                    <span className="label-text">Theme</span>
                    <span className="label-description">Choose your preferred theme</span>
                  </div>
                  <div className="theme-options">
                    {[
                      { value: 'light', label: 'Light', icon: Sun },
                      { value: 'dark', label: 'Dark', icon: Moon },
                      { value: 'auto', label: 'Auto', icon: Monitor }
                    ].map(option => {
                      const IconComponent = option.icon;
                      return (
                        <button
                          key={option.value}
                          className={`theme-option ${preferences.theme === option.value ? 'active' : ''}`}
                          onClick={() => updatePreference('theme', option.value)}
                        >
                          <IconComponent size={16} />
                          <span>{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'personalization' && (
            <div className="settings-section">
              <h2 className="section-title">
                <Sparkles size={20} />
                Personalization
              </h2>
              
              <div className="setting-group">
                <label className="setting-label">
                  <div className="label-content">
                    <span className="label-text">Personalized Greeting</span>
                    <span className="label-description">Customize how you're greeted</span>
                  </div>
                  <input
                    type="text"
                    value={preferences.personalization.greeting}
                    onChange={(e) => updatePreference('personalization.greeting', e.target.value)}
                    className="setting-input"
                    placeholder="Enter your preferred greeting"
                  />
                </label>
              </div>

              <div className="setting-group">
                <label className="setting-label">
                  <div className="label-content">
                    <span className="label-text">Dashboard Layout</span>
                    <span className="label-description">Choose your preferred layout density</span>
                  </div>
                  <div className="layout-options">
                    {[
                      { value: 'compact', label: 'Compact', description: 'More items per screen' },
                      { value: 'comfortable', label: 'Comfortable', description: 'Balanced spacing' },
                      { value: 'spacious', label: 'Spacious', description: 'More breathing room' }
                    ].map(option => (
                      <button
                        key={option.value}
                        className={`layout-option ${preferences.personalization.dashboardLayout === option.value ? 'active' : ''}`}
                        onClick={() => updatePreference('personalization.dashboardLayout', option.value)}
                      >
                        <div className="option-content">
                          <span className="option-label">{option.label}</span>
                          <span className="option-description">{option.description}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </label>
              </div>

              <div className="setting-group">
                <label className="setting-item">
                  <div className="setting-content">
                    <div className="setting-info">
                      <span className="setting-name">Personalized Tips</span>
                      <span className="setting-description">Show helpful tips based on your usage</span>
                    </div>
                    <div className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={preferences.personalization.showPersonalizedTips}
                        onChange={(e) => updatePreference('personalization.showPersonalizedTips', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2 className="section-title">
                <Bell size={20} />
                Notifications
              </h2>
              
              <div className="setting-group">
                <label className="setting-item">
                  <div className="setting-content">
                    <div className="setting-info">
                      <span className="setting-name">Email Notifications</span>
                      <span className="setting-description">Receive updates via email</span>
                    </div>
                    <div className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={preferences.notifications.email}
                        onChange={(e) => updatePreference('notifications.email', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </div>
                  </div>
                </label>

                <label className="setting-item">
                  <div className="setting-content">
                    <div className="setting-info">
                      <span className="setting-name">Push Notifications</span>
                      <span className="setting-description">Browser notifications</span>
                    </div>
                    <div className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={preferences.notifications.push}
                        onChange={(e) => updatePreference('notifications.push', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </div>
                  </div>
          </label>

                <label className="setting-item">
                  <div className="setting-content">
                    <div className="setting-info">
                      <span className="setting-name">Sound Notifications</span>
                      <span className="setting-description">Play sounds for notifications</span>
                    </div>
                    <div className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={preferences.notifications.sound}
                        onChange={(e) => updatePreference('notifications.sound', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="settings-section">
              <h2 className="section-title">
                <Shield size={20} />
                Privacy & Security
              </h2>
              
              <div className="setting-group">
                <label className="setting-item">
                  <div className="setting-content">
                    <div className="setting-info">
                      <span className="setting-name">Show Online Status</span>
                      <span className="setting-description">Let others see when you're online</span>
                    </div>
                    <div className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={preferences.privacy.showOnlineStatus}
                        onChange={(e) => updatePreference('privacy.showOnlineStatus', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </div>
                  </div>
          </label>

                <label className="setting-item">
                  <div className="setting-content">
                    <div className="setting-info">
                      <span className="setting-name">Allow Data Collection</span>
                      <span className="setting-description">Help improve the product with usage data</span>
                    </div>
                    <div className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={preferences.privacy.allowDataCollection}
                        onChange={(e) => updatePreference('privacy.allowDataCollection', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </div>
                  </div>
          </label>

                <label className="setting-item">
                  <div className="setting-content">
                    <div className="setting-info">
                      <span className="setting-name">Share Analytics</span>
                      <span className="setting-description">Share anonymous usage analytics</span>
                    </div>
                    <div className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={preferences.privacy.shareAnalytics}
                        onChange={(e) => updatePreference('privacy.shareAnalytics', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>
          </div>
    </div>
  );
}
