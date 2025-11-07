import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { useAuthUser } from "../hooks/auth";
import EventCard from "../components/EventCard";
import { getEventDetails, formatDate } from "./eventUtils";
import EventDetailsModal from "../components/EventDetailsModal";

// ===== EXTRACTED MODAL COMPONENTS =====

const RegistrationModal = ({
  registerModalEvent,
  regName,
  setRegName,
  regEmail,
  setRegEmail,
  regGucid,
  setRegGucid,
  regError,
  regLoading,
  onClose,
  onSubmit,
}) => {
  if (!registerModalEvent) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#4C3BCF]">
            Register for {getEventDetails(registerModalEvent).name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        {regError && <p className="text-sm text-red-500 mb-2">{regError}</p>}
        <div className="space-y-3">
          <input
            value={regName}
            onChange={(e) => setRegName(e.target.value)}
            placeholder="Full name"
            className="w-full px-4 py-2 border rounded-md"
          />
          <input
            value={regEmail}
            onChange={(e) => setRegEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-md"
          />
          <input
            value={regGucid}
            onChange={(e) => setRegGucid(e.target.value)}
            placeholder="GUC ID"
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full border hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={regLoading}
            className="px-4 py-2 rounded-full bg-[#2DD4BF] text-white hover:bg-[#14B8A6]"
          >
            {regLoading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

const BoothsModalContent = ({
  selectedBazaar,
  bazaarBooths,
  bazaarBoothsLoading,
  onClose,
}) => {
  if (!selectedBazaar) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-[#4C3BCF]">
              Booths at {getEventDetails(selectedBazaar).name}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {bazaarBoothsLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#736CED] mb-4"></div>
              <p className="text-[#312A68]">Loading booths...</p>
            </div>
          ) : bazaarBooths.length === 0 ? (
            <div className="text-center text-[#312A68] py-8">
              <p>No booths available for this bazaar.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {bazaarBooths.map((booth) => (
                <div
                  key={booth._id}
                  className="border border-gray-200 rounded-xl p-4 bg-gray-50"
                >
                  <h3 className="font-semibold text-[#4C3BCF] text-lg">
                    {booth.boothname || "Unnamed Booth"}
                  </h3>
                  <p className="text-[#312A68] text-sm mt-1">
                    <strong>Vendor:</strong>{" "}
                    {booth.vendorId?.companyname || "N/A"}
                  </p>
                  <p className="text-[#312A68] text-sm">
                    <strong>Booth Size:</strong> {booth.boothSize || "N/A"}
                  </p>

                  {booth.people && booth.people.length > 0 && (
                    <div className="mt-2">
                      <p className="text-[#312A68] text-sm font-semibold">
                        Team Members:
                      </p>
                      <ul className="text-[#312A68] text-sm ml-2 space-y-1">
                        {booth.people.map((person, index) => (
                          <li key={index}>
                            •{" "}
                            {typeof person === "string" ? person : person.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ===== MAIN COMPONENT =====

const AllEvents = () => {
  const { category } = useParams();
  const { user } = useAuthUser();

  // Favourites state for heart toggle
  const [favKeys, setFavKeys] = useState(new Set());
  const [toastMsg, setToastMsg] = useState(null);
  const [toastType, setToastType] = useState("info");

  // ===== STATE GROUPS =====

  // Event Data State
  const [selectedCategory, setSelectedCategory] = useState(category || "all");
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterProfessor, setFilterProfessor] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [dateSort, setDateSort] = useState(""); // "newest", "oldest"
  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Modal State
  const [selectedBazaar, setSelectedBazaar] = useState(null);
  const [bazaarBooths, setBazaarBooths] = useState([]);
  const [bazaarBoothsLoading, setBazaarBoothsLoading] = useState(false);
  const [showBoothsModal, setShowBoothsModal] = useState(false);

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerModalEvent, setRegisterModalEvent] = useState(null);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Guard against race conditions when switching filters during initial load
  const lastFetchIdRef = useRef(0);

  // Registration Form State
  const [regName, setRegName] = useState(user?.name || "");
  const [regEmail, setRegEmail] = useState(user?.email || "");
  const [regGucid, setRegGucid] = useState(user?.gucid || "");
  const [regError, setRegError] = useState(null);
  const [regLoading, setRegLoading] = useState(false);

  // ===== CONSTANTS =====
  const eventCategories = [
    { id: "all", name: "All Events" },
    { id: "workshops", name: "Workshops" },
    { id: "bazaars", name: "Bazaars" },
    { id: "trips", name: "Trips" },
    { id: "conferences", name: "Conferences" },
    { id: "booths", name: "Platform Booths" },
  ];

  const filterableLocations = [
    "Cairo",
    "Alexandria",
    "Gouna",
    "Berlin",
    "Online",
  ];

  const filterableProfessors = [
    "Dr Mo salah",
    "Dr Marck",
    "Catherine",
  ];

  const userIsPrivileged =
    user?.role?.toLowerCase().includes("admin") ||
    user?.role?.toLowerCase().includes("event");
  const userIsEligible = ["student", "professor", "staff", "ta"].some((role) =>
    user?.role?.toLowerCase().includes(role)
  );

  // ===== EFFECTS =====

  // Fetch favourites for heart status
  useEffect(() => {
    (async () => {
      if (!user?._id) { setFavKeys(new Set()); return; }
      try {
        const res = await api.get(`/user/getFavourites/${user._id}`);
        const setKeys = new Set((res?.data?.favourites||[]).map(f => `${f.itemType}:${f.itemId}`));
        setFavKeys(setKeys);
      } catch (e) {
        // non-fatal
      }
    })();
  }, [user?._id]);

  // Fetch events based on category
  useEffect(() => {
    const fetchEventsByCategory = async () => {
      const fetchId = ++lastFetchIdRef.current;
      setLoading(true);
      setError(null);
      setEvents([]);
      setFilteredEvents([]);
      try {
        const endpoint =
          selectedCategory === "all"
            ? "/allEvents/getAllEvents"
            : `/allEvents/getEventsByType/${selectedCategory}`;
        const response = await api.get(endpoint);
        // Ignore if a newer request has been initiated
        if (fetchId !== lastFetchIdRef.current) return;
        const eventsData = response.data || [];
        let visibleEvents;
        if (selectedCategory === "booths") {
          visibleEvents = eventsData.filter(
            (event) => event.type === "booth" && !event.isBazarBooth
          );
        } else {
          visibleEvents = eventsData.filter(
            (event) =>
              (event.type !== "booth" || !event.isBazarBooth) &&
              (event.type !== "workshop" || event.status === "Approved")
          );
        }
        setEvents(visibleEvents);
        setFilteredEvents(visibleEvents);
      } catch (err) {
        // Only report errors for the latest request
        if (fetchId === lastFetchIdRef.current) {
          setError("Failed to fetch events. Please try again.");
        }
      } finally {
        if (fetchId === lastFetchIdRef.current) {
          setLoading(false);
        }
      }
    };
    fetchEventsByCategory();
    setSearchTerm("");
  }, [selectedCategory]);

// Search, Filtering and Sorting logic
useEffect(() => {
  // 1. Get all filter values
  const lowercasedSearch = searchTerm.toLowerCase().trim();
  const hasSearch = lowercasedSearch !== "";

  const lowercasedLocation = filterLocation.toLowerCase();
  const hasLocationFilter = lowercasedLocation !== "";

  const hasProfessorFilter = filterProfessor.toLowerCase() !== "";
  const lowercasedProfessor = filterProfessor.toLowerCase();
  
  const hasDateFilter = filterDate.trim() !== "";
  const hasStartDateFilter = startDateFilter.trim() !== "";
  const hasEndDateFilter = endDateFilter.trim() !== "";

  // 2. Apply all filters
  let filtered = events.filter((rawEvent) => {
    const event = getEventDetails(rawEvent);

    // Filter 1: Main Search Bar (Name, general text, etc.)
    let matchesSearch = true;
    if (hasSearch) {
      let searchtype = "";
      if (event.type === "booth") {
        searchtype = "platform booth";
      }
      matchesSearch =
        event.name?.toLowerCase().includes(lowercasedSearch) ||
        `${event.createdBy?.firstname} ${event.createdBy?.lastname}`
          .toLowerCase()
          .includes(lowercasedSearch) ||
        event.professors?.some((prof) =>
          `${prof.firstname} ${prof.lastname}`
            .toLowerCase()
            .includes(lowercasedSearch)
        ) ||
        event.type?.toLowerCase().includes(lowercasedSearch) ||
        searchtype.toLowerCase().includes(lowercasedSearch) ||
        event.location?.toLowerCase().includes(lowercasedSearch) ||
        event.vendor?.toLowerCase().includes(lowercasedSearch) ||
        (event.original?.vendorId?.companyname
          ?.toLowerCase()
          .includes(lowercasedSearch));
    }

    // Filter 2: Dedicated Location Filter
    const matchesLocation =
      !hasLocationFilter ||
      event.location?.toLowerCase().includes(lowercasedLocation);

    // Filter 3: Professor Filter
    let matchesProfessor = true;
    if (hasProfessorFilter) {
      if (event.type === "workshop" || event.type === "conference") {
        const conferenceProfMatch =
          event.type === "conference" &&
          event.professorname?.toLowerCase().includes(lowercasedProfessor);

        const workshopProfMatch =
          event.type === "workshop" &&
          event.professors?.some((prof) =>
            `${prof.firstname} ${prof.lastname}`
              .toLowerCase()
              .includes(lowercasedProfessor)
          );
        
        matchesProfessor = conferenceProfMatch || workshopProfMatch;
      } else {
        matchesProfessor = false; 
      }
    }

    // Filter 4: Specific Date Filter (exact match)
    let matchesDate = true;
    if (hasDateFilter && event.startDate) {
      const filterParts = filterDate.split("-").map(Number);
      const filterYear = filterParts[0];
      const filterMonth = filterParts[1] - 1;
      const filterDay = filterParts[2];

      const eventStartDate = new Date(event.startDate);
      const eventYear = eventStartDate.getFullYear();
      const eventMonth = eventStartDate.getMonth();
      const eventDay = eventStartDate.getDate();
      
      matchesDate = (eventYear === filterYear) && (eventMonth === filterMonth) && (eventDay === filterDay);
    }

    // Filter 5: Start Date Range Filter (INCLUSIVE - events on or after start date)
    let matchesStartDate = true;
    if (hasStartDateFilter && event.startDate) {
      const filterStartDate = new Date(startDateFilter);
      const eventStartDate = new Date(event.startDate);
      // Set both dates to midnight for proper inclusive comparison
      filterStartDate.setHours(0, 0, 0, 0);
      eventStartDate.setHours(0, 0, 0, 0);
      matchesStartDate = eventStartDate >= filterStartDate;
    }

    // Filter 6: End Date Range Filter (INCLUSIVE - events on or before end date)  
    let matchesEndDate = true;
    if (hasEndDateFilter && event.startDate) {
      const filterEndDate = new Date(endDateFilter);
      const eventStartDate = new Date(event.startDate);
      // Set both dates to midnight for proper inclusive comparison
      filterEndDate.setHours(0, 0, 0, 0);
      eventStartDate.setHours(0, 0, 0, 0);
      matchesEndDate = eventStartDate <= filterEndDate;
    }
    // Must match ALL active filters
    return matchesSearch && matchesLocation && matchesProfessor && matchesDate && matchesStartDate && matchesEndDate;
  });

  // 3. Apply Date Sorting
  if (dateSort) {
    filtered = filtered.sort((a, b) => {
      const eventA = getEventDetails(a);
      const eventB = getEventDetails(b);
      
      const dateA = eventA.startDate ? new Date(eventA.startDate) : new Date(0);
      const dateB = eventB.startDate ? new Date(eventB.startDate) : new Date(0);
      
      if (dateSort === "newest") {
        return dateB - dateA; // Most recent first
      } else if (dateSort === "oldest") {
        return dateA - dateB; // Oldest first
      }
      return 0;
    });
  }

  setFilteredEvents(filtered);
}, [searchTerm, events, filterLocation, filterProfessor, filterDate, startDateFilter, endDateFilter, dateSort]);
  // ===== EVENT HANDLERS =====

  const handleToggleFavourite = async (raw) => {
    try {
      const key = `${raw.type}:${raw._id}`;
      const isFav = favKeys.has(key);
      if (isFav) {
        await api.post(`/user/removeFavourite/${user._id}`, { itemType: raw.type, itemId: raw._id });
        const next = new Set(favKeys); next.delete(key); setFavKeys(next);
        setToastMsg('Removed from favorites'); setToastType('success'); setTimeout(()=>setToastMsg(null),1500);
      } else {
        await api.post(`/user/addFavourite/${user._id}`, { itemType: raw.type, itemId: raw._id });
        const next = new Set(favKeys); next.add(key); setFavKeys(next);
        setToastMsg('Added to favorites'); setToastType('success'); setTimeout(()=>setToastMsg(null),1500);
      }
    } catch (e) {
      setToastMsg(e?.response?.data?.message || 'Action failed'); setToastType('error'); setTimeout(()=>setToastMsg(null),2000);
    }
  };

  const handleDeleteEvent = async (event) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${getEventDetails(event).name}"?`
      )
    )
      return;

    try {
      const endpoints = {
        bazaar: `/bazaars/deleteBazaar/${event._id}`,
        booth: `/booths/${event._id}`,
        conference: `/conferences/deleteConference/${event._id}`,
        workshop: `/workshops/deleteWorkshop/${event._id}`,
        trip: `/trips/deleteTrip/${event._id}`,
      };

      if (!endpoints[event.type])
        throw new Error("Invalid event type for deletion.");
      await api.delete(endpoints[event.type]);

      const updatedEvents = events.filter((e) => e._id !== event._id);
      setEvents(updatedEvents);
    } catch (err) {
      console.error("Delete API error:", err);
      alert("Failed to delete the event. Please try again.");
    }
  };

  const handleRegisterEvent = (event) => {
    setRegisterModalEvent(event);
    setShowRegisterModal(true);
  };

  const handleViewBooths = async (bazaar) => {
    setSelectedBazaar(bazaar);
    setShowBoothsModal(true);
    setBazaarBoothsLoading(true);

    try {
      const bazaarId = bazaar._id || bazaar.id;
      const res = await api.get(`/booths/${bazaarId}`);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setBazaarBooths(res.data || []);
    } catch (err) {
      console.error("Error fetching booths:", err);
      setBazaarBooths([]);
    } finally {
      setBazaarBoothsLoading(false);
    }
  };

  const handleViewDetails = async (event) => {
    if (
      event.type === "booth" &&
      event.isBazarBooth &&
      event.bazarId &&
      typeof event.bazarId === "string"
    ) {
      try {
        console.log("Fetching bazaar data for:", event.bazarId);
        const bazaarRes = await api.get(`/bazaars/getBazaar/${event.bazarId}`);
        console.log("Bazaar data received:", bazaarRes.data);

        const updatedEvent = {
          ...event,
          bazarId: bazaarRes.data,
        };
        setSelectedEvent(updatedEvent);
        setShowDetailsModal(true);
      } catch (err) {
        console.error("Error fetching bazaar data:", err);
        setSelectedEvent(event);
        setShowDetailsModal(true);
      }
    } else {
      setSelectedEvent(event);
      setShowDetailsModal(true);
    }
  };

  // ===== MODAL HANDLERS =====

  const closeRegisterModal = () => {
    setShowRegisterModal(false);
    setRegisterModalEvent(null);
    setRegError(null);
  };

  const closeBoothsModal = () => {
    setShowBoothsModal(false);
    setSelectedBazaar(null);
    setBazaarBooths([]);
    setBazaarBoothsLoading(false);
  };

  const submitRegistration = async () => {
    if (!registerModalEvent) return;
    setRegError(null);
    setRegLoading(true);
    try {
      const payload = {
        firstname: regName.split(" ")[0] || regName,
        lastname: regName.split(" ").slice(1).join(" ") || "",
        gucid: regGucid,
        email: regEmail,
      };

      const { type, _id } = registerModalEvent;
      const endpoints = {
        workshop: `/workshops/registerForaWorkshop/${_id}`,
        trip: `/trips/registerForaTrip/${_id}`,
      };

      if (!endpoints[type]) {
        throw new Error("Registration for this event type is not supported");
      }

      await api.patch(endpoints[type], payload);
      alert("Registration successful!");
      closeRegisterModal();

      // Refetch events
      const currentCategory = selectedCategory;
      setSelectedCategory("");
      setSelectedCategory(currentCategory);
    } catch (err) {
      setRegError(
        err?.response?.data?.message || err?.message || "Failed to register"
      );
    } finally {
      setRegLoading(false);
    }
  };

  // ===== MAIN RENDER =====
  return (
    <div className="min-h-screen w-full bg-muted text-gray-800">
      <main className="w-full max-w-7xl mx-auto px-6 py-8">
        {/* Category Filters - Pill-shaped buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {eventCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-6 py-2.5 rounded-full font-medium text-sm transition-all ${
                selectedCategory === cat.id
                  ? "bg-[#4a4ae6] text-white shadow-md hover:bg-[#3d3dd4]"
                  : "bg-white text-gray-700 border-2 border-[#4a4ae6] hover:bg-gray-50"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

       {/* Search Bar with Filter Button */}
      <div className="mb-8">
        <div className="relative max-w-3xl mx-auto flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by event name, professor name, vendor, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-6 py-4 pr-14 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#4a4ae6] focus:border-transparent shadow-sm"
            />
            <svg
              className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          
          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-4 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4a4ae6] focus:border-transparent shadow-sm flex items-center gap-2"
          >
            <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>

        {/* Filters Dropdown */}
      {showFilters && (
        <div className="max-w-3xl mx-auto mt-4 p-6 bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Filter & Sort Events</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Basic Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Location Filter */}
            <div>
              <label htmlFor="filter-location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <select
                id="filter-location"
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#4a4ae6] focus:border-transparent"
              >
                <option value="">All Locations</option>
                {filterableLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Professor Filter */}
            <div>
              <label htmlFor="filter-professor" className="block text-sm font-medium text-gray-700 mb-1">
                Professor
              </label>
              <select
                id="filter-professor"
                value={filterProfessor}
                onChange={(e) => setFilterProfessor(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#4a4ae6] focus:border-transparent"
              >
                <option value="">All Professors</option>
                {filterableProfessors.map((prof) => (
                  <option key={prof} value={prof}>
                    {prof}
                  </option>
                ))}
              </select>
            </div>
          </div>

        {/* Date Filtering & Sorting Section */}
  <div className="border-t pt-4">
  <h4 className="text-md font-medium text-gray-800 mb-4">Date Options</h4>
  
  <div className="space-y-4">
    {/* Row 1: Filter Options */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Specific Date Filter */}
      <div>
        <label htmlFor="filter-date" className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Specific Date
        </label>
        <div className="relative max-w-xs">
          <input
            type="date"
            id="filter-date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#4a4ae6] focus:border-transparent"
          />
          {filterDate && (
            <button
              onClick={() => setFilterDate("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              title="Clear specific date"
            >
              <span className="text-xl">×</span>
            </button>
          )}
        </div>
      </div>

      {/* Date Sorting */}
      <div>
        <label htmlFor="date-sort" className="block text-sm font-medium text-gray-700 mb-2">
          Sort Events by Date
        </label>
        <div className="max-w-xs">
          <select
            id="date-sort"
            value={dateSort}
            onChange={(e) => setDateSort(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#4a4ae6] focus:border-transparent"
          >
            <option value="">No Date Sorting</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>
    </div>

    {/* Row 2: Date Range Filter */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Filter by Date Range
      </label>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 max-w-md">
        <div className="relative flex-1 min-w-[150px]">
          <input
            type="date"
            value={startDateFilter}
            onChange={(e) => setStartDateFilter(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#4a4ae6] focus:border-transparent"
            placeholder="Start date"
          />
        </div>
        
        <div className="hidden sm:block text-gray-500 font-medium">to</div>
        
        <div className="relative flex-1 min-w-[150px]">
          <input
            type="date"
            value={endDateFilter}
            onChange={(e) => setEndDateFilter(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#4a4ae6] focus:border-transparent"
            placeholder="End date"
          />
        </div>
      </div>
    </div>
  </div>
</div>
          {/* Clear Filters Button */}
          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
            </div>
            <button
              onClick={() => {
                setFilterLocation("");
                setFilterProfessor("");
                setFilterDate("");
                setStartDateFilter("");
                setEndDateFilter("");
                setDateSort("");
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}
      </div>
        
        {/* Events Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#4a4ae6]"></div>
            <p className="mt-4 text-gray-600">Loading events...</p>
          </div>
        ) : error ? (
          <p className="text-center py-12 text-red-500">{error}</p>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard
                key={`${event.type}-${event._id}`}
                event={event}
                user={user}
                userIsPrivileged={userIsPrivileged}
                userIsEligible={userIsEligible}
                onDelete={handleDeleteEvent}
                onRegister={handleRegisterEvent}
                onViewBooths={handleViewBooths}
                onViewDetails={handleViewDetails}
                isFavourite={favKeys.has(`${event.type}-${event._id}`) || favKeys.has(`${event.type}:${event._id}`)}
                onToggleFavourite={handleToggleFavourite}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No events found for this category.
            </p>
          </div>
        )}
      {toastMsg && (<div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-md text-white ${toastType==='error'?'bg-red-600':'bg-emerald-600'}`}>{toastMsg}</div>)}
      </main>

      {/* Modals */}
      {showDetailsModal && selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setShowDetailsModal(false)}
        />
      )}

      {showBoothsModal && (
        <BoothsModalContent
          selectedBazaar={selectedBazaar}
          bazaarBooths={bazaarBooths}
          bazaarBoothsLoading={bazaarBoothsLoading}
          onClose={closeBoothsModal}
        />
      )}

      {showRegisterModal && (
        <RegistrationModal
          registerModalEvent={registerModalEvent}
          regName={regName}
          setRegName={setRegName}
          regEmail={regEmail}
          setRegEmail={setRegEmail}
          regGucid={regGucid}
          setRegGucid={setRegGucid}
          regError={regError}
          regLoading={regLoading}
          onClose={closeRegisterModal}
          onSubmit={submitRegistration}
        />
      )}
    </div>
  );
};

export default AllEvents;
