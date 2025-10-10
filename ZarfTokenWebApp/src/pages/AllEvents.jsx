import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";
// import { useUserContext } from "../context/UserContext";

const AllEvents = () => {
  const { category } = useParams();
  const [selectedCategory, setSelectedCategory] = useState(category || "all");
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBazaar, setSelectedBazaar] = useState(null);
  const [bazaarBooths, setBazaarBooths] = useState([]);
  const [showBoothsModal, setShowBoothsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const eventCategories = [
    { id: "all", name: "All Events" },
    { id: "workshops", name: "Workshops" },
    { id: "bazaars", name: "Bazaars" },
    { id: "trips", name: "Trips" },
    { id: "conferences", name: "Conferences" },
    { id: "booths", name: "Platform Booths" },
  ];

  // Mock API data - replace with your actual API calls
  const mockEvents = {
    workshops: [
      {
        id: 1,
        name: "Web Development Workshop",
        location: "Tech Building Room 101",
        startdateandtime: "2024-03-15T10:00:00",
        enddateandtime: "2024-03-15T16:00:00",
        shortdescription: "Learn modern web development techniques",
        fullagenda: "HTML, CSS, JavaScript, React, and more...",
        facultyresponsible: "Dr. Smith",
        professorsparticipating: ["Dr. Smith", "Prof. Johnson"],
        registrationdeadline: "2024-03-10T23:59:00",
        type: "workshop",
        attendees: [{ id: 1, name: "Alice Johnson" }],
      },
      {
        id: 2,
        name: "AI & Machine Learning",
        location: "Science Center Lab 3",
        startdateandtime: "2024-03-20T14:00:00",
        enddateandtime: "2024-03-20T18:00:00",
        shortdescription: "Introduction to AI and ML concepts",
        fullagenda: "Neural networks, deep learning, practical applications",
        facultyresponsible: "Dr. Brown",
        professorsparticipating: ["Dr. Brown", "Prof. Davis"],
        registrationdeadline: "2024-03-15T23:59:00",
        type: "workshop",
        attendees: [],
      },
    ],
    bazaars: [
      {
        id: 1,
        name: "Spring Bazaar",
        location: "Student Union Courtyard",
        startdateandtime: "2024-03-25T09:00:00",
        enddateandtime: "2024-03-25T17:00:00",
        shortdescription: "Annual spring festival with food and crafts",
        registrationdeadline: "2024-03-20T23:59:00",
        type: "bazaar",
        booths: [
          { id: 1, name: "Artisan Crafts", vendor: "Local Artisans Group" },
          { id: 2, name: "Food Corner", vendor: "Campus Catering" },
          { id: 3, name: "Handmade Jewelry", vendor: "Creative Designs" },
        ],
      },
      {
        id: 2,
        name: "Artisan Market",
        location: "Main Quad",
        startdateandtime: "2024-04-05T10:00:00",
        enddateandtime: "2024-04-05T16:00:00",
        shortdescription: "Local artisans showcasing their work",
        registrationdeadline: "2024-03-30T23:59:00",
        type: "bazaar",
        booths: [
          { id: 4, name: "Pottery Display", vendor: "Clay Masters" },
          { id: 5, name: "Textile Arts", vendor: "Weaver's Guild" },
        ],
      },
    ],
    trips: [
      {
        id: 1,
        name: "Mountain Hiking Trip",
        price: "$25",
        location: "Blue Ridge Mountains",
        startdateandtime: "2024-03-30T07:00:00",
        enddateandtime: "2024-03-30T19:00:00",
        shortdescription: "Day trip to explore scenic mountain trails",
        registrationdeadline: "2024-03-25T23:59:00",
        type: "trips",
        attendees: [{ id: 1, name: "Alice Johnson" }],
      },
      {
        id: 2,
        name: "Museum Tour",
        price: "$15",
        location: "City Art Museum",
        startdateandtime: "2024-04-12T09:00:00",
        enddateandtime: "2024-04-12T15:00:00",
        shortdescription: "Guided tour of the city's premier art museum",
        registrationdeadline: "2024-04-07T23:59:00",
        type: "trips",
        attendees: [{ id: 1, name: "Alice Johnson" }],
      },
    ],
    conferences: [
      {
        id: 1,
        name: "Tech Innovation Summit 2024",
        startdateandtime: "2024-04-18T09:00:00",
        enddateandtime: "2024-04-19T17:00:00",
        shortdescription: "Exploring the future of technology and innovation",
        fullagenda: "Keynotes, panels, workshops, and networking sessions",
        conferencewebsitelink: "https://example.com/tech-summit",
        type: "conferences",
      },
      {
        id: 2,
        name: "Sustainability Conference",
        startdateandtime: "2024-05-05T10:00:00",
        enddateandtime: "2024-05-05T16:00:00",
        shortdescription: "Discussing sustainable practices for the future",
        fullagenda: "Expert talks, case studies, and solution workshops",
        conferencewebsitelink: "https://example.com/sustainability-conf",
        type: "conferences",
      },
    ],
    booths: [
      {
        id: 1,
        name: "Career Services Booth",
        location: "Student Services Building",
        shortdescription: "Get career advice and resume reviews",
        vendor: "University Career Center",
        hours: "Mon-Fri 9AM-5PM",
        contact: "career@university.edu",
        type: "booths",
      },
      {
        id: 2,
        name: "Library Research Help",
        location: "Main Library, 1st Floor",
        shortdescription: "Research assistance and citation help",
        vendor: "University Library",
        hours: "Mon-Thu 10AM-8PM, Fri 10AM-5PM",
        contact: "researchhelp@university.edu",
        type: "booths",
      },
      {
        id: 3,
        name: "IT Support Desk",
        location: "Tech Hub Building",
        shortdescription: "Technical support and software assistance",
        vendor: "University IT Department",
        hours: "24/7",
        contact: "itsupport@university.edu",
        type: "booths",
      },
    ],
  };

  // Simulate API call for events
  const fetchEvents = async (category) => {
    setLoading(true);
    setError(null);

    try {
      if (category === "all") {
        // Combine all events
        const allEvents = await api.get("/allEvents/getAllEvents");
        setEvents(allEvents);
        setFilteredEvents(allEvents.data);
      } else {
        const categoryEvents = await api.get(
          `/allEvents/getEventsByType/${category}`
        );
        setEvents(categoryEvents);
        setFilteredEvents(categoryEvents.data);
      }
    } catch (err) {
      setError("Failed to fetch events. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Simulate API call for platform booths
  const fetchPlatformBooths = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API delay
      const categoryEvents = await api.get(`/booths/platform`);

      setEvents(categoryEvents);
      setFilteredEvents(categoryEvents.data);
    } catch (err) {
      setError("Failed to fetch booths. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Simulate API call for bazaar booths
  const fetchBazaarBooths = async (bazaarId) => {
    try {
      const categoryEvents = await api.get(`/booths/${bazaarId}`);
      setBazaarBooths(categoryEvents.data);
    } catch (err) {
      setError("Failed to fetch bazaar booths. Please try again.");
    }
  };

  // Search function
  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);

    if (!searchValue.trim()) {
      setFilteredEvents(events);
      return;
    }

    const lowercasedSearch = searchValue.toLowerCase().trim();

    const filtered = events.filter((event) => {
      // Search in event name
      if (event.name?.toLowerCase().includes(lowercasedSearch)) {
        return true;
      }

      // Search in faculty responsible
      if (event.facultyresponsible?.toLowerCase().includes(lowercasedSearch)) {
        return true;
      }

      // Search in professors participating array
      if (
        event.professorsparticipating?.some((prof) =>
          prof.toLowerCase().includes(lowercasedSearch)
        )
      ) {
        return true;
      }

      // Search in vendor name for booths
      if (event.vendor?.toLowerCase().includes(lowercasedSearch)) {
        return true;
      }

      // Search in location
      if (event.location?.toLowerCase().includes(lowercasedSearch)) {
        return true;
      }

      // Search in short description
      if (event.shortdescription?.toLowerCase().includes(lowercasedSearch)) {
        return true;
      }

      return false;
    });

    setFilteredEvents(filtered);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
    setFilteredEvents(events);
  };

  useEffect(() => {
    if (selectedCategory === "booths") {
      fetchPlatformBooths();
    } else {
      fetchEvents(selectedCategory);
    }
    // Clear search when category changes
    setSearchTerm("");
  }, [selectedCategory]);

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleViewBooths = (bazaar) => {
    setSelectedBazaar(bazaar);
    fetchBazaarBooths(bazaar._id);
    setShowBoothsModal(true);
  };

  const closeBoothsModal = () => {
    setShowBoothsModal(false);
    setSelectedBazaar(null);
    setBazaarBooths([]);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // detect if current user has privilege to delete events
  // const { user } = useUserContext();
  const location = useLocation();
  // const userIsPrivileged = (() => {
  //   const role = user?.role || "";
  //   const fromRole =
  //     role.toLowerCase().includes("admin") ||
  //     role.toLowerCase().includes("event");
  //   const fromPath =
  //     location.pathname.toLowerCase().includes("admin") ||
  //     location.pathname.toLowerCase().includes("eventsoffice") ||
  //     location.pathname.toLowerCase().includes("events-office") ||
  //     location.pathname.toLowerCase().includes("events-office");
  //   return fromRole || fromPath;
  // })();
  const userIsPrivileged = true; // For testing, assume true

  const handleDeleteEvent = async (event) => {
    const ok = window.confirm(
      `Delete ${
        event.name || event.bazaarname || "item"
      }? This action cannot be undone.`
    );
    if (!ok) return;

    // Determine endpoint by type
    try {
      if (event.type === "bazaar") {
        // real backend endpoint
        await api.delete(`/bazaars/deleteBazaar/${event._id}`);
      } else if (event.type === "booth") {
        await api.delete(`/booths/${event._id}`);
      } else if (event.type === "conference") {
        await api.delete(`/conferences/deleteConference/${event._id}`);
      } else if (event.type === "workshop") {
        await api.delete(`/workshops/deleteWorkshop/${event._id}`);
      } else if (event.type === "trip") {
        await api.delete(`/trips/deleteTrip/${event._id}`);
      } else {
        // Not deletable by this rule
        throw new Error("Not deletable");
      }
      // if API succeeded, remove from local state
      setEvents((prev) =>
        prev.data.filter((e) => !(e._id === event._id && e.type === event.type))
      );

      // close modal if deleting selected bazaar
      if (
        showBoothsModal &&
        selectedBazaar &&
        selectedBazaar._id === event._id
      ) {
        closeBoothsModal();
      }
    } catch (err) {
      // If backend not available or call failed, fallback to local removal for mock data
      console.error("Delete API error:", err?.response || err?.message || err);
      // If the app uses mock data (no backend), just remove locally
      setEvents((prev) =>
        prev.data.filter((e) => !(e._id === event._id && e.type === event.type))
      );
      if (
        showBoothsModal &&
        selectedBazaar &&
        selectedBazaar._id === event._id
      ) {
        closeBoothsModal();
      }
    }
  };

  return (
    <div className="min-h-screen w-full overflow-hidden bg-[#D5CFE1] text-[#1F1B3B]">
      <div className="relative flex min-h-screen w-full flex-col items-center">
        <main className="relative z-10 flex w-full flex-1 flex-col items-center px-6 py-8">
          <div className="w-full max-w-6xl">
            {/* Header */}
            <div className="mb-12 text-center">
              <h1 className="text-4xl font-bold text-[#736CED] sm:text-5xl mb-4">
                Campus Events & Booths
              </h1>
              <p className="text-lg text-[#312A68] max-w-2xl mx-auto">
                Discover amazing events and platform booths across campus.
                Filter by category to find exactly what you're looking for.
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {eventCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`px-6 py-3 rounded-full font-semibold transition-all ${
                    selectedCategory === cat.id
                      ? "bg-[#736CED] text-white shadow-[0_10px_25px_rgba(115,108,237,0.3)]"
                      : "bg-white/70 text-[#736CED] border border-[#736CED] hover:bg-[#E7E1FF]"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="mb-12">
              <div className="relative max-w-2xl mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by event name, professor name, vendor, or location..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full px-6 py-4 pr-12 rounded-full border border-[#736CED] bg-white/70 text-[#312A68] placeholder-[#312A68]/60 focus:outline-none focus:ring-2 focus:ring-[#736CED] focus:border-transparent shadow-sm"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {searchTerm ? (
                      <button
                        onClick={clearSearch}
                        className="text-[#736CED] hover:text-[#5A4BBA] transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
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
                    ) : (
                      <svg
                        className="w-5 h-5 text-[#736CED]"
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
                    )}
                  </div>
                </div>
                {searchTerm && (
                  <p className="text-sm text-[#312A68]/70 mt-2 text-center">
                    Found {filteredEvents.length} result
                    {filteredEvents.length !== 1 ? "s" : ""} for "{searchTerm}"
                  </p>
                )}
              </div>
            </div>

            {/* Events Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#736CED]"></div>
                <p className="mt-4 text-[#312A68]">
                  Loading {selectedCategory}...
                </p>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">{error}</div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                {searchTerm ? (
                  <div>
                    <p className="text-[#312A68] text-lg mb-4">
                      No {selectedCategory} found matching "{searchTerm}"
                    </p>
                    <button
                      onClick={clearSearch}
                      className="text-[#736CED] hover:text-[#5A4BBA] underline"
                    >
                      Clear search
                    </button>
                  </div>
                ) : (
                  <p className="text-[#312A68] text-lg">
                    No {selectedCategory} found.
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {filteredEvents.map((event) => (
                  <div
                    key={`${event.type}-${event._id}`}
                    className="bg-white rounded-2xl p-6 shadow-[0_10px_25px_rgba(165,148,249,0.2)] border border-white/50 hover:shadow-[0_15px_35px_rgba(165,148,249,0.3)] transition-all hover:-translate-y-1"
                  >
                    {/* Event Type Badge */}
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#EEE9FF] px-3 py-1 text-xs font-medium text-[#5A4BBA] mb-4">
                      <span className="h-2 w-2 rounded-full bg-[#6DD3CE]" />
                      <span className="capitalize">{event.type}</span>
                    </div>

                    {/* Event Name */}
                    <h3 className="text-xl font-bold text-[#4C3BCF] mb-3">
                      {event.name}
                    </h3>

                    {/* Event Details */}
                    <div className="space-y-2 text-sm text-[#312A68]">
                      {event.location && (
                        <p className="flex items-center gap-2">
                          <span>📍</span>
                          {event.location}
                        </p>
                      )}

                      {event.price && (
                        <p className="flex items-center gap-2">
                          <span>💰</span>
                          Price: {event.price}
                        </p>
                      )}

                      {event.startdateandtime && (
                        <p className="flex items-center gap-2">
                          <span>🕐</span>
                          {formatDate(event.startdateandtime)}
                        </p>
                      )}

                      {event.hours && (
                        <p className="flex items-center gap-2">
                          <span>⏰</span>
                          Hours: {event.hours}
                        </p>
                      )}

                      {event.vendor && (
                        <p className="flex items-center gap-2">
                          <span>🏢</span>
                          Vendor: {event.vendor}
                        </p>
                      )}

                      {event.registrationdeadline && (
                        <p className="flex items-center gap-2 text-[#E53E3E]">
                          <span>⏰</span>
                          Register by: {formatDate(event.registrationdeadline)}
                        </p>
                      )}
                    </div>

                    {/* Short Description */}
                    <p className="mt-4 text-[#312A68] text-sm leading-relaxed">
                      {event.shortdescription}
                    </p>

                    {/* Additional Info based on event type */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      {event.type === "workshops" &&
                        event.facultyresponsible && (
                          <p className="text-xs text-[#312A68]/70">
                            Faculty: {event.facultyresponsible}
                          </p>
                        )}

                      {event.type === "workshops" &&
                        event.professorsparticipating &&
                        event.professorsparticipating.length > 0 && (
                          <p className="text-xs text-[#312A68]/70 mt-1">
                            Professors:{" "}
                            {event.professorsparticipating.join(", ")}
                          </p>
                        )}

                      {event.type === "conferences" &&
                        event.conferencewebsitelink && (
                          <a
                            href={event.conferencewebsitelink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#736CED] hover:underline"
                          >
                            Conference Website →
                          </a>
                        )}

                      {event.type === "booths" && event.contact && (
                        <p className="text-xs text-[#312A68]/70">
                          Contact: {event.contact}
                        </p>
                      )}

                      {/* View Booths Button for Bazaars */}
                      {event.type === "bazaars" && (
                        <button
                          onClick={() => handleViewBooths(event)}
                          className="mt-2 text-xs bg-[#736CED] text-white px-3 py-1 rounded-full hover:bg-[#5A4BBA] transition-colors"
                        >
                          View Booths ({event.booths?.length || 0})
                        </button>
                      )}
                      {/* Delete button for privileged users for bazaars/booths/conferences */}
                      {userIsPrivileged &&
                        (event.type === "bazaar" ||
                          event.type === "booth" ||
                          event.type === "conference" ||
                          (event.type === "workshop" &&
                            event.attendees.length === 0) ||
                          (event.type === "trip" &&
                            event.attendees.length === 0)) && (
                          <div className="mt-3">
                            <button
                              onClick={() => handleDeleteEvent(event)}
                              className="text-xs bg-rose-50 text-rose-700 px-3 py-1 rounded-full hover:bg-rose-100 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        <footer className="relative z-10 w-full px-6 py-6 text-center text-sm text-[#312A68]/80">
          {new Date().getFullYear()} Zarf Token. All rights reserved.
        </footer>

        <div className="pointer-events-none absolute bottom-[-12%] left-1/2 h-64 w-[130%] -translate-x-1/2 rounded-[50%] bg-gradient-to-r from-[#736CED] via-[#A594F9] to-[#6DD3CE] opacity-70 -z-10" />
      </div>

      {/* Booths Modal */}
      {showBoothsModal && selectedBazaar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-[#4C3BCF]">
                  Booths at {selectedBazaar.name}
                </h2>
                <button
                  onClick={closeBoothsModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <p className="text-[#312A68] mb-6">
                {selectedBazaar.shortdescription}
              </p>

              {bazaarBooths.length === 0 ? (
                <p className="text-center text-[#312A68] py-8">
                  No booths available for this bazaar.
                </p>
              ) : (
                <div className="grid gap-4">
                  {bazaarBooths.map((booth) => (
                    <div
                      key={booth._id}
                      className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                    >
                      <h3 className="font-semibold text-[#4C3BCF] text-lg">
                        {booth.name}
                      </h3>
                      <p className="text-[#312A68] text-sm mt-1">
                        Vendor: {booth.vendor}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeBoothsModal}
                  className="bg-[#736CED] text-white px-6 py-2 rounded-full hover:bg-[#5A4BBA] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllEvents;
