import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { useAuthUser } from "../../hooks/auth";
import EventCard from "../../components/EventCard";
import EventDetailsModal from "../../components/EventDetailsModal";
import { getEventDetails } from "../eventUtils";
import { User, X, Star } from "lucide-react";

const typeOptions = [
  { id: "", name: "All Types" },
  { id: "workshop", name: "Workshops" },
  { id: "trip", name: "Trips" },
  { id: "bazaar", name: "Bazaars" },
  { id: "conference", name: "Conferences" },
  { id: "booth", name: "Booths" },
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

export default function FavouriteEvents() {
  const { user } = useAuthUser();
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const [toastType, setToastType] = useState("info");
  const [error, setError] = useState(null);
  const [favs, setFavs] = useState([]);

  // Filters
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [regFilter, setRegFilter] = useState("");
  const [sortBy, setSortBy] = useState("date_added_desc");

  // Modals
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

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

  const fetchFavourites = async () => {
    if (!user?._id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/user/getFavourites/${user._id}`);
      const list = (res?.data?.favourites || []).map((r) => ({
        ...r,
        status:
          r.status || (r.item
            ? (new Date(r.item.enddate || r.item.startdate) < new Date()
                ? "past"
                : (new Date(r.item.startdate) > new Date() ? "upcoming" : "ongoing"))
            : "unavailable"),
        addedAt: r.addedAt || new Date().toISOString(),
        registration: r.registration || "unknown",
      }));
      setFavs(list);
      setToastMsg("Favorites loaded"); setToastType("success"); setTimeout(()=>setToastMsg(null),1500);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load favourites");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavourites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  const filtered = useMemo(() => {
    let out = favs.slice();
    if (typeFilter) out = out.filter((f) => f.itemType === typeFilter);
    if (statusFilter) out = out.filter((f) => f.status === statusFilter);
    if (regFilter)
      out = out.filter((f) =>
        regFilter === "registered"
          ? f.registration === "registered"
          : f.registration !== "registered"
      );
    const sortKey = sortBy.split("_")[0];
    const sortDir = sortBy.endsWith("desc") ? -1 : 1;
    out.sort((a, b) => {
      if (sortKey === "alpha") {
        const an = a.item?.workshopname || a.item?.tripname || a.item?.bazaarname || a.item?.conferencename || a.item?.boothname || "";
        const bn = b.item?.workshopname || b.item?.tripname || b.item?.bazaarname || b.item?.conferencename || b.item?.boothname || "";
        return sortDir * an.localeCompare(bn);
      }
      if (sortKey === "event") {
        const at = a.item?.startdate ? new Date(a.item.startdate).getTime() : 0;
        const bt = b.item?.startdate ? new Date(b.item.startdate).getTime() : 0;
        return sortDir * (at - bt);
      }
      // default date_added
      const at = a.addedAt ? new Date(a.addedAt).getTime() : 0;
      const bt = b.addedAt ? new Date(b.addedAt).getTime() : 0;
      return sortDir * (at - bt);
    });
    return out;
  }, [favs, typeFilter, statusFilter, regFilter, sortBy]);

  const handleRemove = async (fav) => {
    try {
      await api.post(`/user/removeFavourite/${user._id}`, {
        itemType: fav.itemType,
        itemId: fav.itemId,
      });
      setFavs((cur) =>
        cur.filter(
          (x) => !(x.itemType === fav.itemType && x.itemId === fav.itemId)
        )
      );
      setToastMsg("Removed from favorites");
      setToastType("success");
      setTimeout(() => setToastMsg(null), 2000);
      return true;
    } catch (e) {
      setToastMsg(
        e?.response?.data?.message || "Failed to remove from favorites"
      );
      setToastType("error");
      setTimeout(() => setToastMsg(null), 2500);
      return false;
    }
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

  const totalCount = filtered.length;

  return (
    <div className="p-6 w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#4C3BCF]">My Favorites</h2>
        <div className="text-sm text-gray-600">You have {totalCount} events in favorites</div>
      </div>

      {/* Filters & Sorting */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6 max-w-7xl mx-auto">
        <select className="border rounded-lg p-2" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          {typeOptions.map((o) => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </select>
        <select className="border rounded-lg p-2" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          {statusOptions.map((o) => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </select>
        <select className="border rounded-lg p-2" value={regFilter} onChange={(e) => setRegFilter(e.target.value)}>
          {regOptions.map((o) => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </select>
        <select className="border rounded-lg p-2" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          {sortOptions.map((o) => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="py-20 text-center text-[#312A68]">Loading your favorites...</div>
      )}
      {error && (
        <div className="py-4 text-red-600">{error}</div>
      )}
      {!loading && !error && filtered.length === 0 && (
        <div className="bg-white rounded-xl p-10 text-center border">
          <div className="text-lg font-semibold text-[#4C3BCF] mb-2">No favorites yet</div>
          <div className="text-sm text-gray-600 mb-4">Browse events and add them to your favorites.</div>
          <a href="/dashboard/user/all-events" className="inline-block px-4 py-2 rounded-full bg-[#736CED] text-white hover:bg-[#5b53d6]">Browse Events</a>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((fav) => (
          <div key={`${fav.itemType}-${fav.itemId}`} className="relative">
            {fav.item ? (
              <EventCard
                event={{ ...fav.item, type: fav.itemType }} 
                user={user}
                userIsPrivileged={false}
                userIsEligible={true}
                onViewDetails={() => { setSelectedEvent(fav.item); setShowDetailsModal(true); }}
                isFavourite={true}
                onToggleFavourite={() => handleRemove(fav)}
                onViewComments={handleViewComments}
                onRateEvent={handleRateEvent}
                refreshTrigger={refreshTrigger}
              />
            ) : (
              <div className="border rounded-lg p-4 bg-gray-50 text-gray-600 flex flex-col gap-4">
                <div>Event no longer available</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showDetailsModal && selectedEvent && (
        <EventDetailsModal event={selectedEvent} onClose={() => setShowDetailsModal(false)} />
      )}

      {/* Comments Modal */}
      {showCommentsModal && selectedRatingEvent && (() => {
        const hasAttended = true;
        
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={closeCommentsModal}>
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

    {toastMsg && (<div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-md text-white ${toastType==="error"?"bg-red-600":"bg-emerald-600"}`}>{toastMsg}</div>)}
    </div>
  );
}
