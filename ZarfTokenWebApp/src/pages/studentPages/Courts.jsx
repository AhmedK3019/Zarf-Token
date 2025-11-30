import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, ChevronLeft, ChevronRight, ArrowLeft, Clock } from "lucide-react";
import api from "../../services/api";
import { useAuthUser } from "../../hooks/auth";
import Football from "../../assets/FootBall.jpg";
import Tennis from "../../assets/Tennis.jpg";
import Basketball from "../../assets/Basketball.jpg";

const getCourtTheme = (type) => {
  const typeLower = type?.toLowerCase();

  // 1. Define Base Colors
  const colors = {
    football: "#1F1B3B",   // Dark Blue/Black
    basketball: "#F59E0B", // Orange
    tennis: "#10B981",     // Emerald Green
  };

  const baseColor = colors[typeLower] || "#736CED"; // Default purple

  // 2. Define Badge Style (Handles the gradient logic)
  let badgeStyle = {
    color: baseColor,
    backgroundColor: `${baseColor}20`, // Standard transparency
  };

  if (typeLower === "football") {
    badgeStyle = {
      color: baseColor,
      // The Black-to-White gradient you asked for
      backgroundImage: "linear-gradient(to right, rgba(0, 0, 0, 0.3), rgba(255, 255, 255, 0.3))",
      backgroundColor: "transparent", // Required for gradient to show
    };
  }

  return { color: baseColor, badgeStyle };
};


const Courts = () => {
  const { user } = useAuthUser();
  const navigate = useNavigate();
  const [courts, setCourts] = useState([]);
  const [filteredCourts, setFilteredCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [showSlotsModal, setShowSlotsModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCourtTheme, setSelectedCourtTheme] = useState(null);
  const dropdownRef = useRef(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  


  const courtCategories = [
    { id: "all", name: "All Courts" },
    { id: "basketball", name: "Basketball" },
    { id: "tennis", name: "Tennis" },
    { id: "football", name: "Football" },
  ];

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    const options = {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const formatFullDateTime = (isoString) => {
    const date = new Date(isoString);
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const fetchCourts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/courts");
      setCourts(response.data);
      setFilteredCourts(response.data);
    } catch (err) {
      setError("Failed to fetch courts. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourts();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter by category and search
  useEffect(() => {
    let filtered = courts;
    if (selectedCategory !== "all") {
      filtered = courts.filter(
        (court) => court.type?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (court) =>
          court.name?.toLowerCase().includes(searchLower) ||
          court.type?.toLowerCase().includes(searchLower)
      );
    }
    setFilteredCourts(filtered);
  }, [courts, selectedCategory, searchTerm]);

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    setIsDropdownOpen(false);
  };

  const handleSearch = (value) => setSearchTerm(value);
  const clearSearch = () => setSearchTerm("");

  const getAvailableSlots = (court) => {
    return (
      court.freeSlots?.filter(
        (slot) => !slot.isReserved && new Date(slot.dateTime) > new Date()
      ) || []
    );
  };

  const handleViewAllSlots = (court) => {
    const { color } = getCourtTheme(court.type);
    setSelectedCourt(court);
    setSelectedCourtTheme(color);
    setSelectedSlot(null);
    setBookingMessage("");
    setCurrentDate(new Date());
    setSelectedDate(null);
    setShowSlotsModal(true);
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
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
      days.push(new Date(year, month, day));
    }
    return days;
  };

  // Helper to filter slots for a specific calendar day
  const getSlotsForDate = (dateObj) => {
    if (!selectedCourt || !dateObj) return [];
    const dateStr = dateObj.toLocaleDateString("en-CA");
    return selectedCourt.freeSlots.filter(slot => {
      const slotDate = new Date(slot.dateTime).toLocaleDateString("en-CA");
      return slotDate === dateStr && !slot.isReserved && new Date(slot.dateTime) > new Date();
    });
  };

  // Helper to determine if the "Previous Month" arrow should be disabled
  const isPreviousMonthDisabled = () => {
    const today = new Date();
    const currentRealMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const currentViewStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    return currentViewStart <= currentRealMonthStart;
  };


  const closeSlotsModal = () => {
    setShowSlotsModal(false);
    setSelectedCourt(null);
    setSelectedSlot(null);
    setBookingMessage("");
    setSelectedCourtTheme(null);
    setShowSuccessToast(false);
  };

  const handleSlotSelect = (slot) => {
    if (slot.isReserved) return;
    setSelectedSlot(slot);
    setBookingMessage("");
  };

  // Booking flow
  const handleBookSlot = async () => {
    if (!selectedSlot || !selectedCourt || !user) return;
    setBookingLoading(true);
    setBookingMessage("");

    try {
      const studentData = {
        studentId: user._id,
        studentName: `${user.firstname} ${user.lastname}`,
        studentGucId: user.gucid,
      };

      // Ensure slot date is a valid ISO string
      const dateTime = new Date(selectedSlot.dateTime).toISOString();

      const payload = {
        courtId: selectedCourt._id,
        dateTime,
        ...studentData,
      };

      // Post to backend route (no need for /:id since controller uses req.body.courtId)
      const response = await api.post(
        `/courts/${selectedCourt._id}/reserve`,
        payload
      );

      // Update slot locally
      const updatedSlots = selectedCourt.freeSlots.map((slot) =>
        slot._id === selectedSlot._id ? { ...slot, isReserved: true } : slot
      );

      const updatedCourt = { ...selectedCourt, freeSlots: updatedSlots };

      setCourts((prev) =>
        prev.map((court) =>
          court._id === updatedCourt._id ? updatedCourt : court
        )
      );

      setSelectedCourt(updatedCourt);
      setSelectedSlot(null);
      setBookingMessage("");
      setShowSuccessToast(true);

      // Auto-hide success toast after 3 seconds
      setTimeout(() => {
        setShowSuccessToast(false);
      }, 3000);
    } catch (err) {
      console.error("Booking failed:", err.response?.data || err.message);
      setBookingMessage(
        `Booking failed: ${err.response?.data?.error || err.message}`
      );
    } finally {
      setBookingLoading(false);
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="min-h-screen w-full overflow-hidden bg-muted text-[#1F1B3B]">
      <div className="relative flex min-h-screen w-full flex-col items-center">
        <main className="relative z-10 flex w-full flex-1 flex-col items-center px-6 py-8">
          <div className="w-full">

            {/* Filters */}
            <div className="w-full flex justify-center mb-12">
              <div className="w-full max-w-5xl">
                <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-center mb-4">
                  <div className="flex justify-end w-full">
                    <button
                      onClick={() =>
                        navigate("/dashboard/user/my-reservations")
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 bg-[#4C3BCF] text-white hover:bg-[#3730A3] focus-visible:ring-[#4C3BCF]/50 shadow-[0_4px_14px_0_rgba(76,59,207,0.3)] hover:shadow-[0_6px_20px_0_rgba(76,59,207,0.4)]"
                    >
                      <Calendar className="h-4 w-4" />
                      View My Reservations
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-center">
                  {/* Court Type Dropdown */}
                  <div
                    ref={dropdownRef}
                    className="relative md:w-[260px] w-full"
                  >
                    <button
                      onClick={() => setIsDropdownOpen((prev) => !prev)}
                      className="flex w-full items-center justify-between gap-3 rounded-full border border-[#dcd9ff] bg-white/80 px-5 py-3 text-left font-semibold text-[#312A68] shadow-[0_8px_20px_rgba(115,108,237,0.12)] transition-all hover:border-[#b7b1ff] hover:shadow-[0_12px_28px_rgba(115,108,237,0.18)] focus:outline-none focus:ring-2 focus:ring-[#736CED]/40"
                    >
                      <span>
                        {
                          courtCategories.find(
                            (category) => category.id === selectedCategory
                          )?.name
                        }
                      </span>
                      <svg
                        className={`h-5 w-5 text-[#736CED] transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : "rotate-0"
                          }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    <div
                      className={`absolute left-0 right-0 z-20 mt-2 origin-top rounded-2xl border border-[#e7e3ff] bg-white/95 shadow-[0_14px_30px_rgba(115,108,237,0.18)] transition-all duration-200 ease-out ${isDropdownOpen
                          ? "opacity-100 translate-y-0 scale-100"
                          : "pointer-events-none -translate-y-1 scale-95 opacity-0"
                        }`}
                    >
                      <ul className="py-2">
                        {courtCategories.map((cat) => (
                          <li key={cat.id}>
                            <button
                              onClick={() => handleCategoryClick(cat.id)}
                              className={`flex w-full items-center justify-between px-5 py-3 text-sm font-semibold text-[#312A68] transition-colors ${selectedCategory === cat.id
                                  ? "bg-[#F3F1FF] text-[#4C3BCF]"
                                  : "hover:bg-[#F8F6FF]"
                                }`}
                            >
                              <span>{cat.name}</span>
                              {selectedCategory === cat.id && (
                                <span className="h-2.5 w-2.5 rounded-full bg-[#736CED]" />
                              )}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="flex-1">
                    <div className="relative w-full">
                      <input
                        type="text"
                        placeholder="Search by court name or type..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full rounded-full border border-[#dcd9ff] bg-white/80 px-6 py-3 pr-12 text-[#312A68] placeholder-[#312A68]/60 shadow-[0_8px_20px_rgba(115,108,237,0.12)] transition-all focus:border-[#b7b1ff] focus:outline-none focus:ring-2 focus:ring-[#736CED]/40 hover:shadow-[0_12px_28px_rgba(115,108,237,0.18)]"
                      />
                      <svg
                        className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#736CED]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                {searchTerm && (
                  <p className="mt-3 text-center text-sm text-[#312A68]/70">
                    Found {filteredCourts.length} result
                    {filteredCourts.length !== 1 ? "s" : ""} for "{searchTerm}"
                  </p>
                )}
              </div>
            </div>

            {/* Courts Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#736CED]"></div>
                <p className="mt-4 text-[#312A68]">Loading courts...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">{error}</div>
            ) : filteredCourts.length === 0 ? (
              <div className="text-center py-12">
                {searchTerm ? (
                  <div>
                    <p className="text-[#312A68] text-lg mb-4">
                      No courts found matching "{searchTerm}"
                    </p>
                    <button
                      onClick={clearSearch}
                      className="text-[#736CED] hover:text-[#5A4BBA] underline"
                    >
                      Clear search
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-6" />
                    <p className="text-[#312A68] text-lg mb-2">
                      No{" "}
                      {selectedCategory === "all"
                        ? "courts"
                        : selectedCategory + " courts"}{" "}
                      found.
                    </p>
                    <p className="text-[#312A68]/70">
                      Check back later for available court bookings.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {filteredCourts.map((court) => {
                  const availableSlots = getAvailableSlots(court);
                  const { color, badgeStyle } = getCourtTheme(court.type);
                  const courtImages = {
                    football: Football,
                    tennis: Tennis,
                    basketball: Basketball,
                  };
                  const courtTypeLower = court.type?.toLowerCase();
                  const imageSrc = courtImages[courtTypeLower] ? `url(${courtImages[courtTypeLower]})` : "none";
                  return (
                    <div
                      key={court._id}
                      className="relative overflow-hidden bg-white rounded-2xl p-6 shadow-[0_10px_25px_rgba(165,148,249,0.2)] border border-white/50 hover:shadow-[0_15px_35px_rgba(165,148,249,0.3)] transition-all hover:-translate-y-1"
                    >
                      {/* --- Background Image Layer --- */}
                      <div
                        className="absolute inset-0 z-0 opacity-60 bg-cover bg-center bg-no-repeat pointer-events-none"
                        style={{
                          backgroundImage:
                            imageSrc,
                        }}
                      />

                      <div
                        className="absolute inset-0 z-0 bg-[#001889]/30 pointer-events-none"
                      />

                      {/* --- Content Layer --- */}
                      <div className="relative z-10">
                        <div
                          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold mb-4 capitalize bg-[#EEE9FF]/80"
                          style={{
                            badgeStyle
                          }}
                        >
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <span className="capitalize" style={{ color }}>{court.type || "Court"}</span>
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-white shadow-sm" style={{ textShadow: '0 0 5px rgba(0,0,0,0.7), 0 0 1px rgba(0,0,0,0.5)' }}> {court.name}</h3>
                        <div className="mb-4">
                          <p
                            className="flex items-center gap-2 text-base text-white font-semibold"
                            style={{ textShadow: '0 0 4px rgba(0,0,0,0.8)' }}
                          >
                            <span className="inline-block h-2 w-2 rounded-full bg-white" />
                            {availableSlots.length} available slot
                            {availableSlots.length !== 1 ? "s" : ""}
                          </p>
                        </div>

                        {availableSlots.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <button
                              onClick={() => handleViewAllSlots(court)}
                              className="w-full text-xs bg-[#001889]/80 text-white px-4 py-2 rounded-full hover:bg-[#000f45]/80 transition-colors"
                            >
                              View All Available Times ({availableSlots.length})
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Updated Calendar Modal */}
      {showSlotsModal && selectedCourt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-muted bg-opacity-90 backdrop-blur-sm animate-fade-in"
          onClick={closeSlotsModal}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative p-6 bg-[#001889] text-white flex-shrink-0 overflow-hidden">
              
              {/* 1. Background Image Layer */}
              <div 
                className="absolute inset-0 bg-cover bg-center z-0 opacity-70"
                style={{ 
                  backgroundImage: (() => {
                    const type = selectedCourt.type?.toLowerCase();
                    if (type === 'football') return `url(${Football})`;
                    if (type === 'tennis') return `url(${Tennis})`;
                    if (type === 'basketball') return `url(${Basketball})`;
                    return 'none';
                  })()
                }}
              />
              
              {/* 2. Gradient Overlay (Ensures text readability) */}
              <div className="absolute inset-0 z-0" />

              {/* 3. Header Content (Relative z-10 to sit on top) */}
              <div className="relative z-10 flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {selectedDate && (
                    <button 
                      onClick={() => setSelectedDate(null)}
                      className="p-1 hover:bg-white/20 rounded-full transition-colors"
                    >
                      <ArrowLeft size={20} />
                    </button>
                  )}
                  <div>
                    <h2 className="text-xl font-bold text-white shadow-sm">{selectedCourt.name}</h2>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{backgroundColor: selectedCourtTheme, boxShadow: `0 0 8px ${selectedCourtTheme}`}}></span>
                      <p className="text-xs text-white/90 capitalize font-medium">{selectedCourt.type} Court</p>
                    </div>
                  </div>
                </div>
                <button onClick={closeSlotsModal} className="text-white/70 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 min-h-[400px]">
              
              {!selectedDate ? (
                /* --- VIEW 1: CALENDAR GRID --- */
                <div className="space-y-4">
                  {/* Month Navigation */}
                  <div className="flex items-center justify-between mb-6">
                    <button onClick={() => navigateMonth(-1)} disabled={isPreviousMonthDisabled()} className="p-2 hover:bg-gray-100 rounded-full  disabled:opacity-30 disabled:cursor-not-allowed"><ChevronLeft className="text-[#001889]" /></button>
                    <h3 className="text-lg font-bold text-[#312A68]">
                      {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-gray-100 rounded-full"><ChevronRight className="text-[#001889]" /></button>
                  </div>

                  {/* Days Header */}
                  <div className="grid grid-cols-7 text-center mb-2">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                      <span key={d} className="text-xs font-bold text-gray-400 uppercase">{d}</span>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-2">
                    {getDaysInMonth().map((dateObj, idx) => {
                      if (!dateObj) return <div key={idx} />; // Empty cell
                      
                      const daySlots = getSlotsForDate(dateObj);
                      const hasSlots = daySlots.length > 0;
                      const isPast = dateObj < new Date().setHours(0,0,0,0);
                      const isToday = dateObj.toDateString() === new Date().toDateString();

                      return (
                        <button
                          key={idx}
                          disabled={!hasSlots}
                          onClick={() => hasSlots && setSelectedDate(dateObj)}
                          className={`
                            h-12 w-full rounded-xl flex flex-col items-center justify-center relative transition-all border
                            ${isToday ? "border-[#736CED] bg-purple-50" : "border-transparent"}
                            ${hasSlots 
                              ? "bg-white border-gray-100 shadow-sm hover:border-[#736CED] hover:shadow-md cursor-pointer text-[#312A68]" 
                              : "text-gray-300 bg-gray-50 cursor-default"
                            }
                          `}
                        >
                          <span className={`text-sm ${hasSlots ? "font-bold" : ""}`}>{dateObj.getDate()}</span>
                          {hasSlots && (
                            <span className="w-1.5 h-1.5 rounded-full mt-1" style={{backgroundColor: selectedCourtTheme}}></span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  
                  <p className="text-center text-xs text-gray-400 mt-4">
                    Days with dots have available slots.
                  </p>
                </div>
              ) : (
                <div className="animate-fade-in">
                  <h3 className="text-lg font-bold text-[#312A68] mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#736CED]" />
                    {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {getSlotsForDate(selectedDate).sort((a,b) => new Date(a.dateTime) - new Date(b.dateTime)).map((slot) => {
                      const isSelected = selectedSlot?._id === slot._id;
                      return (
                        <button
                          key={slot._id}
                          onClick={() => handleSlotSelect(slot)}
                          className={`
                            flex items-center justify-between p-4 rounded-xl border transition-all w-full text-left group
                            ${isSelected 
                              ? "border-[#736CED] bg-[#EEE9FF] ring-1 ring-[#736CED]" 
                              : "border-gray-100 bg-white hover:border-[#736CED]/50 hover:bg-gray-50"
                            }
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isSelected ? "bg-[#736CED] text-white" : "bg-gray-100 text-gray-500 group-hover:text-[#736CED]"}`}>
                              <Clock size={18} />
                            </div>
                            <div>
                              <p className={`font-bold ${isSelected ? "text-[#312A68]" : "text-gray-700"}`}>
                                {new Date(slot.dateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              <p className="text-xs text-gray-500">60 Minutes</p>
                            </div>
                          </div>
                          
                          {isSelected && (
                            <div className="bg-[#736CED] text-white text-xs px-2 py-1 rounded">Selected</div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Booking Message Feedback */}
              {bookingMessage && (
                <div className={`mt-4 p-3 rounded-lg text-sm text-center font-medium ${bookingMessage.includes("failed") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
                  {bookingMessage}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={closeSlotsModal}
                className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBookSlot}
                disabled={!selectedSlot || bookingLoading || !user}
                className="px-6 py-2 bg-[#001889] text-white rounded-lg text-sm font-medium hover:bg-[#00126b] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200"
              >
                {bookingLoading ? "Confirming..." : "Confirm Booking"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast Notification */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <div className="flex-1">
              <h4 className="font-semibold">Booking Successful!</h4>
              <p className="text-sm opacity-90">
                Your court slot has been reserved.
              </p>
            </div>
            <button
              onClick={() => setShowSuccessToast(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Courts;
