import React, { useState, useEffect } from "react";
import { Calendar, Clock, Users, Dumbbell, ChevronLeft, ChevronRight, Plus, Trash2, Edit } from "lucide-react";
import api from "../../services/api";
import { useAuthUser } from "../../hooks/auth";

const LIGHT_OVERLAY_CLASSES =
  "fixed inset-0 z-50 flex items-center justify-center p-4 bg-muted bg-opacity-90 backdrop-blur-sm animate-fade-in";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Simple color mapping for workout types
const WORKOUT_COLORS = {
  "Yoga": "bg-purple-100 text-purple-700",
  "Pilates": "bg-green-100 text-green-700",
  "Aerobics": "bg-blue-100 text-blue-700",
  "Zumba": "bg-pink-100 text-pink-700",
  "Cross Circuit": "bg-orange-100 text-orange-700",
  "Kickboxing": "bg-red-100 text-red-700",
};

// Create Session Modal Component
const CreateSessionModal = ({ isOpen, onClose, onSessionCreated }) => {
  const [formData, setFormData] = useState({
    date: '',
    time: '08:00',
    duration: 60,
    type: 'Yoga',
    maxParticipants: 20
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const minDate = new Date().toISOString().split('T')[0];

  // Pre-fill date with today's date when modal opens
  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, date: dateStr }));
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/gym-sessions', formData);
      onSessionCreated(response.data);
      onClose();
      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        time: '08:00',
        duration: 60,
        type: 'Yoga',
        maxParticipants: 20
      });
    } catch (err) {
      console.error('Error creating session:', err);
      setError(err.response?.data?.error || 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={LIGHT_OVERLAY_CLASSES} onClick={onClose}>
      <div
        className="bg-white rounded-2xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-[#4C3BCF] mb-4">Create Gym Session</h3>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#736CED]"
              required
              min={minDate}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time
            </label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#736CED]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              min="15"
              max="180"
              value={formData.duration}
              onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#736CED]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Workout Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#736CED]"
            >
              {Object.keys(WORKOUT_COLORS).map(workoutType => (
                <option key={workoutType} value={workoutType}>{workoutType}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Participants
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={formData.maxParticipants}
              onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#736CED]"
              required
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#736CED] text-white rounded-lg hover:bg-[#4C3BCF] transition-colors disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Session"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Session Modal Component (only allows editing date, time, duration)
const EditSessionModal = ({ isOpen, onClose, onSessionUpdated, session }) => {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    duration: 60
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  
  useEffect(() => {
    if (isOpen && session) {
      setFormData({
        date: session.date,
        time: session.time,
        duration: session.duration
      });
      setError('');
    }
  }, [isOpen, session]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.put(`/gym-sessions/${session._id}`, formData);
      onSessionUpdated(response.data);
      onClose();
    } catch (err) {
      console.error('Error updating session:', err);
      setError(err.response?.data?.error || 'Failed to update session');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !session) return null;

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-[#4C3BCF] mb-4">Edit Gym Session</h3>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#736CED]"
              required
              min={minDate}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time
            </label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes)
            </label>
            <select
              value={formData.duration}
              onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
              <option value={90}>90 minutes</option>
              <option value={120}>120 minutes</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#4C3BCF] text-white py-2 px-4 rounded-lg hover:bg-[#3730A3] transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function GymSchedule() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSession, setSelectedSession] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const { user } = useAuthUser();

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const isEventsOffice = user && (user.role === "Events Office" || user.role === "Event office");
  
  const isUserRegistered = (session) => {
    if (!user || !session.registered) return false;
    return session.registered.some(reg => 
      (typeof reg === 'object' && reg._id === user._id) || reg === user._id
    );
  };

  useEffect(() => {
    fetchMonthSessions();
  }, [currentMonth, currentYear]);

  const fetchMonthSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const monthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
      const response = await api.get(`/gym-sessions/month/${monthStr}`);
      setSessions(response.data);
    } catch (err) {
      console.error("Error fetching gym sessions:", err);
      setError("Failed to load gym sessions");
    } finally {
      setLoading(false);
    }
  };

  const handleSessionCreated = (newSession) => {
    fetchMonthSessions();
  };

  const handleSessionUpdated = (updatedSession) => {
    setSessions(prevSessions => 
      prevSessions.map(session => 
        session._id === updatedSession._id ? updatedSession : session
      )
    );
    setSelectedSession(updatedSession);
    setShowEditModal(false);
  };

  const handleEditSession = (session) => {
    setSelectedSession(session);
    setShowEditModal(true);
  };

  const handleSessionDeleted = (sessionId) => {
    setSessions(prevSessions => prevSessions.filter(session => session._id !== sessionId));
    setSelectedSession(null);
  }

  const handleDeleteSession = async (sessionId) => {
    if (window.confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      try {
        await api.delete(`/gym-sessions/${sessionId}`);
        handleSessionDeleted(sessionId);
        alert('Session deleted successfully.');
      } catch (err) {
        console.error("Error deleting session:", err);
        alert(err.response?.data?.error || "Failed to delete session.");
      }
    }
  };

  /*
  const handleDeleteMonthSessions = async () => {
    if (window.confirm(`Are you sure you want to delete all sessions for ${MONTHS[currentMonth]} ${currentYear}? This action cannot be undone.`)) {
      setLoading(true);
      try {
        const monthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
        await api.delete(`/gym-sessions/month/${monthStr}`);
        await fetchMonthSessions();
        alert(`All sessions for ${MONTHS[currentMonth]} ${currentYear} have been deleted.`);
      } catch (err) {
        console.error("Error deleting month's sessions:", err);
        setError(err.response?.data?.error || "Failed to delete sessions for the month.");
      } finally {
        setLoading(false);
      }
    }
  };
  */

  const handleRegister = async (sessionId) => {
    if (!user) {
      alert("Please log in to register for gym sessions");
      return;
    }

    try {
      setRegistering(true);
      const response = await api.post(`/gym-sessions/${sessionId}/register`);
      
      if (selectedSession && selectedSession._id === sessionId) {
        setSelectedSession(response.data);
      }
      
      setSessions(prevSessions => 
        prevSessions.map(session => 
          session._id === sessionId ? response.data : session
        )
      );
      
      alert("Successfully registered for the session!");
    } catch (err) {
      console.error("Error registering for session:", err);
      alert(err.response?.data?.error || "Failed to register for session");
    } finally {
      setRegistering(false);
    }
  };

  const handleUnregister = async (sessionId) => {
    if (!user) {
      return;
    }

    try {
      setRegistering(true);
      const response = await api.post(`/gym-sessions/${sessionId}/unregister`);
      
      if (selectedSession && selectedSession._id === sessionId) {
        setSelectedSession(response.data);
      }
      
      setSessions(prevSessions => 
        prevSessions.map(session => 
          session._id === sessionId ? response.data : session
        )
      );
      
      alert("Successfully unregistered from the session!");
    } catch (err) {
      console.error("Error unregistering from session:", err);
      alert(err.response?.data?.error || "Failed to unregister from session");
    } finally {
      setRegistering(false);
    }
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentMonth + direction);
    setCurrentDate(newDate);
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getSessionsForDate = (day) => {
    if (!day) return [];
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return sessions.filter(session => 
      session.date.startsWith(dateStr)
    );
  };

  const formatTime = (timeStr) => {
    try {
      const [hours, minutes] = timeStr.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch (e) {
      return timeStr;
    }
  };

  return (
    <div className="min-h-screen bg-muted p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-[#4C3BCF]">Gym Schedule</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 rounded-full bg-[#736CED] text-white hover:bg-[#4C3BCF] transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-xl font-semibold text-[#312A68] min-w-[180px] text-center">
                {MONTHS[currentMonth]} {currentYear}
              </h2>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 rounded-full bg-[#736CED] text-white hover:bg-[#4C3BCF] transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Events Office Controls */}
          {isEventsOffice && (
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <Plus size={16} />
                Create Session
              </button>
              {/*
              {sessions.length > 0 && (
                <button
                  onClick={handleDeleteMonthSessions}
                  disabled={loading}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Trash2 size={16} />
                  Delete All Sessions
                </button>
              )}
              */}
            </div>
          )}
        </div>

        {/* Calendar */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#736CED] mb-4"></div>
            <p className="text-[#312A68]">Loading schedule...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={fetchMonthSessions}
              className="px-4 py-2 bg-[#736CED] text-white rounded-lg hover:bg-[#4C3BCF] transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-7 bg-[#736CED]">
              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                <div key={day} className="p-4 text-center text-white font-semibold">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {getDaysInMonth().map((day, index) => {
                const daySessions = getSessionsForDate(day);
                const isToday = day && 
                  new Date().getDate() === day && 
                  new Date().getMonth() === currentMonth && 
                  new Date().getFullYear() === currentYear;
                
                return (
                  <div
                    key={index}
                    className={`min-h-[120px] border-r border-b border-gray-200 p-2 transition-colors duration-150
                      ${!day ? 'bg-gray-50' : ''}
                      ${isToday ? 'ring-2 ring-[#4C3BCF] ring-inset' : ''}`}
                  >
                    {day && (
                      <>
                        <div className="text-sm font-semibold mb-2 text-gray-800">
                          {day}
                        </div>
                        
                        <div className="space-y-1">
                          {daySessions.map((session, sessionIndex) => {
                            const isRegistered = isUserRegistered(session);
                            const sessionDate = new Date(session.date);
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const isPast = sessionDate < today;
                            const sessionColor = WORKOUT_COLORS[session.type] || 'bg-gray-100 text-gray-700';

                            return (
                              <div
                                key={sessionIndex}
                                onClick={() => !isPast && setSelectedSession(session)}
                                className={`p-2 rounded text-xs transition-all ${isPast ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'} ${
                                  isRegistered 
                                    ? `bg-green-200 text-green-900 font-bold` 
                                    : `${sessionColor} hover:shadow-sm`
                                }`}
                              >
                                <div className="font-medium">
                                  {formatTime(session.time)} ({session.duration} min) - {session.type}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Session Details Modal */}
        {selectedSession && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
               <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-[#4C3BCF] mb-4">Session Details</h3>
                  {isEventsOffice && (
                     <div className="flex gap-2">
                        <button 
                           onClick={() => handleEditSession(selectedSession)} 
                           className="p-2 text-blue-500 hover:bg-blue-100 rounded-full transition-colors"
                           title="Edit Session"
                        >
                            <Edit size={20} />
                        </button>
                        <button 
                           onClick={() => handleDeleteSession(selectedSession._id)} 
                           className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                           title="Delete Session"
                        >
                            <Trash2 size={20} />
                        </button>
                     </div>
                  )}
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-[#736CED]" />
                  <span>{new Date(selectedSession.date).toLocaleDateString()}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-[#736CED]" />
                  <span>{formatTime(selectedSession.time)} ({selectedSession.duration} min)</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Users size={16} className="text-[#736CED]" />
                  <span>{selectedSession.registered?.length || 0}/{selectedSession.maxParticipants} registered</span>
                </div>

                <div className="flex items-center gap-3">
                  <Dumbbell size={16} className="text-[#736CED]" />
                  <span>{selectedSession.type}</span>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setSelectedSession(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                {user ? (
                  isUserRegistered(selectedSession) ? (
                    <button
                      onClick={() => handleUnregister(selectedSession._id)}
                      disabled={registering}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      {registering ? "Processing..." : "Unregister"}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRegister(selectedSession._id)}
                      disabled={registering || selectedSession.registered?.length >= selectedSession.maxParticipants}
                      className="flex-1 px-4 py-2 bg-[#736CED] text-white rounded-lg hover:bg-[#4C3BCF] transition-colors disabled:opacity-50"
                    >
                      {registering ? "Processing..." : selectedSession.registered?.length >= selectedSession.maxParticipants ? "Session Full" : "Register"}
                    </button>
                  )
                ) : (
                  <button
                    className="flex-1 px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed"
                    disabled
                  >
                    Login to Register
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Create Session Modal */}
        <CreateSessionModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSessionCreated={handleSessionCreated}
        />

        {/* Edit Session Modal */}
        <EditSessionModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSessionUpdated={handleSessionUpdated}
          session={selectedSession}
        />
      </div>
    </div>
  );
}

