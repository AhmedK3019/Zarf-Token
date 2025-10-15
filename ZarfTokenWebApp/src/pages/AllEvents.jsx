import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { useAuthUser } from "../hooks/auth";
import EventCard from "../components/EventCard";
import { getEventDetails, formatDate } from "./eventUtils";
import {
  Clock,
  MapPin,
  Calendar,
  Users,
  X,
  Building,
  Info,
  Globe,
} from "lucide-react";

// --- Details Modal Component (Defined within the same file) ---
const EventDetailsModal = ({ event: rawEvent, onClose }) => {
  if (!rawEvent) return null;

  const event = getEventDetails(rawEvent);

  const localFormatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  console.log("Bazaar booth debug:", {
    rawEvent,
    hasBazarId: !!rawEvent.bazarId,
    bazarIdType: typeof rawEvent.bazarId,
    bazarIdData: rawEvent.bazarId,
    startdate: rawEvent.bazarId?.startdate,
    enddate: rawEvent.bazarId?.enddate
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl m-4 max-h-[90vh] overflow-y-auto transform animate-slide-up">
        <div className="sticky top-0 bg-white/80 backdrop-blur-lg border-b border-gray-200 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-[#4C3BCF]">
              {event.name}
            </h2>
            <p className="text-sm text-[#312A68] flex items-center gap-2 mt-1">
              <Globe size={14} /> Platform Storefront
            </p>
            {rawEvent.status && <p className="text-xs mt-2 font-semibold text-gray-600">Status: {rawEvent.status}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="space-y-4 text-[#312A68]">
            <div className="flex items-start gap-3"><Info size={16} className="mt-1 text-[#736CED] flex-shrink-0" /><div><span className="font-semibold">Size:</span> {rawEvent.boothSize}</div></div>
            {rawEvent.location && <div className="flex items-start gap-3"><MapPin size={16} className="mt-1 text-[#736CED] flex-shrink-0" /><div><span className="font-semibold">Platform Location:</span> {rawEvent.location}</div></div>}
            {/* For bazaar booths - show start and end dates */}
            {rawEvent.type === 'booth' && rawEvent.isBazarBooth && rawEvent.bazarId ? (
              <>
                <div className="flex items-start gap-3">
                  <Clock size={16} className="mt-1 text-[#736CED] flex-shrink-0" />
                  <div>
                    <span className="font-semibold">Event Dates:</span>
                    {rawEvent.bazarId.startdate ? ` ${localFormatDate(new Date(rawEvent.bazarId.startdate))}` : 'N/A'}
                    {rawEvent.bazarId.enddate ? ` - ${localFormatDate(new Date(rawEvent.bazarId.enddate))}` : ''}
                  </div>
                </div>
              </>
            ) : (
              /* For platform booths - show duration */
              <div className="flex items-start gap-3">
                <Clock size={16} className="mt-1 text-[#736CED] flex-shrink-0" />
                <div><span className="font-semibold">Duration:</span> {rawEvent.duration} weeks</div>
              </div>
            )}
            {rawEvent.people && rawEvent.people.length > 0 && (
              <div className="flex items-start gap-3">
                <Users size={16} className="mt-1 text-[#736CED] flex-shrink-0" />
                <div>
                  <span className="font-semibold">Team Members:</span>
                  <ul className="mt-2 space-y-1">
                    {rawEvent.people.map((person, index) => (<li key={index} className="text-sm bg-gray-50 p-2 rounded"><strong>{person.name}</strong> - {person.email}</li>))}
                  </ul>
                </div>
              </div>
            )}
            {rawEvent.createdAt && <div className="flex items-start gap-3"><Calendar size={16} className="mt-1 text-[#736CED] flex-shrink-0" /><div><span className="font-semibold">Submitted:</span> {localFormatDate(rawEvent.createdAt)}</div></div>}
          </div>
        </div>
      </div>
    </div>
  );
};



const AllEvents = () => {
  const { category } = useParams();
  const [selectedCategory, setSelectedCategory] = useState(category || "all");
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuthUser();

  // Modal States
  const [selectedBazaar, setSelectedBazaar] = useState(null);
  const [bazaarBooths, setBazaarBooths] = useState([]);
  const [showBoothsModal, setShowBoothsModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerModalEvent, setRegisterModalEvent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [bazaarBoothsLoading, setBazaarBoothsLoading] = useState(false);

  const eventCategories = [
    { id: "all", name: "All Events" },
    { id: "workshops", name: "Workshops" },
    { id: "bazaars", name: "Bazaars" },
    { id: "trips", name: "Trips" },
    { id: "conferences", name: "Conferences" },
    { id: "booths", name: "Platform Booths" },
  ];

  // Fetch events based on category
  useEffect(() => {
    const fetchEventsByCategory = async () => {
      setLoading(true);
      setError(null);
      setEvents([]);
      setFilteredEvents([]);
      try {
        const endpoint = selectedCategory === "all" ? "/allEvents/getAllEvents" : `/allEvents/getEventsByType/${selectedCategory}`;
        const response = await api.get(endpoint);
        const eventsData = response.data || [];
        let visibleEvents;
        if (selectedCategory === 'booths') {
          // For booths category, only show platform booths (not bazaar booths)
          visibleEvents = eventsData.filter(event => event.type === 'booth' && !event.isBazarBooth);
        } else {
          // For all other categories, filter out bazaar booths and pending workshops
          visibleEvents = eventsData.filter(event =>
            (event.type !== 'booth' || !event.isBazarBooth) &&
            (event.type !== 'workshop' || event.status !== 'Pending')
          );
        }
        setEvents(visibleEvents);
        setFilteredEvents(visibleEvents);
      } catch (err) {
        setError("Failed to fetch events. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchEventsByCategory();
    setSearchTerm("");
  }, [selectedCategory]);

  // Search logic is handled in a separate effect for clarity
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredEvents(events);
      return;
    }
    const lowercasedSearch = searchTerm.toLowerCase().trim();
    const filtered = events.filter((rawEvent) => {
      // Use the utility to get consistent data for searching
      const event = getEventDetails(rawEvent);
      return (
        event.name?.toLowerCase().includes(lowercasedSearch) ||
        event.faculty?.toLowerCase().includes(lowercasedSearch) ||
        // Assuming professors array is populated with objects that have a 'name' property
        event.professors?.some((prof) => prof.name?.toLowerCase().includes(lowercasedSearch)) ||
        event.vendor?.toLowerCase().includes(lowercasedSearch) ||
        event.location?.toLowerCase().includes(lowercasedSearch) ||
        event.description?.toLowerCase().includes(lowercasedSearch)
      );
    });
    setFilteredEvents(filtered);
  }, [searchTerm, events]);


  // User Permissions are calculated once and stored in variables
  const userIsPrivileged = user?.role?.toLowerCase().includes("admin") || user?.role?.toLowerCase().includes("event");
  const userIsEligible = ["student", "professor", "staff", "ta"].some(role => user?.role?.toLowerCase().includes(role));

  // Event Handlers
  const handleDeleteEvent = async (event) => {
    // Confirm before deleting
    if (!window.confirm(`Are you sure you want to delete "${getEventDetails(event).name}"?`)) return;

    try {
      const endpoints = {
        bazaar: `/bazaars/deleteBazaar/${event._id}`,
        booth: `/booths/${event._id}`,
        conference: `/conferences/deleteConference/${event._id}`,
        workshop: `/workshops/deleteWorkshop/${event._id}`,
        trip: `/trips/deleteTrip/${event._id}`,
      };

      if (!endpoints[event.type]) throw new Error("Invalid event type for deletion.");

      await api.delete(endpoints[event.type]);

      // Update state optimistically to reflect the change immediately in the UI
      const updatedEvents = events.filter((e) => e._id !== event._id);
      setEvents(updatedEvents);

    } catch (err) {
      console.error("Delete API error:", err);
      // In a real app, you might show a notification to the user here
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
    
    // Add 3 second delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setBazaarBooths(res.data || []);
  } catch (err) { 
    console.error("Error fetching booths:", err);
    setBazaarBooths([]);
  } finally {
    setBazaarBoothsLoading(false);
  }
};

  const handleViewDetails = async (event) => {
    // If it's a bazaar booth and bazarId is just an ID, fetch the bazaar data first
    if (event.type === 'booth' && event.isBazarBooth && event.bazarId && typeof event.bazarId === 'string') {
      try {
        console.log("Fetching bazaar data for:", event.bazarId);
        const bazaarRes = await api.get(`/bazaars/getBazaar/${event.bazarId}`);
        console.log("Bazaar data received:", bazaarRes.data);

        // Merge the bazaar data into the event object and set it
        const updatedEvent = {
          ...event,
          bazarId: bazaarRes.data
        };
        setSelectedEvent(updatedEvent);
        setShowDetailsModal(true);
      } catch (err) {
        console.error("Error fetching bazaar data:", err);
        // Still show the modal even if bazaar fetch fails
        setSelectedEvent(event);
        setShowDetailsModal(true);
      }
    } else {
      // For non-bazaar booths or already populated data
      setSelectedEvent(event);
      setShowDetailsModal(true);
    }
  };

  // Registration Modal State and Logic
  const [regName, setRegName] = useState(user?.name || "");
  const [regEmail, setRegEmail] = useState(user?.email || "");
  const [regGucid, setRegGucid] = useState(user?.gucid || "");
  const [regError, setRegError] = useState(null);
  const [regLoading, setRegLoading] = useState(false);

  const closeRegisterModal = () => {
    setShowRegisterModal(false);
    setRegisterModalEvent(null);
    setRegError(null);
  }

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
        trip: `/trips/registerForaTrip/${_id}`
      }

      if (!endpoints[type]) {
        throw new Error("Registration for this event type is not supported");
      }

      await api.patch(endpoints[type], payload);

      alert("Registration successful!");
      closeRegisterModal();
      // Refetch events to show updated attendee count or disable register button
      const currentCategory = selectedCategory;
      setSelectedCategory(''); // Temporarily change to trigger useEffect
      setSelectedCategory(currentCategory);


    } catch (err) {
      setRegError(
        err?.response?.data?.message || err?.message || "Failed to register"
      );
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full overflow-hidden bg-[#D5CFE1] text-[#1F1B3B]">
      <main className="relative z-10 flex w-full flex-1 flex-col items-center px-6 py-8">
        <div className="w-full max-w-6xl">
          {/* Header and Search UI is kept here */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-[#736CED] sm:text-5xl mb-4">
              Campus Events & Booths
            </h1>
            <p className="text-lg text-[#312A68] max-w-2xl mx-auto">
              Discover amazing events and platform booths across campus.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {eventCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-6 py-3 rounded-full font-semibold transition-all ${selectedCategory === cat.id
                    ? "bg-[#736CED] text-white shadow-[0_10px_25px_rgba(115,108,237,0.3)]"
                    : "bg-white/70 text-[#736CED] border border-[#736CED] hover:bg-[#E7E1FF]"
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
          <div className="mb-12">
            <div className="relative max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Search events by name, faculty, location, and more..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 pr-12 rounded-full border border-[#736CED] bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#736CED]"
              />
            </div>
          </div>

          {/* Event rendering is now delegated to EventCard */}
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
            <p className="text-center py-12">No events found for this category.</p>
          )}
        </div>
      </main>

      {/* --- MODALS --- */}
      {showDetailsModal && selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setShowDetailsModal(false)}
        />
      )}

{showBoothsModal && selectedBazaar && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-[#4C3BCF]">
            Booths at {getEventDetails(selectedBazaar).name}
          </h2>
          <button 
            onClick={() => {
              setShowBoothsModal(false);
              setSelectedBazaar(null);
              setBazaarBooths([]);
              setBazaarBoothsLoading(false);
            }} 
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        
        {/* Loading Animation */}
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
              <div key={booth._id} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <h3 className="font-semibold text-[#4C3BCF] text-lg">
                  {booth.boothname || 'Unnamed Booth'}
                </h3>
                <p className="text-[#312A68] text-sm mt-1">
                  <strong>Vendor:</strong> {booth.vendorId?.companyname || 'N/A'} - {booth.vendorId?.email}
                </p>
                <p className="text-[#312A68] text-sm">
                  <strong>Booth Size:</strong> {booth.boothSize || 'N/A'}
                </p>
                
                {/* Team Members */}
                {booth.people && booth.people.length > 0 && (
                  <div className="mt-2">
                    <p className="text-[#312A68] text-sm font-semibold">Team Members:</p>
                    <ul className="text-[#312A68] text-sm ml-2">
                      {booth.people.map((person, index) => (
                        <li key={index}>• {person.name} ({person.email})</li>
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
)}
      {/* Registration Modal */}
      {showRegisterModal && registerModalEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#4C3BCF]">
                Register for {getEventDetails(registerModalEvent).name}
              </h2>
              <button onClick={closeRegisterModal} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
            </div>
            {regError && <p className="text-sm text-red-500 mb-2">{regError}</p>}
            <div className="space-y-3">
              <input value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Full name" className="w-full px-4 py-2 border rounded-md" />
              <input value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="Email" className="w-full px-4 py-2 border rounded-md" />
              <input value={regGucid} onChange={(e) => setRegGucid(e.target.value)} placeholder="GUC ID" className="w-full px-4 py-2 border rounded-md" />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={closeRegisterModal} className="px-4 py-2 rounded-full border">Cancel</button>
              <button onClick={submitRegistration} disabled={regLoading} className="px-4 py-2 rounded-full bg-[#2DD4BF] text-white hover:bg-[#14B8A6]">
                {regLoading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllEvents;

