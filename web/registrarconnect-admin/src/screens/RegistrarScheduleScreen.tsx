import { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Trash2, Save, AlertCircle } from 'lucide-react';
import { apiService } from '../services/api';

interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  slotsPerHour: number;
  isActive: boolean;
}

export default function RegistrarScheduleScreen() {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [newSlot, setNewSlot] = useState({
    day: 'Monday',
    startTime: '09:00',
    endTime: '17:00',
    slotsPerHour: 4,
    isActive: true
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    fetchTimeSlots();
  }, []);

  const fetchTimeSlots = async () => {
    setIsLoading(true);
    try {
      // Fetch schedule from backend
      const response = await apiService.registrar.getSchedule();
      
      const fetchedSlots = response.data.map((slot: any) => ({
        id: slot.id.toString(),
        day: slot.day,
        startTime: slot.start_time,
        endTime: slot.end_time,
        slotsPerHour: slot.slots_per_hour,
        isActive: slot.is_active
      }));
      
      setTimeSlots(fetchedSlots);
    } catch (error) {
      console.error('Error fetching time slots:', error);
      alert('Failed to load schedule. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSlot = async () => {
    setIsSaving(true);
    try {
      // API call to add time slot
      const response = await apiService.registrar.addTimeSlot({
        day: newSlot.day,
        start_time: newSlot.startTime,
        end_time: newSlot.endTime,
        slots_per_hour: newSlot.slotsPerHour,
        is_active: newSlot.isActive
      });

      const addedSlot: TimeSlot = {
        id: response.data.id.toString(),
        day: response.data.day,
        startTime: response.data.start_time,
        endTime: response.data.end_time,
        slotsPerHour: response.data.slots_per_hour,
        isActive: response.data.is_active
      };

      setTimeSlots([...timeSlots, addedSlot]);
      setShowAddModal(false);
      setNewSlot({
        day: 'Monday',
        startTime: '09:00',
        endTime: '17:00',
        slotsPerHour: 4,
        isActive: true
      });
      alert('Time slot added successfully!');
    } catch (error: any) {
      console.error('Error adding time slot:', error);
      const errorMessage = error.response?.data?.error || 'Failed to add time slot';
      alert(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm('Are you sure you want to delete this time slot?')) return;

    try {
      // API call to delete time slot
      await apiService.registrar.deleteTimeSlot(slotId);

      setTimeSlots(prev => prev.filter(slot => slot.id !== slotId));
      alert('Time slot deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting time slot:', error);
      const errorMessage = error.response?.data?.error || 'Failed to delete time slot';
      alert(errorMessage);
    }
  };

  const handleToggleActive = async (slotId: string) => {
    try {
      const currentSlot = timeSlots.find(slot => slot.id === slotId);
      if (!currentSlot) return;

      // API call to toggle slot active status
      await apiService.registrar.updateTimeSlot(slotId, { 
        is_active: !currentSlot.isActive 
      });

      setTimeSlots(prev =>
        prev.map(slot =>
          slot.id === slotId ? { ...slot, isActive: !slot.isActive } : slot
        )
      );
    } catch (error: any) {
      console.error('Error updating time slot:', error);
      const errorMessage = error.response?.data?.error || 'Failed to update time slot';
      alert(errorMessage);
    }
  };

  const calculateTotalSlots = (slot: TimeSlot) => {
    const start = parseInt(slot.startTime.split(':')[0]);
    const end = parseInt(slot.endTime.split(':')[0]);
    const hours = end - start;
    return hours * slot.slotsPerHour;
  };

  return (
    <div className="registrar-schedule-screen">
      {/* Header */}
      <div className="schedule-header">
        <div className="header-content">
          <h1>Claiming Schedule</h1>
          <p>Manage available time slots for document claiming appointments</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={20} />
          Add Time Slot
        </button>
      </div>

      {/* Info Alert */}
      <div className="info-alert">
        <AlertCircle size={20} />
        <div className="alert-content">
          <strong>Auto-Scheduling</strong>
          <p>When you approve a document request, the system automatically schedules appointments based on these available time slots.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Active Days</span>
            <span className="stat-value">
              {timeSlots.filter(slot => slot.isActive).length}
            </span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Slots/Day</span>
            <span className="stat-value">
              {timeSlots.length > 0 ? calculateTotalSlots(timeSlots[0]) : 0}
            </span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Weekly Capacity</span>
            <span className="stat-value">
              {timeSlots.filter(slot => slot.isActive).reduce((sum, slot) => sum + calculateTotalSlots(slot), 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Time Slots */}
      <div className="schedule-content">
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading schedule...</p>
          </div>
        ) : timeSlots.length === 0 ? (
          <div className="empty-state">
            <Calendar size={64} />
            <h3>No time slots configured</h3>
            <p>Add your first time slot to enable auto-scheduling</p>
            <button className="btn-primary" onClick={() => setShowAddModal(true)}>
              <Plus size={20} />
              Add Time Slot
            </button>
          </div>
        ) : (
          <div className="slots-grid">
            {daysOfWeek.map((day) => {
              const daySlot = timeSlots.find(slot => slot.day === day);
              
              return (
                <div key={day} className={`day-card ${daySlot ? 'has-slot' : 'no-slot'}`}>
                  <div className="day-header">
                    <h3>{day}</h3>
                    {daySlot && (
                      <span className={`status-badge ${daySlot.isActive ? 'active' : 'inactive'}`}>
                        {daySlot.isActive ? 'Active' : 'Inactive'}
                      </span>
                    )}
                  </div>

                  {daySlot ? (
                    <div className="day-content">
                      <div className="time-info">
                        <div className="time-row">
                          <Clock size={18} />
                          <span>{daySlot.startTime} - {daySlot.endTime}</span>
                        </div>
                        <div className="slots-info">
                          <span className="slots-count">{calculateTotalSlots(daySlot)} slots/day</span>
                          <span className="slots-per-hour">({daySlot.slotsPerHour} per hour)</span>
                        </div>
                      </div>

                      <div className="day-actions">
                        <button
                          className={`btn-toggle ${daySlot.isActive ? 'active' : ''}`}
                          onClick={() => handleToggleActive(daySlot.id)}
                        >
                          {daySlot.isActive ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteSlot(daySlot.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="day-content no-schedule">
                      <p>No schedule set</p>
                      <button
                        className="btn-add-small"
                        onClick={() => {
                          setNewSlot({ ...newSlot, day });
                          setShowAddModal(true);
                        }}
                      >
                        <Plus size={16} />
                        Add
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Time Slot Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => !isSaving && setShowAddModal(false)}>
          <div className="modal-content schedule-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Time Slot</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Day of Week</label>
                <select
                  value={newSlot.day}
                  onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value })}
                >
                  {daysOfWeek.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Time</label>
                  <input
                    type="time"
                    value={newSlot.startTime}
                    onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input
                    type="time"
                    value={newSlot.endTime}
                    onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Slots Per Hour</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={newSlot.slotsPerHour}
                  onChange={(e) => setNewSlot({ ...newSlot, slotsPerHour: parseInt(e.target.value) })}
                />
                <small>Number of appointment slots available each hour</small>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={newSlot.isActive}
                    onChange={(e) => setNewSlot({ ...newSlot, isActive: e.target.checked })}
                  />
                  <span>Active (available for scheduling)</span>
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowAddModal(false)}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                className="btn-save"
                onClick={handleAddSlot}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="spinner-small"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Add Time Slot
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

