import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuthUser } from "../../hooks/auth";
import EventCard from "../../components/EventCard";
import EventDetailsModal from "../../components/EventDetailsModal";
import { getEventDetails } from "../eventUtils";
import { User, X, Star } from "lucide-react";

export default function RegisteredEvents() {
  const { user } = useAuthUser();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // favourites state (for heart toggle)
  const [favKeys, setFavKeys] = useState(new Set());
  const [toastMsg, setToastMsg] = useState(null);
  const [toastType, setToastType] = useState("info");

  // details & pay modal state
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payEvent, setPayEvent] = useState(null);

  // Rating and comments state
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedRatingEvent, setSelectedRatingEvent] = useState(null);
  const [comments, setComments] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

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
      setToastMsg("Registration canceled");
      setToastType("success");
      setTimeout(() => setToastMsg(null), 1500);
      // refresh registered events
      const res = await api.get(
        `/allEvents/getEventsRegisteredByMe/${user._id}`
      );
      setEvents(res.data || []);
    } catch (err) {
      setToastMsg(err?.response?.data?.message || "Cancel failed");
      setToastType("error");
      setTimeout(() => setToastMsg(null), 2000);
    }
  };

  const renderRegistrationControls = ({
    event,
    rawEvent,
    isRegistered,
    canRegister,
  }) => {
    // find attendee entry for current user
    const attendee = (event.attendees || []).find(
      (a) =>
        String(a.userId) === String(user?._id) ||
        String(a.user) === String(user?._id) ||
        String(a._id) === String(user?._id)
    );
    const now = Date.now();
    const startDate = event.startDate ? new Date(event.startDate) : null;

    if (!attendee) return null;
    const paid = Boolean(attendee.paid);

    // 1) Registered & paid & upcoming -> show 'Registered'
    if (paid && startDate && startDate.getTime() > now) {
      return (
        <button
          disabled
          className="text-xs bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg transition-colors cursor-not-allowed font-medium"
        >
          Registered
        </button>
      );
    }

    // 2) Registered but NOT paid & upcoming -> show Pay button (opens placeholder modal)
    if (!paid && startDate && startDate.getTime() > now) {
      return (
        <button
          onClick={() => {
            setPayEvent(rawEvent);
            setShowPayModal(true);
          }}
          className="text-xs bg-[#f59e0b] text-white px-3 py-1.5 rounded-lg hover:bg-[#d97706] transition-colors font-medium"
        >
          Pay
        </button>
      );
    }

    // 3) Registered & not paid & event passed -> Registration canceled
    if (!paid && startDate && startDate.getTime() <= now) {
      return (
        <button
          disabled
          className="text-xs bg-red-50 text-red-700 px-3 py-1.5 rounded-lg transition-colors cursor-not-allowed font-medium"
        >
          Registration canceled
        </button>
      );
    }

    // 4) Registered & paid & event at least 2 weeks ahead -> Cancel registration button
    if (paid && startDate) {
      const twoWeeks = 1000 * 60 * 60 * 24 * 14;
      if (startDate.getTime() - now >= twoWeeks) {
        return (
          <button
            onClick={() => handleCancelRegistration(rawEvent)}
            className="text-xs bg-red-50 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors font-medium"
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
            className="text-xs bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg transition-colors cursor-not-allowed font-medium"
          >
            Registered
          </button>
        );
      }
    }

    return null;
  };

  // Rating and Comments Handlers
  const handleViewComments = async (eventRaw, eventId, eventType) => {
    setSelectedRatingEvent(eventRaw);
    setShowCommentsModal(true);
    
    if (['booth'].includes(eventType)) return;
    
    setCommentsLoading(true);
    try {
      const response = await api.get(`/allEvents/viewAllComments/${eventId}/${eventType}`);
      setComments(response.data.userComments || []);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleRateEvent = async (eventRaw, eventId, eventType) => {
    setSelectedRatingEvent(eventRaw);
    setShowRatingModal(true);
    
    if (['booth'].includes(eventType)) return;
    
    setRatingsLoading(true);
    try {
      const response = await api.get(`/allEvents/viewAllRatings/${eventId}/${eventType}`);
      setRatings(response.data.ratings || []);
      
      // Check if user has already rated
      const existingRating = (response.data.ratings || []).find(r => r.userId === user?._id);
      setUserRating(existingRating ? existingRating.rating : 0);
    } catch (error) {
      console.error('Failed to fetch ratings:', error);
      setRatings([]);
      setUserRating(0);
    } finally {
      setRatingsLoading(false);
    }
  };

  const submitRating = async (rating) => {
    if (!user || !rating || rating < 1 || rating > 5 || !selectedRatingEvent) return;
    
    setRatingSubmitting(true);
    try {
      const eventDetails = getEventDetails(selectedRatingEvent);
      await api.patch(`/allEvents/rateEvent/${eventDetails.id}/${eventDetails.type}`, { rating });
      
      // Refresh ratings after submission
      const response = await api.get(`/allEvents/viewAllRatings/${eventDetails.id}/${eventDetails.type}`);
      setRatings(response.data.ratings || []);
      setUserRating(rating);
      setShowRatingModal(false);
      
      // Trigger refresh of all EventCard components
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Failed to submit rating:', error);
      alert(`Failed to submit rating: ${error.response?.data?.message || error.message}`);
    } finally {
      setRatingSubmitting(false);
    }
  };

  const submitComment = async () => {
    if (!user || !newComment.trim() || !selectedRatingEvent) return;
    
    setCommentSubmitting(true);
    try {
      const eventDetails = getEventDetails(selectedRatingEvent);
      await api.patch(`/allEvents/addComment/${eventDetails.id}/${eventDetails.type}`, { 
        comment: newComment.trim() 
      });
      
      // Refresh comments after submission
      const response = await api.get(`/allEvents/viewAllComments/${eventDetails.id}/${eventDetails.type}`);
      setComments(response.data.userComments || []);
      setNewComment('');
      
      // Trigger refresh of all EventCard components
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Failed to submit comment:', error);
      alert(`Failed to submit comment: ${error.response?.data?.message || error.message}`);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const closeCommentsModal = () => {
    setShowCommentsModal(false);
    setSelectedRatingEvent(null);
    setComments([]);
    setNewComment('');
  };

  const closeRatingModal = () => {
    setShowRatingModal(false);
    setSelectedRatingEvent(null);
    setRatings([]);
    setUserRating(0);
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
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-[#736CED] sm:text-4xl mb-2">
                My Registered Events
              </h2>
              {error ? (
                <p className="max-w-2xl mx-auto text-[#9F2D20] bg-[#FEE2E2] border border-[#FCA5A5] rounded-lg px-4 py-2">
                  {error}
                </p>
              ) : (
                <p className="text-[#312A68] opacity-80">
                  Here are the workshops and trips you signed up for.
                </p>
              )}
            </div>

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
                    refreshTrigger={refreshTrigger}
                    renderRegistrationControls={renderRegistrationControls}
                  />
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Toast message */}
        {toastMsg && (
          <div
            className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-md text-white ${
              toastType === "error" ? "bg-red-600" : "bg-emerald-600"
            }`}
          >
            {toastMsg}
          </div>
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedEvent && (
          <EventDetailsModal
            event={selectedEvent}
            onClose={() => setShowDetailsModal(false)}
          />
        )}

        {/* Pay placeholder modal */}
        {showPayModal && payEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[#4a4ae6]">
                  Pay for {getEventDetails(payEvent).name}
                </h2>
                <button
                  onClick={() => setShowPayModal(false)}
                  className="text-gray-500 text-2xl"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-gray-700 mb-4">
                Payment flow not implemented yet. We'll discuss details and
                integrate the gateway.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowPayModal(false)}
                  className="px-4 py-2 rounded-full border"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Comments Modal */}
        {showCommentsModal && selectedRatingEvent && (() => {
          const hasAttended = true;
          
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-muted bg-opacity-90 backdrop-blur-sm animate-fade-in" onClick={closeCommentsModal}>
              <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
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
                    <div className="text-center py-8 text-gray-600">Loading comments...</div>
                  ) : comments.length > 0 ? (
                    <div className="space-y-4">
                      {comments.map((comment, index) => (
                        <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <User size={16} className="text-blue-600" />
                            </div>
                            <span className="font-medium text-gray-800">
                              {comment.userId?.firstname || comment.userId?.lastname 
                                ? `${comment.userId.firstname || ''} ${comment.userId.lastname || ''}`.trim()
                                : 'Anonymous User'}
                            </span>
                          </div>
                          <p className="text-gray-700 ml-10">{comment.comment}</p>
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
                
                {/* Add Comment Form */}
                <div className="p-6 border-t bg-gray-50">
                  <h4 className="font-semibold text-gray-800 mb-3">Add a Comment</h4>
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
                      {commentSubmitting ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Rating Modal */}
        {showRatingModal && selectedRatingEvent && (() => {
          const hasAttended = true;
          
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-muted bg-opacity-90 backdrop-blur-sm animate-fade-in" onClick={closeRatingModal}>
              <div className="bg-white rounded-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
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
                  <div className="text-center mb-6">
                    <p className="text-gray-600 mb-4">How would you rate this event?</p>
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
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300 hover:text-yellow-200'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    {userRating > 0 && (
                      <p className="text-sm text-gray-600 mb-4">
                        You selected {userRating} star{userRating !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>

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
                      {ratingSubmitting ? 'Submitting...' : 'Submit Rating'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
