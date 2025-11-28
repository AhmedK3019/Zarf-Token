import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuthUser } from "../../hooks/auth";
import EventCard from "../../components/EventCard";
import EventDetailsModal from "../../components/EventDetailsModal";
import { getEventDetails } from "../eventUtils";
import { User, X, Star, Trash2 } from "lucide-react";

const LIGHT_OVERLAY_CLASSES =
  "fixed inset-0 z-50 flex items-center justify-center p-4 bg-muted bg-opacity-90 backdrop-blur-sm animate-fade-in";

export default function RegisteredEvents() {
  const { user, refreshUser } = useAuthUser();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // favourites state (for heart toggle)
  const [favKeys, setFavKeys] = useState(new Set());

  // details & pay modal state
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payEvent, setPayEvent] = useState(null);

  // Rating and comments state
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showRatingsListModal, setShowRatingsListModal] = useState(false);
  const [selectedRatingEvent, setSelectedRatingEvent] = useState(null);
  const [hasAttended, setHasAttended] = useState(false); // Add attendance state
  const [comments, setComments] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [userRating, setUserRating] = useState(0);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [paySubmitting, setPaySubmitting] = useState(false);

  useEffect(() => {
    const fetchRegisteredEvents = async () => {
      try {
        const res = await api.get(
          `/allEvents/getEventsRegisteredByMe/${user._id}`
        );
        setEvents(res.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load registered events.");
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) fetchRegisteredEvents();
  }, [user]);

  // fetch favourites for heart toggle
  useEffect(() => {
    (async () => {
      if (!user?._id) {
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
      } else {
        await api.post(`/user/addFavourite/${user._id}`, {
          itemType: raw.type,
          itemId: raw._id,
        });
        const next = new Set(favKeys);
        next.add(key);
        setFavKeys(next);
      }
    } catch (e) {
      console.error("Favourite toggle error:", e);
    }
  };

  const handleViewDetails = async (event) => {
    // if it's a bazaar booth and bazar id is a string, fetch bazaar details (same behaviour as AllEvents)
    if (
      event.type === "booth" &&
      event.isBazarBooth &&
      event.bazarId &&
      typeof event.bazarId === "string"
    ) {
      try {
        const bazaarRes = await api.get(`/bazaars/getBazaar/${event.bazarId}`);
        const updatedEvent = { ...event, bazarId: bazaarRes.data };
        setSelectedEvent(updatedEvent);
        setShowDetailsModal(true);
      } catch (err) {
        setSelectedEvent(event);
        setShowDetailsModal(true);
      }
    } else {
      setSelectedEvent(event);
      setShowDetailsModal(true);
    }
  };

  const handleCancelRegistration = async (raw) => {
    try {
      const id = raw._id || raw.id;
      const endpoints = {
        workshop: `/workshops/cancelRegistration/${id}`,
        trip: `/trips/cancelRegistration/${id}`,
      };
      if (!endpoints[raw.type]) {
        alert("Cancellation not supported for this event type yet.");
        return;
      }
      await api.patch(endpoints[raw.type], { userId: user._id });
      // refresh registered events
      const res = await api.get(
        `/allEvents/getEventsRegisteredByMe/${user._id}`
      );
      setEvents(res.data || []);
      // Refresh user (wallet refund, etc.)
      await refreshUser();
    } catch (err) {
      console.error("Cancellation error:", err);
    }
  };

  const renderRegistrationControls = ({
    event,
    rawEvent,
    isRegistered,
    canRegister,
  }) => {
    // Robustly find attendee entry for current user (handles ObjectId, populated docs, strings)
    const toIdString = (val) => {
      if (!val) return null;
      if (typeof val === "string") return val;
      if (typeof val === "number") return String(val);
      if (typeof val === "object") {
        if (val._id) return String(val._id);
        if (
          typeof val.toString === "function" &&
          val.toString !== Object.prototype.toString
        ) {
          const s = val.toString();
          return typeof s === "string" && s !== "[object Object]" ? s : null;
        }
      }
      return null;
    };

    const getEntryUserId = (entry) => {
      if (!entry) return null;
      return (
        toIdString(entry.userId?._id) ||
        toIdString(entry.userId) ||
        toIdString(entry.user?._id) ||
        toIdString(entry.user) ||
        toIdString(entry._id) ||
        toIdString(entry)
      );
    };

    const userIdStr = toIdString(user?._id);

    const attendeesArr = Array.isArray(event.attendees)
      ? event.attendees
      : Array.isArray(rawEvent?.attendees)
      ? rawEvent.attendees
      : Array.isArray(event.original?.attendees)
      ? event.original.attendees
      : [];

    const registeredArr = Array.isArray(event.registered)
      ? event.registered
      : Array.isArray(rawEvent?.registered)
      ? rawEvent.registered
      : Array.isArray(event.original?.registered)
      ? event.original.registered
      : [];

    let attendee = userIdStr
      ? attendeesArr.find((a) => getEntryUserId(a) === userIdStr) ||
        registeredArr.find((r) => getEntryUserId(r) === userIdStr)
      : null;
    const now = Date.now();
    const startDate = event.startDate ? new Date(event.startDate) : null;

    if (!attendee) return null;
    const paid = Boolean(attendee.paid);

    // 1) Registered & paid & upcoming -> show 'Registered'
    if (paid && startDate) {
      const twoWeeks = 1000 * 60 * 60 * 24 * 14;
      if (startDate.getTime() - now >= twoWeeks) {
        return (
          <button
            onClick={() => handleCancelRegistration(rawEvent)}
            className="w-full rounded-lg px-4 py-2 text-sm font-semibold text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 border border-gray-200 focus-visible:ring-gray-200 bg-red-50 text-red-700 hover:bg-red-100"
          >
            Cancel registration
          </button>
        );
      }

      // otherwise upcoming and within 2 weeks -> show Registered
      if (startDate.getTime() > now) {
        return (
          <button
            disabled
            className="w-full rounded-lg px-4 py-2 text-sm font-semibold text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 cursor-not-allowed border border-gray-200 bg-gray-50 text-[#555] focus-visible:ring-gray-200"
          >
            Registered
          </button>
        );
      }
    }

    // 2) Registered but NOT paid & upcoming -> show Pay button (opens placeholder modal)
    if (!paid && startDate && startDate.getTime() > now) {
      return (
        <button
          onClick={() => {
            setPayEvent(rawEvent);
            setShowPayModal(true);
          }}
          className="w-full text-sm bg-[#f59e0b] text-white px-4 py-2 rounded-lg hover:bg-[#d97706] transition-colors font-medium"
        >
          Pay {event.price || event.requiredFunding} EGP
        </button>
      );
    }

    // 3) Registered & not paid & event passed -> Registration canceled
    if (!paid && startDate && startDate.getTime() <= now) {
      return (
        <button
          disabled
          className="w-full rounded-lg px-4 py-2 text-sm font-semibold text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 cursor-not-allowed border border-gray-200 focus-visible:ring-gray-200 bg-red-50 text-red-700"
        >
          Registration canceled
        </button>
      );
    }

    return null;
  };

  // Rating and Comments Handlers
  const handleViewComments = async (eventRaw, eventId, eventType) => {
    setSelectedRatingEvent(eventRaw);

    // Calculate attendance once here
    const attendees = getEventDetails(eventRaw).attendees;
    const userHasAttended = Array.isArray(attendees)
      ? attendees.some(
          (a) =>
            (a.userId === user?._id || a.userId?._id === user?._id) &&
            a.paid === true &&
            a.cancelled !== true &&
            getEventDetails(eventRaw).startDate < new Date()
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

    // Calculate attendance once here
    const attendees = getEventDetails(eventRaw).attendees;
    const userHasAttended = Array.isArray(attendees)
      ? attendees.some(
          (a) =>
            (a.userId === user?._id || a.userId?._id === user?._id) &&
            a.paid === true &&
            a.cancelled !== true &&
            getEventDetails(eventRaw).startDate < new Date()
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

  const submitRating = async (rating) => {
    if (!user || !rating || rating < 1 || rating > 5 || !selectedRatingEvent)
      return;

    setRatingSubmitting(true);
    try {
      const eventDetails = getEventDetails(selectedRatingEvent);
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

  const deleteComment = async (commentId) => {
    if (!selectedRatingEvent) return;

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

  const closeCommentsModal = () => {
    setShowCommentsModal(false);
    setSelectedRatingEvent(null);
    setHasAttended(false); // Reset attendance state
    setComments([]);
    setNewComment("");
  };

  const closeRatingModal = () => {
    setShowRatingModal(false);
    setSelectedRatingEvent(null);
    setHasAttended(false); // Reset attendance state
    setRatings([]);
    setUserRating(0);
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

  const closeRatingsListModal = () => {
    setShowRatingsListModal(false);
    setSelectedEvent(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-muted flex items-center justify-center text-[#736CED]">
        Loading your registered events...
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-hidden bg-muted text-[#1F1B3B]">
      <div className="relative flex min-h-screen w-full flex-col items-center">
        <main className="relative z-10 flex w-full flex-1 flex-col items-center px-6 py-8">
          <div className="w-full">
            {error && (
              <div className="mb-8 text-center">
                <p className="max-w-2xl mx-auto text-[#9F2D20] bg-[#FEE2E2] border border-[#FCA5A5] rounded-lg px-4 py-2">
                  {error}
                </p>
              </div>
            )}

            {events.length === 0 ? (
              <div className="text-center text-[#312A68]/70 py-16 bg-white/50 rounded-3xl">
                You haven’t registered for any events yet.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                  <EventCard
                    key={`${event.type}-${event._id}`}
                    event={event}
                    user={user}
                    userIsPrivileged={false} // regular users can't delete/update
                    userIsEligible={true}
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
                    renderRegistrationControls={renderRegistrationControls}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
        {/* Details Modal */}
        {showDetailsModal && selectedEvent && (
          <EventDetailsModal
            event={selectedEvent}
            onClose={() => setShowDetailsModal(false)}
          />
        )}
        {/* Pay placeholder modal */}
        {showPayModal &&
          payEvent &&
          (() => {
            const details = getEventDetails(payEvent);
            const amount =
              details.price && details.price > 0
                ? details.price
                : details.requiredFunding || 0;
            const walletBalance = Number(user?.wallet ?? 0);
            const canPayWallet = walletBalance >= amount && amount > 0;

            const refreshRegistered = async () => {
              try {
                const res = await api.get(
                  `/allEvents/getEventsRegisteredByMe/${user._id}`
                );
                setEvents(res.data || []);
              } catch (_) {}
            };

            const handlePayWithWallet = async () => {
              if (!canPayWallet) return;
              setPaySubmitting(true);
              try {
                const endpointMap = {
                  workshop: `/workshops/payForWorkshop/${details.id}`,
                  trip: `/trips/payForTrip/${details.id}`,
                };
                const ep = endpointMap[details.type];
                if (!ep)
                  throw new Error("Wallet payment not supported for this type");
                await api.post(ep, { method: "wallet" });
                setShowPayModal(false);
                await refreshRegistered();
                // Wallet deducted, refresh user object
                await refreshUser();
              } catch (e) {
                console.error("Wallet payment error:", e);
              } finally {
                setPaySubmitting(false);
              }
            };

            const handlePayWithStripe = async () => {
              setPaySubmitting(true);
              try {
                const endpointMap = {
                  workshop: `/workshops/payForWorkshop/${details.id}`,
                  trip: `/trips/payForTrip/${details.id}`,
                };
                const ep = endpointMap[details.type];
                if (!ep)
                  throw new Error("Stripe payment not supported for this type");
                const { data } = await api.post(ep, { method: "stripe" });
                if (data?.url) {
                  // redirect to Stripe Checkout
                  window.location.href = data.url;
                } else {
                  throw new Error("Stripe session URL missing");
                }
              } catch (e) {
                console.error("Stripe payment error:", e);
              } finally {
                setPaySubmitting(false);
              }
            };

            return (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-muted bg-opacity-90 backdrop-blur-sm animate-fade-in"
                onClick={() => setShowPayModal(false)}
              >
                <div
                  className="bg-white rounded-2xl max-w-lg w-full p-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-[#4a4ae6]">
                      Pay for {details.name}
                    </h2>
                    <button
                      onClick={() => setShowPayModal(false)}
                      className="text-gray-500 hover:text-gray-700"
                      aria-label="Close"
                    >
                      <X size={22} />
                    </button>
                  </div>

                  <div className="mb-4 text-sm text-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Amount due</span>
                      <span className="font-semibold">{amount} EGP</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-gray-600">Wallet balance</span>
                      <span className="font-semibold">
                        {walletBalance.toFixed(2)} EGP
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      onClick={handlePayWithWallet}
                      disabled={!canPayWallet || paySubmitting}
                      className={`w-full rounded-lg px-4 py-3 text-sm font-semibold text-center transition border ${
                        canPayWallet
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                      }`}
                      title={
                        canPayWallet
                          ? "Pay using wallet"
                          : "Insufficient wallet balance"
                      }
                    >
                      {paySubmitting ? "Processing..." : "Pay with Wallet"}
                    </button>

                    <button
                      onClick={handlePayWithStripe}
                      disabled={paySubmitting}
                      className="w-full rounded-lg px-4 py-3 text-sm font-semibold text-center transition bg-[#4C3BCF] text-white hover:bg-[#3730A3]"
                    >
                      {paySubmitting ? "Processing..." : "Pay with Card"}
                    </button>
                  </div>

                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      onClick={() => setShowPayModal(false)}
                      className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
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
              {user?.role !== "Admin" &&
                user?.role !== "Event office" &&
                hasAttended && (
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
              {user?.role !== "Admin" &&
                user?.role !== "Event office" &&
                !hasAttended && (
                  <div className="p-6 border-t bg-gray-50">
                    <div className="text-center text-gray-600">
                      <p className="mb-2">
                        Only paid attendees who haven't cancelled can leave
                        comments.
                      </p>
                      <p className="text-sm">
                        Register and attend this event to share your thoughts!
                      </p>
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
                <h3 className="text-xl font-bold text-[#4C3BCF]">Rate Event</h3>
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
                    <p className="text-gray-600 mb-2">
                      Only paid attendees who haven't cancelled can rate this
                      event.
                    </p>
                    <p className="text-sm text-gray-500">
                      Register and attend this event to share your rating!
                    </p>
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
        )}{" "}
        {/* Ratings List Modal */}
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
                  ✕
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
                              ★
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
    </div>
  );
}
