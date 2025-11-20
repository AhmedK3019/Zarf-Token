import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { useAuthUser } from "../hooks/auth";
import EventCard from "../components/EventCard";
import { getEventDetails, formatDate } from "./eventUtils";
import EventDetailsModal from "../components/EventDetailsModal";
import { X, User, Star, MessageCircle, Trash2 } from "lucide-react";

const LIGHT_OVERLAY_CLASSES =
  "fixed inset-0 z-50 flex items-center justify-center p-4 bg-muted bg-opacity-90 backdrop-blur-sm animate-fade-in";

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
            X
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
    <div className={LIGHT_OVERLAY_CLASSES} onClick={onClose}>
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-[#4C3BCF]">
              Booths at {getEventDetails(selectedBazaar).name}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              X
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
                            -{" "}
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
  const [statusFilter, setStatusFilter] = useState("");
  const [regFilter, setRegFilter] = useState("");
  const [sortBy, setSortBy] = useState("date_added_desc");
  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal State
  const [selectedBazaar, setSelectedBazaar] = useState(null);
  const [bazaarBooths, setBazaarBooths] = useState([]);
  const [bazaarBoothsLoading, setBazaarBoothsLoading] = useState(false);
  const [showBoothsModal, setShowBoothsModal] = useState(false);

  // Rating and Comments Modal States
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showRatingsListModal, setShowRatingsListModal] = useState(false);
  const [selectedRatingEvent, setSelectedRatingEvent] = useState(null);
  const [hasAttended, setHasAttended] = useState(false); // Add attendance state
  const [comments, setComments] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  // Comment submission state
  const [newComment, setNewComment] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  // Refresh trigger for EventCard components
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
    { id: "all", name: "All Types" },
    { id: "workshops", name: "Workshops" },
    { id: "bazaars", name: "Bazaars" },
    { id: "trips", name: "Trips" },
    { id: "conferences", name: "Conferences" },
    { id: "booths", name: "Platform Booths" },
  ];

  const statusOptions = [
    { id: "", name: "All Status" },
    { id: "upcoming", name: "Upcoming" },
    { id: "past", name: "Past" },
  ];

  const regOptions = [
    { id: "", name: "All Registrations" },
    { id: "registered", name: "Registered" },
    { id: "not_registered", name: "Not Registered" },
  ];

  const sortOptions = [
    { id: "date_added_desc", name: "Date Added (Newest)" },
    { id: "date_added_asc", name: "Date Added (Oldest)" },
    { id: "event_date_asc", name: "Event Date (Upcoming)" },
    { id: "event_date_desc", name: "Event Date (Latest)" },
    { id: "alpha_asc", name: "Alphabetical (A-Z)" },
    { id: "alpha_desc", name: "Alphabetical (Z-A)" },
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
      if (!user?._id) {
        setFavKeys(new Set());
        return;
      }
      if (userIsPrivileged || !userIsEligible) {
        setFavKeys(new Set());
        return;
      }
      try {
        const res = await api.get(`/user/getFavourites/${user._id}`);
        const setKeys = new Set(
          (res?.data?.favourites || []).map((f) => `${f.itemType}:${f.itemId}`)
        );
        setFavKeys(setKeys);
      } catch (e) {
        // non-fatal
      }
    })();
  }, [user?._id]);

  // Fetch events based on category
  const fetchEventsByCategory = useCallback(async () => {
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
  }, [selectedCategory]);

  useEffect(() => {
    fetchEventsByCategory();
    setSearchTerm("");
  }, [selectedCategory, fetchEventsByCategory]);

  // Search, Filtering and Sorting (Favourite Events style)
  useEffect(() => {
    const lowercasedSearch = searchTerm.toLowerCase().trim();
    const now = new Date();

    const filtered = events
      .filter((rawEvent) => {
        const event = getEventDetails(rawEvent);

        const matchesSearch =
          !lowercasedSearch ||
          event.name?.toLowerCase().includes(lowercasedSearch) ||
          `${event.createdBy?.firstname || ""} ${event.createdBy?.lastname || ""}`
            .toLowerCase()
            .includes(lowercasedSearch) ||
          event.professors?.some((prof) =>
            `${prof.firstname} ${prof.lastname}`
              .toLowerCase()
              .includes(lowercasedSearch)
          ) ||
          event.type?.toLowerCase().includes(lowercasedSearch) ||
          event.location?.toLowerCase().includes(lowercasedSearch) ||
          event.vendor?.toLowerCase().includes(lowercasedSearch) ||
          event.original?.vendorId?.companyname
            ?.toLowerCase()
            .includes(lowercasedSearch);

        const eventStatus = event.startDate
          ? event.startDate > now
            ? "upcoming"
            : "past"
          : "unknown";
        const matchesStatus =
          !statusFilter || statusFilter === eventStatus;

        const isRegistered =
          Array.isArray(event.attendees) &&
          event.attendees.some(
            (attendee) =>
              attendee?.userId === user?._id ||
              attendee?._id === user?._id ||
              attendee?.userId?._id === user?._id
          );
        const matchesReg =
          !regFilter ||
          (regFilter === "registered" ? isRegistered : !isRegistered);

        return matchesSearch && matchesStatus && matchesReg;
      })
      .sort((a, b) => {
        const eventA = getEventDetails(a);
        const eventB = getEventDetails(b);

        const addedTime = (evt) =>
          new Date(
            evt.createdAt ||
              evt.created_at ||
              evt.original?.createdAt ||
              evt.original?.created_at ||
              evt.startDate ||
              0
          ).getTime();

        const eventDate = (evt) =>
          evt.startDate ? new Date(evt.startDate).getTime() : 0;

        switch (sortBy) {
          case "date_added_asc":
            return addedTime(eventA) - addedTime(eventB);
          case "event_date_asc":
            return eventDate(eventA) - eventDate(eventB);
          case "event_date_desc":
            return eventDate(eventB) - eventDate(eventA);
          case "alpha_asc":
            return (eventA.name || "").localeCompare(eventB.name || "");
          case "alpha_desc":
            return (eventB.name || "").localeCompare(eventA.name || "");
          case "date_added_desc":
          default:
            return addedTime(eventB) - addedTime(eventA);
        }
      });

    setFilteredEvents(filtered);
  }, [events, searchTerm, statusFilter, regFilter, sortBy, user?._id]);
  // ===== EVENT HANDLERS =====

  const handleToggleFavourite = async (raw) => {
    try {
      const key = `${raw.type}:${raw._id}`;
      const isFav = favKeys.has(key);
      if (isFav) {
        await api.post(`/user/removeFavourite/${user._id}`, {
          itemType: raw.type,
          itemId: raw._id,
        });
        const next = new Set(favKeys);
        next.delete(key);
        setFavKeys(next);
        setToastMsg("Removed from favorites");
        setToastType("success");
        setTimeout(() => setToastMsg(null), 1500);
      } else {
        await api.post(`/user/addFavourite/${user._id}`, {
          itemType: raw.type,
          itemId: raw._id,
        });
        const next = new Set(favKeys);
        next.add(key);
        setFavKeys(next);
        setToastMsg("Added to favorites");
        setToastType("success");
        setTimeout(() => setToastMsg(null), 1500);
      }
    } catch (e) {
      setToastMsg(e?.response?.data?.message || "Action failed");
      setToastType("error");
      setTimeout(() => setToastMsg(null), 2000);
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

  // Rating and Comments Handlers
  const handleViewComments = async (eventRaw, eventId, eventType) => {
    setSelectedRatingEvent(eventRaw);
    
    const attendees = getEventDetails(eventRaw).attendees;
    const userHasAttended = Array.isArray(attendees) 
      ? attendees.some((a) => 
          (a.userId === user?._id || a.userId?._id === user?._id) &&
          a.paid === true &&
          a.cancelled !== true
        ) 
      : false;
    
    setHasAttended(userHasAttended);
    setShowCommentsModal(true);

    setCommentsLoading(true);
    try {
      const response = await api.get(
        `/allEvents/viewAllComments/${eventId}/${eventType}`
      );
      setComments(response.data.userComments || []);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleRateEvent = async (eventRaw, eventId, eventType) => {
    setSelectedRatingEvent(eventRaw);
    
    const attendees = getEventDetails(eventRaw).attendees;
    const userHasAttended = Array.isArray(attendees) 
      ? attendees.some((a) => 
          (a.userId === user?._id || a.userId?._id === user?._id) &&
          a.paid === true &&
          a.cancelled !== true
        ) 
      : false;
    
    setHasAttended(userHasAttended);
    setShowRatingModal(true);

    setRatingsLoading(true);
    try {
      const response = await api.get(
        `/allEvents/viewAllRatings/${eventId}/${eventType}`
      );
      setRatings(response.data.ratings || []);

      // Check if user has already rated
      const existingRating = (response.data.ratings || []).find(
        (r) => r.userId === user?._id
      );
      setUserRating(existingRating ? existingRating.rating : 0);
    } catch (error) {
      console.error("Failed to fetch ratings:", error);
      setRatings([]);
      setUserRating(0);
    } finally {
      setRatingsLoading(false);
    }
  };

  const handleViewRatings = async (eventRaw, eventId, eventType) => {
    setSelectedEvent(eventRaw);
    setShowRatingsListModal(true);

    setRatingsLoading(true);
    try {
      const response = await api.get(
        `/allEvents/viewAllRatings/${eventId}/${eventType}`
      );
      setRatings(response.data.ratings || []);
    } catch (error) {
      console.error("Failed to fetch ratings:", error);
      setRatings([]);
    } finally {
      setRatingsLoading(false);
    }
  };

  const submitRating = async (rating) => {
    if (!user || !rating || rating < 1 || rating > 5 || !selectedRatingEvent)
      return;

    setRatingSubmitting(true);
    try {
      const eventDetails = getEventDetails(selectedRatingEvent);
      console.log("Submitting rating:", {
        rating,
        eventId: eventDetails.id,
        eventType: eventDetails.type,
      });

      await api.patch(
        `/allEvents/rateEvent/${eventDetails.id}/${eventDetails.type}`,
        { rating }
      );

      // Refresh ratings after submission
      const response = await api.get(
        `/allEvents/viewAllRatings/${eventDetails.id}/${eventDetails.type}`
      );
      setRatings(response.data.ratings || []);
      setUserRating(rating);
      setShowRatingModal(false);

      // Trigger refresh of all EventCard components
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to submit rating:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      alert(
        `Failed to submit rating: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setRatingSubmitting(false);
    }
  };

  const submitComment = async () => {
    if (!user || !newComment.trim() || !selectedRatingEvent) return;

    setCommentSubmitting(true);
    try {
      const eventDetails = getEventDetails(selectedRatingEvent);
      await api.patch(
        `/allEvents/addComment/${eventDetails.id}/${eventDetails.type}`,
        {
          comment: newComment.trim(),
        }
      );

      // Refresh comments after submission
      const response = await api.get(
        `/allEvents/viewAllComments/${eventDetails.id}/${eventDetails.type}`
      );
      setComments(response.data.userComments || []);
      setNewComment("");

      // Trigger refresh of all EventCard components
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to submit comment:", error);
      alert(
        `Failed to submit comment: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setCommentSubmitting(false);
    }
  };

  const closeCommentsModal = () => {
    setShowCommentsModal(false);
    setSelectedRatingEvent(null);
    setComments([]);
    setNewComment("");
  };

  const closeRatingModal = () => {
    setShowRatingModal(false);
    setSelectedRatingEvent(null);
    setRatings([]);
    setUserRating(0);
  };

  const closeRatingsListModal = () => {
    setShowRatingsListModal(false);
    setSelectedEvent(null);
  };

  const deleteComment = async (commentId) => {
    if (!selectedRatingEvent) return;

    // Show confirmation dialog
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this comment? This action cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      const eventDetails = getEventDetails(selectedRatingEvent);
      await api.delete(
        `/allEvents/deleteComment/${eventDetails.id}/${commentId}/${eventDetails.type}`
      );

      // Refresh comments after deletion
      const response = await api.get(
        `/allEvents/viewAllComments/${eventDetails.id}/${eventDetails.type}`
      );
      setComments(response.data.userComments || []);

      // Trigger refresh of all EventCard components
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to delete comment:", error);
      alert(
        `Failed to delete comment: ${
          error.response?.data?.message || error.message
        }`
      );
    }
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

      // Refresh events to reflect registration changes
      await fetchEventsByCategory();
      // Also bump refreshTrigger so child cards react if they rely on it
      setRefreshTrigger((prev) => prev + 1);
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
      <main className="w-full px-6 py-8">
        <div className="w-full max-w-7xl mx-auto space-y-4 mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by event name, professor, vendor, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-5 py-3 pr-12 text-[#312A68] placeholder-gray-500 shadow-sm focus:border-[#736CED] focus:outline-none focus:ring-2 focus:ring-[#736CED]/20"
            />
            <svg
              className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#736CED]"
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <select
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-[#312A68] shadow-sm focus:border-[#736CED] focus:outline-none focus:ring-2 focus:ring-[#736CED]/20"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {eventCategories.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
            <select
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-[#312A68] shadow-sm focus:border-[#736CED] focus:outline-none focus:ring-2 focus:ring-[#736CED]/20"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statusOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
            <select
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-[#312A68] shadow-sm focus:border-[#736CED] focus:outline-none focus:ring-2 focus:ring-[#736CED]/20"
              value={regFilter}
              onChange={(e) => setRegFilter(e.target.value)}
            >
              {regOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
            <select
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-[#312A68] shadow-sm focus:border-[#736CED] focus:outline-none focus:ring-2 focus:ring-[#736CED]/20"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {sortOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
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
          <div className="grid lg:grid-cols-3 gap-3">
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
                isFavourite={
                  favKeys.has(`${event.type}-${event._id}`) ||
                  favKeys.has(`${event.type}:${event._id}`)
                }
                onToggleFavourite={handleToggleFavourite}
                onViewComments={handleViewComments}
                onRateEvent={handleRateEvent}
                onViewRatings={handleViewRatings}
                refreshTrigger={refreshTrigger}
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
        {toastMsg && (
          <div
            className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-md text-white ${
              toastType === "error" ? "bg-red-600" : "bg-emerald-600"
            }`}
          >
            {toastMsg}
          </div>
        )}
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
      {/* Comments Modal */}
      {showCommentsModal && selectedRatingEvent && (
        <div className={LIGHT_OVERLAY_CLASSES} onClick={closeCommentsModal}>
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold text-[#4C3BCF]">
                Comments - {getEventDetails(selectedRatingEvent).name}
              </h3>
              <button
                onClick={closeCommentsModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {/* Comments List */}
            <div className="h-80 overflow-y-auto border-b">
              <div className="p-6">
                {commentsLoading ? (
                  <div className="text-center py-8 text-gray-600">
                    Loading comments...
                  </div>
                ) : comments.length > 0 ? (
                  <div className="space-y-4">
                    {comments.map((comment, index) => (
                      <div
                        key={index}
                        className="border-b border-gray-100 pb-3 last:border-b-0"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <User size={16} className="text-blue-600" />
                            </div>
                            <span className="font-medium text-gray-800">
                              {comment.userId?.firstname &&
                              comment.userId?.lastname
                                ? `${comment.userId.firstname} ${comment.userId.lastname}`
                                : comment.userId?.firstname ||
                                  comment.userId?.lastname ||
                                  "Anonymous"}
                            </span>
                          </div>
                          {/* Delete button - only visible to admins */}
                          {user?.role === "Admin" && (
                            <button
                              onClick={() => deleteComment(comment._id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                              title="Delete comment"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                        <p className="text-gray-700 ml-10">
                          {comment.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-600">
                    No comments yet. Be the first to leave a comment!
                  </div>
                )}
              </div>
            </div>

            {/* Add Comment Form - Only for regular users who attended */}
            {user?.role !== "Admin" && user?.role !== "Event office" && hasAttended && (
              <div className="p-6 border-t bg-gray-50">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Add a Comment
                </h4>
                <div className="flex gap-3">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts about this event..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4C3BCF] focus:border-transparent resize-none"
                    rows="3"
                    disabled={commentSubmitting}
                  />
                  <button
                    onClick={submitComment}
                    disabled={!newComment.trim() || commentSubmitting}
                    className="px-4 py-2 bg-[#4C3BCF] text-white rounded-lg hover:bg-[#3730A3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed h-fit"
                  >
                    {commentSubmitting ? "Posting..." : "Post"}
                  </button>
                </div>
              </div>
            )}
            
            {/* Message for non-attendees */}
            {user?.role !== "Admin" && user?.role !== "Event office" && !hasAttended && (
              <div className="p-6 border-t bg-gray-50">
                <div className="text-center text-gray-600">
                  <p className="mb-2">Only paid attendees who haven't cancelled can leave comments.</p>
                  <p className="text-sm">Register and attend this event to share your thoughts!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Rate Event Modal */}
      {showRatingModal && selectedRatingEvent && (
        <div className={LIGHT_OVERLAY_CLASSES} onClick={closeRatingModal}>
          <div
            className="bg-white rounded-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold text-[#4C3BCF]">
                Rate Event
              </h3>
              <button
                onClick={closeRatingModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <h4 className="font-semibold text-gray-800 mb-4">
                {getEventDetails(selectedRatingEvent).name}
              </h4>

              {/* Rating Input */}
              {hasAttended ? (
                <div className="text-center mb-6">
                  <p className="text-gray-600 mb-4">
                    How would you rate this event?
                  </p>
                  <div className="flex justify-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setUserRating(star)}
                        className="transition-colors"
                        disabled={ratingSubmitting}
                      >
                        <Star
                          size={32}
                          className={`${
                            star <= userRating
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300 hover:text-yellow-200"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {userRating > 0 && (
                    <p className="text-sm text-gray-600 mb-4">
                      You selected {userRating} star
                      {userRating !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center mb-6">
                  <p className="text-gray-600 mb-2">Only paid attendees who haven't cancelled can rate this event.</p>
                  <p className="text-sm text-gray-500">Register and attend this event to share your rating!</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={closeRatingModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={ratingSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={() => submitRating(userRating)}
                  disabled={userRating === 0 || ratingSubmitting}
                  className="flex-1 bg-[#4C3BCF] text-white py-2 px-4 rounded-lg hover:bg-[#3730A3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {ratingSubmitting ? "Submitting..." : "Submit Rating"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}      {/* Ratings List Modal */}
      {showRatingsListModal && selectedEvent && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={closeRatingsListModal}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Ratings for {getEventDetails(selectedEvent).name}
              </h3>
              <button
                onClick={closeRatingsListModal}
                className="text-gray-500 hover:text-gray-700"
              >
                X
              </button>
            </div>

            <div className="space-y-3">
              {ratingsLoading ? (
                <div className="text-center py-4">
                  <div className="text-gray-500">Loading ratings...</div>
                </div>
              ) : ratings && ratings.length > 0 ? (
                ratings.map((rating, index) => (
                  <div key={index} className="border-b border-gray-200 pb-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">
                        {rating.userId?.firstname && rating.userId?.lastname
                          ? `${rating.userId.firstname} ${rating.userId.lastname}`
                          : rating.userId?.firstname ||
                            rating.userId?.lastname ||
                            "Anonymous"}
                      </span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`text-lg ${
                              star <= rating.rating
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                          >
                            *
                          </span>
                        ))}
                      </div>
                    </div>
                    {rating.comment && (
                      <p className="text-gray-600 text-sm mt-1">
                        {rating.comment}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No ratings available for this event.
                </p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t">
              <button
                onClick={closeRatingsListModal}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllEvents;


