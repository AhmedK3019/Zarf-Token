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

  // ===== STATE GROUPS =====

  // Event Data State
  const [selectedCategory, setSelectedCategory] = useState(category || "all");
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const userIsPrivileged =
    user?.role?.toLowerCase().includes("admin") ||
    user?.role?.toLowerCase().includes("event");
  const userIsEligible = ["student", "professor", "staff", "ta"].some((role) =>
    user?.role?.toLowerCase().includes(role)
  );

  // ===== EFFECTS =====

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

  // Search logic
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredEvents(events);
      return;
    }
    const lowercasedSearch = searchTerm.toLowerCase().trim();
    const filtered = events.filter((rawEvent) => {
      const event = getEventDetails(rawEvent);
      let searchtype = "";
      if (event.type === "booth") {
        searchtype = "platform booth";
      }
      return (
        event.name?.toLowerCase().includes(lowercasedSearch) ||
        event.professors?.some((prof) =>
          `${prof.firstname} ${prof.lastname}`
            .toLowerCase()
            .includes(lowercasedSearch)
        ) ||
        event.type?.toLowerCase().includes(lowercasedSearch) ||
        searchtype.toLowerCase().includes(lowercasedSearch)
      );
    });
    setFilteredEvents(filtered);
  }, [searchTerm, events]);

  // ===== EVENT HANDLERS =====

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
    <div className="min-h-screen w-full overflow-hidden bg-[#D5CFE1] text-[#1F1B3B]">
      <main className="relative z-10 flex w-full flex-1 flex-col items-center px-6 py-8">
        <div className="w-full max-w-6xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-[#736CED] sm:text-5xl mb-4">
              Campus Events & Booths
            </h1>
            <p className="text-lg text-[#312A68] max-w-2xl mx-auto">
              Discover amazing events and platform booths across campus.
            </p>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {eventCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
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

          {/* Search */}
          <div className="mb-12">
            <div className="relative max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Search by event name, professor name, or event type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 pr-12 rounded-full border border-[#736CED] bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#736CED]"
              />
            </div>
          </div>

          {/* Events Grid */}
          {loading ? (
            <p className="text-center py-12">Loading events...</p>
          ) : error ? (
            <p className="text-center py-12 text-red-500">{error}</p>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
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
                />
              ))}
            </div>
          ) : (
            <p className="text-center py-12">
              No events found for this category.
            </p>
          )}
        </div>
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
