import React, { useState, useEffect } from "react";
import { Calendar, Clock, Users, Dumbbell, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../../services/api";
import { useAuthUser } from "../../context/UserContext";

// Fixed weekly gym schedule - each day has a specific workout type
const FIXED_SCHEDULE = {
  0: { type: "Rest Day", icon: "🛌", color: "bg-gray-100", textColor: "text-gray-600" }, // Sunday
  1: { type: "Yoga", icon: "🧘‍♀️", color: "bg-purple-100", textColor: "text-purple-700" }, // Monday
  2: { type: "Pilates", icon: "💪", color: "bg-green-100", textColor: "text-green-700" }, // Tuesday
  3: { type: "Aerobics", icon: "🏃‍♀️", color: "bg-blue-100", textColor: "text-blue-700" }, // Wednesday
  4: { type: "Zumba", icon: "💃", color: "bg-pink-100", textColor: "text-pink-700" }, // Thursday
  5: { type: "Cross Circuit", icon: "🏋️‍♂️", color: "bg-orange-100", textColor: "text-orange-700" }, // Friday
  6: { type: "Kickboxing", icon: "🥊", color: "bg-red-100", textColor: "text-red-700" } // Saturday
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function GymSchedule() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSession, setSelectedSession] = useState(null);
  const [registering, setRegistering] = useState(false);

  const { user } = useAuthUser();

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Check if user is Events Office
  const isEventsOffice = user && (user.role === "Events Office" || user.role === "Event office");
  
  // Check if user is registered for a session
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
      
      // Format month as YYYY-MM for API call
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

  const generateSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const monthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
      await api.post(`/gym-sessions/generate/${monthStr}`);
      
      // Refresh the sessions after generating
      await fetchMonthSessions();
    } catch (err) {
      console.error("Error generating gym sessions:", err);
      if (err.response?.status === 403) {
        setError("Access denied. Only Events Office can generate gym sessions.");
      } else if (err.response?.status === 401) {
        setError("Please log in to generate gym sessions.");
      } else {
        setError(err.response?.data?.error || "Failed to generate gym sessions");
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteSessions = async () => {
    if (!confirm(`Are you sure you want to delete all gym sessions for ${MONTHS[currentMonth]} ${currentYear}? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const monthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
      await api.delete(`/gym-sessions/month/${monthStr}`);
      
      // Refresh the sessions after deleting
      await fetchMonthSessions();
      alert(`All sessions for ${MONTHS[currentMonth]} ${currentYear} have been deleted.`);
    } catch (err) {
      console.error("Error deleting gym sessions:", err);
      if (err.response?.status === 403) {
        setError("Access denied. Only Events Office can delete gym sessions.");
      } else if (err.response?.status === 401) {
        setError("Please log in to delete gym sessions.");
      } else {
        setError(err.response?.data?.error || "Failed to delete gym sessions");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (sessionId) => {
    if (!user) {
      alert("Please log in to register for gym sessions");
      return;
    }

    try {
      setRegistering(true);
      const response = await api.post(`/gym-sessions/${sessionId}/register`);
      
      // Update the selected session with the new data
      if (selectedSession && selectedSession._id === sessionId) {
        setSelectedSession(response.data);
      }
      
      // Update the sessions array with the new data
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
      
      // Update the selected session with the new data
      if (selectedSession && selectedSession._id === sessionId) {
        setSelectedSession(response.data);
      }
      
      // Update the sessions array with the new data
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
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
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

  const getWorkoutTypeForDay = (day) => {
    if (!day) return null;
    const date = new Date(currentYear, currentMonth, day);
    const dayOfWeek = date.getDay();
    return FIXED_SCHEDULE[dayOfWeek];
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
    <div className="min-h-screen bg-[#D5CFE1] p-4">
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
          {isEventsOffice && sessions.length > 0 && (
            <div className="flex gap-3 mb-4">
              <button
                onClick={generateSessions}
                disabled={loading}
                className="px-4 py-2 bg-[#736CED] text-white rounded-lg hover:bg-[#4C3BCF] transition-colors disabled:opacity-50"
              >
                {loading ? "Processing..." : "Regenerate Sessions"}
              </button>
              <button
                onClick={deleteSessions}
                disabled={loading}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {loading ? "Processing..." : "Delete All Sessions"}
              </button>
            </div>
          )}

          {/* Weekly Schedule Legend */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {Object.entries(FIXED_SCHEDULE).map(([dayNum, schedule]) => (
              <div
                key={dayNum}
                className={`${schedule.color} ${schedule.textColor} p-3 rounded-lg text-center text-sm font-medium`}
              >
                <div className="text-lg mb-1">{schedule.icon}</div>
                <div className="font-semibold">{schedule.type}</div>
                <div className="text-xs opacity-75">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayNum]}
                </div>
              </div>
            ))}
          </div>
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
        ) : sessions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <h3 className="text-xl font-semibold text-[#312A68] mb-4">No Sessions Scheduled</h3>
            <p className="text-gray-600 mb-6">
              No gym sessions have been generated for {MONTHS[currentMonth]} {currentYear} yet.
            </p>
            {isEventsOffice ? (
              <button
                onClick={generateSessions}
                className="px-6 py-3 bg-[#736CED] text-white rounded-lg hover:bg-[#4C3BCF] transition-colors font-semibold"
              >
                Generate Sessions for This Month
              </button>
            ) : (
              <p className="text-sm text-gray-500 italic">
                Please contact Events Office to schedule sessions for this month.
              </p>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Calendar Header */}
            <div className="grid grid-cols-7 bg-[#736CED]">
              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                <div key={day} className="p-4 text-center text-white font-semibold">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Body */}
            <div className="grid grid-cols-7">
              {getDaysInMonth().map((day, index) => {
                const workoutType = getWorkoutTypeForDay(day);
                const daySessions = getSessionsForDate(day);
                const isToday = day && 
                  new Date().getDate() === day && 
                  new Date().getMonth() === currentMonth && 
                  new Date().getFullYear() === currentYear;

                return (
                  <div
                    key={index}
                    className={`min-h-[120px] border-r border-b border-gray-200 p-2 ${
                      !day ? 'bg-gray-50' : workoutType ? workoutType.color : 'bg-white'
                    } ${isToday ? 'ring-2 ring-[#4C3BCF] ring-inset' : ''}`}
                  >
                    {day && (
                      <>
                        <div className={`text-sm font-semibold mb-2 ${workoutType ? workoutType.textColor : 'text-gray-900'}`}>
                          {day}
                          {isToday && <span className="ml-1 text-xs">(Today)</span>}
                        </div>
                        
                        {workoutType && workoutType.type !== 'Rest Day' && (
                          <div className={`text-xs font-medium mb-2 ${workoutType.textColor}`}>
                            <div className="flex items-center gap-1">
                              <span>{workoutType.icon}</span>
                              <span>{workoutType.type}</span>
                            </div>
                          </div>
                        )}

                        {daySessions.length > 0 ? (
                          <div className="space-y-1">
                            {daySessions.map((session, sessionIndex) => (
                              <div
                                key={sessionIndex}
                                onClick={() => setSelectedSession(session)}
                                className="bg-white bg-opacity-80 p-2 rounded text-xs cursor-pointer hover:bg-opacity-100 transition-all"
                              >
                                <div className="font-medium text-[#4C3BCF]">
                                  {formatTime(session.time)}
                                </div>
                                <div className="text-gray-600">
                                  {session.registered?.length || 0}/{session.maxParticipants}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : workoutType && workoutType.type !== 'Rest Day' && (
                          <div className="text-xs text-gray-500 italic">
                            No sessions scheduled
                          </div>
                        )}
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
              <h3 className="text-xl font-bold text-[#4C3BCF] mb-4">Session Details</h3>
              
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
      </div>
    </div>
  );
}
