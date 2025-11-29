import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar } from "lucide-react";
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
    setShowSlotsModal(true);
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
                        <h3 className="text-xl font-bold mb-3"> {court.name}</h3>
                        <div className="mb-4">
                          <p className="flex items-center gap-2 text-sm text-[#001889]">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#001889]" />
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

      {/* Modal */}
      {showSlotsModal && selectedCourt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-muted bg-opacity-90 backdrop-blur-sm animate-fade-in"
          onClick={closeSlotsModal}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[#001889]">
                    {selectedCourt.name}
                  </h2>
                  <div className="inline-flex items-center gap-2 mt-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: selectedCourtTheme }} />
                    <span className="text-sm text-[#001889] capitalize font-medium">
                      {selectedCourt.type || "Court"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={closeSlotsModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1 min-h-0">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-[#312A68] mb-4">
                  All Available Time Slots
                </h3>
                <p className="text-sm text-[#312A68]/70 mb-6">
                  {getAvailableSlots(selectedCourt).length} available slots
                </p>
              </div>

              {getAvailableSlots(selectedCourt).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {getAvailableSlots(selectedCourt).map((slot) => {
                    const isSelected = selectedSlot?._id === slot._id;
                    return (
                      <div
                        key={slot._id}
                        onClick={() => handleSlotSelect(slot)}
                        className={`bg-[#F8F6FF] p-4 rounded-xl border transition-all cursor-pointer group ${isSelected
                            ? "border-[#736CED] bg-[#EEE9FF]"
                            : "border-[#E7E1FF]"
                          } ${slot.isReserved ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: selectedCourtTheme }}></div>
                          <div>
                            <p className="font-medium text-[#312A68] group-hover:text-[#4C3BCF]">
                              {formatFullDateTime(slot.dateTime)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-[#736CED] text-2xl"></span>
                  </div>
                  <p className="text-[#312A68] text-lg mb-2">
                    No Available Slots
                  </p>
                  <p className="text-[#312A68]/70 text-sm">
                    All slots are currently reserved or unavailable.
                  </p>
                </div>
              )}

              {bookingMessage && (
                <p
                  className={`mt-4 text-center font-medium ${bookingMessage.includes("")
                      ? "text-red-500"
                      : "text-green-600"
                    }`}
                >
                  {bookingMessage}
                </p>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex-shrink-0 flex justify-end gap-3">
              <button
                onClick={closeSlotsModal}
                className="px-6 py-2 text-[#736CED] border border-[#736CED] rounded-full hover:bg-[#E7E1FF] transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleBookSlot}
                disabled={!selectedSlot || bookingLoading || !user}
                className={`px-6 py-2 bg-[#001889]/80 text-white rounded-full transition-colors ${!selectedSlot || bookingLoading || !user
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-[#000f45]/80"
                  }`}
              >
                {bookingLoading
                  ? "Booking..."
                  : !user
                    ? "Please log in"
                    : "Book Slot"}
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
