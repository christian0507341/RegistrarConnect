import { useState, useEffect } from "react";
import { apiService } from "../services/api";
import { 
  Settings, 
  Clock, 
  Users, 
  Calendar, 
  Save, 
  RefreshCw, 
  Zap, 
  BarChart3, 
  CheckCircle, 
  AlertTriangle,
  Sparkles,
  Target,
  Timer,
  CalendarDays,
  Shield,
  Play,
  Bug
} from "lucide-react";
import "../styles/screens/AppointmentSettingsScreen.css";

interface AppointmentSettings {
  id?: number;
  max_appointments_per_day: number;
  appointment_start_hour: number;
  appointment_end_hour: number;
  appointment_duration_minutes: number;
  advance_days: number;
  exclude_weekends: boolean;
}

interface AppointmentStats {
  today: number;
  tomorrow: number;
  this_week: number;
  total_scheduled: number;
  max_per_day: number;
}

export default function AppointmentSettingsScreen() {
  const [settings, setSettings] = useState<AppointmentSettings>({
    max_appointments_per_day: 100,
    appointment_start_hour: 9,
    appointment_end_hour: 17,
    appointment_duration_minutes: 15,
    advance_days: 1,
    exclude_weekends: true,
  });
  
  const [stats, setStats] = useState<AppointmentStats>({
    today: 0,
    tomorrow: 0,
    this_week: 0,
    total_scheduled: 0,
    max_per_day: 100,
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [nextSlot, setNextSlot] = useState<string>("");

  useEffect(() => {
    loadSettings();
    loadStats();
    loadNextSlot();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await apiService.getAppointmentSettings();
      setSettings(response);
    } catch (error) {
      console.error("Error loading settings:", error);
      setToast("Failed to load settings");
      setTimeout(() => setToast(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiService.getAppointmentStatistics();
      setStats(response);
    } catch (error) {
      console.error("Error loading statistics:", error);
    }
  };

  const loadNextSlot = async () => {
    try {
      const response = await apiService.getNextAvailableSlot();
      setNextSlot(response.formatted_time);
    } catch (error) {
      console.error("Error loading next slot:", error);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await apiService.updateAppointmentSettings(settings);
      setToast("Settings saved successfully!");
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setToast("Failed to save settings");
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleTriggerScheduling = async () => {
    try {
      setSaving(true);
      const response = await apiService.triggerAutomaticScheduling();
      const scheduledCount = response.scheduled_count || response.data?.scheduled_count || 0;
      setToast(`Scheduled ${scheduledCount} appointments`);
      setTimeout(() => setToast(null), 3000);
      loadStats(); // Refresh stats
    } catch (error) {
      console.error("Error triggering scheduling:", error);
      setToast(`Failed to trigger scheduling: ${error.response?.data?.error || error.message}`);
      setTimeout(() => setToast(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleDebugReadyRequests = async () => {
    try {
      setSaving(true);
      const response = await apiService.debugReadyRequests();
      console.log("Debug info:", response);
      setToast(`Found ${response.total_ready_requests} ready requests, ${response.ready_without_appointments} without appointments`);
      setTimeout(() => setToast(null), 5000);
    } catch (error) {
      console.error("Error debugging ready requests:", error);
      setToast(`Debug failed: ${error.response?.data?.error || error.message}`);
      setTimeout(() => setToast(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="appointment-settings-screen">
        <div className="loading-container">
          <RefreshCw className="loading-spinner" />
          <p>Loading appointment settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="appointment-settings-screen">
      {toast && (
        <div className="toast">
          <div className="toast-content">
            <CheckCircle size={16} />
          <span>{toast}</span>
          </div>
        </div>
      )}

      {/* Minimalist Header */}
      <div className="settings-header">
        <div className="header-content">
          <div className="header-main">
            <h1 className="settings-title">
              <Settings size={24} />
              Appointment Settings
            </h1>
            <p className="settings-subtitle">
              Configure intelligent appointment scheduling
            </p>
          </div>
          <div className="header-badge">
            <Sparkles size={14} />
            <span>Smart Scheduling</span>
          </div>
        </div>
        <div className="header-actions">
          <button 
            className="action-btn secondary"
            onClick={loadStats}
            disabled={saving}
          >
            <RefreshCw size={16} className={saving ? "animate-spin" : ""} />
            Refresh
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
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>

      <div className="settings-content">
        {/* Configuration Section */}
        <div className="settings-section">
          <div className="section-header">
            <h2 className="section-title">
              <Target size={20} />
              Configuration
            </h2>
            <p className="section-description">
              Set up intelligent appointment scheduling parameters
            </p>
          </div>
          
          <div className="settings-card">
            <div className="settings-form">
          
              <div className="form-group">
                <label htmlFor="max_appointments" className="form-label">
                  <div className="label-content">
                    <Users size={16} />
                    <span className="label-text">Max Appointments Per Day</span>
                  </div>
                  <span className="label-description">Maximum number of appointments that can be scheduled per day</span>
                </label>
                <div className="input-wrapper">
                  <input
                    id="max_appointments"
                    type="number"
                    min="1"
                    max="1000"
                    value={settings.max_appointments_per_day}
                    onChange={(e) => setSettings({
                      ...settings,
                      max_appointments_per_day: parseInt(e.target.value) || 100
                    })}
                    className="form-input"
                    placeholder="100"
                  />
                  <div className="input-indicator">
                    <Target size={14} />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="start_hour" className="form-label">
                    <div className="label-content">
                      <Clock size={16} />
                      <span className="label-text">Start Hour</span>
                    </div>
                  </label>
                  <div className="input-wrapper">
                    <input
                      id="start_hour"
                      type="number"
                      min="0"
                      max="23"
                      value={settings.appointment_start_hour}
                      onChange={(e) => setSettings({
                        ...settings,
                        appointment_start_hour: parseInt(e.target.value) || 9
                      })}
                      className="form-input"
                      placeholder="9"
                    />
                    <div className="input-indicator">
                      <Timer size={14} />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="end_hour" className="form-label">
                    <div className="label-content">
                      <Clock size={16} />
                      <span className="label-text">End Hour</span>
                    </div>
                  </label>
                  <div className="input-wrapper">
                    <input
                      id="end_hour"
                      type="number"
                      min="0"
                      max="23"
                      value={settings.appointment_end_hour}
                      onChange={(e) => setSettings({
                        ...settings,
                        appointment_end_hour: parseInt(e.target.value) || 17
                      })}
                      className="form-input"
                      placeholder="17"
                    />
                    <div className="input-indicator">
                      <Timer size={14} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="duration" className="form-label">
                    <div className="label-content">
                      <Clock size={16} />
                      <span className="label-text">Duration (minutes)</span>
                    </div>
                  </label>
                  <div className="input-wrapper">
                    <input
                      id="duration"
                      type="number"
                      min="5"
                      max="120"
                      value={settings.appointment_duration_minutes}
                      onChange={(e) => setSettings({
                        ...settings,
                        appointment_duration_minutes: parseInt(e.target.value) || 15
                      })}
                      className="form-input"
                      placeholder="15"
                    />
                    <div className="input-indicator">
                      <Timer size={14} />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="advance_days" className="form-label">
                    <div className="label-content">
                      <Calendar size={16} />
                      <span className="label-text">Advance Days</span>
                    </div>
                  </label>
                  <div className="input-wrapper">
                    <input
                      id="advance_days"
                      type="number"
                      min="1"
                      max="30"
                      value={settings.advance_days}
                      onChange={(e) => setSettings({
                        ...settings,
                        advance_days: parseInt(e.target.value) || 1
                      })}
                      className="form-input"
                      placeholder="1"
                    />
                    <div className="input-indicator">
                      <CalendarDays size={14} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="setting-item">
                  <div className="setting-content">
                    <div className="setting-info">
                      <div className="setting-header">
                        <Shield size={16} />
                        <span className="setting-name">Exclude Weekends</span>
                      </div>
                      <span className="setting-description">Skip Saturday and Sunday when scheduling</span>
                    </div>
                    <div className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.exclude_weekends}
                        onChange={(e) => setSettings({
                          ...settings,
                          exclude_weekends: e.target.checked
                        })}
                      />
                      <span className="toggle-slider"></span>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics & Actions Section */}
        <div className="stats-section">
          <div className="section-header">
            <h2 className="section-title">
              <BarChart3 size={20} />
              Statistics & Actions
            </h2>
            <p className="section-description">
              Monitor appointment distribution and manage scheduling
            </p>
          </div>
          
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-content">
                <div className="stat-header">
                  <div className="stat-icon">
                    <Calendar size={20} />
                  </div>
                </div>
                <div className="stat-value">{stats.today}</div>
                <div className="stat-label">Today</div>
                <div className="stat-sublabel">Current appointments</div>
              </div>
            </div>

            <div className="stat-card success">
              <div className="stat-content">
                <div className="stat-header">
                  <div className="stat-icon">
                    <Calendar size={20} />
                  </div>
                </div>
                <div className="stat-value">{stats.tomorrow}</div>
                <div className="stat-label">Tomorrow</div>
                <div className="stat-sublabel">Scheduled appointments</div>
              </div>
            </div>

            <div className="stat-card info">
              <div className="stat-content">
                <div className="stat-header">
                  <div className="stat-icon">
                    <Calendar size={20} />
                  </div>
                </div>
                <div className="stat-value">{stats.this_week}</div>
                <div className="stat-label">This Week</div>
                <div className="stat-sublabel">Weekly total</div>
              </div>
            </div>

            <div className="stat-card warning">
              <div className="stat-content">
                <div className="stat-header">
                  <div className="stat-icon">
                    <Calendar size={20} />
                  </div>
                </div>
                <div className="stat-value">{stats.total_scheduled}</div>
                <div className="stat-label">Total Scheduled</div>
                <div className="stat-sublabel">All time</div>
              </div>
            </div>
          </div>

          <div className="next-slot-card">
            <div className="slot-header">
              <h3 className="slot-title">
                <Zap size={16} />
                Next Available Slot
              </h3>
            </div>
            <div className="slot-content">
              <div className="slot-time">{nextSlot || "Loading..."}</div>
              <div className="slot-description">Automatically calculated based on current settings</div>
            </div>
          </div>

          <div className="action-buttons">
            <button
              className="action-btn secondary"
              onClick={loadStats}
              disabled={saving}
            >
              <RefreshCw size={16} className={saving ? "animate-spin" : ""} />
              Refresh Stats
            </button>
            <button
              className="action-btn primary"
              onClick={handleTriggerScheduling}
              disabled={saving}
            >
              <Play size={16} />
              Trigger Scheduling
            </button>
            <button
              className="action-btn warning"
              onClick={handleDebugReadyRequests}
              disabled={saving}
            >
              <Bug size={16} />
              Debug Ready Requests
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
