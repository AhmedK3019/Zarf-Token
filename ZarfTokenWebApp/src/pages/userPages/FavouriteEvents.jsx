import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { useAuthUser } from "../../hooks/auth";
import EventCard from "../../components/EventCard";
import EventDetailsModal from "../../components/EventDetailsModal";
import { getEventDetails } from "../eventUtils";
import { User, X, Star, Trash2 } from "lucide-react";

const LIGHT_OVERLAY_CLASSES =
  "fixed inset-0 z-50 flex items-center justify-center p-4 bg-muted bg-opacity-90 backdrop-blur-sm animate-fade-in";

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

  const fetchFavourites = async () => {
    if (!user?._id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/user/getFavourites/${user._id}`);
      const list = (res?.data?.favourites || []).map((r) => ({
        ...r,
        status:
          r.status ||
          (r.item
            ? new Date(r.item.enddate || r.item.startdate) < new Date()
              ? "past"
              : new Date(r.item.startdate) > new Date()
              ? "upcoming"
              : "ongoing"
            : "unavailable"),
        addedAt: r.addedAt || new Date().toISOString(),
        registration: r.registration || "unknown",
      }));
      setFavs(list);
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
        const an =
          a.item?.workshopname ||
          a.item?.tripname ||
          a.item?.bazaarname ||
          a.item?.conferencename ||
          a.item?.boothname ||
          "";
        const bn =
          b.item?.workshopname ||
          b.item?.tripname ||
          b.item?.bazaarname ||
          b.item?.conferencename ||
          b.item?.boothname ||
          "";
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
      return true;
    } catch (e) {
      return false;
    }
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

  const totalCount = filtered.length;

  return (
    <div className="p-6 w-full">
      {/* <div className="flex items-center justify-end mb-6">
        <div className="text-sm text-gray-600">You have {totalCount} events in favorites</div>
      </div> */}
      {/* Filters & Sorting */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6 max-w-7xl mx-auto">
        <select
          className="border rounded-lg p-2 bg-white"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          {typeOptions.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
        <select
          className="border rounded-lg p-2 bg-white"
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
          className="border rounded-lg p-2 bg-white"
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
          className="border rounded-lg p-2 bg-white"
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
      {loading && (
        <div className="py-20 text-center text-[#312A68]">
          Loading your favorites...
        </div>
      )}
      {error && <div className="py-4 text-red-600">{error}</div>}
      {!loading && !error && filtered.length === 0 && (
        <div className="bg-white rounded-xl p-10 text-center border">
          <div className="text-lg font-semibold text-[#4C3BCF] mb-2">
            No favorites yet
          </div>
          <div className="text-sm text-gray-600 mb-4">
            Browse events and add them to your favorites.
          </div>
          <a
            href="/dashboard/user/all-events"
            className="inline-block px-4 py-2 rounded-full bg-[#736CED] text-white hover:bg-[#5b53d6]"
          >
            Browse Events
          </a>
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
                onViewDetails={() => {
                  setSelectedEvent(fav.item);
                  setShowDetailsModal(true);
                }}
                isFavourite={true}
                onToggleFavourite={() => handleRemove(fav)}
                onViewComments={handleViewComments}
                onRateEvent={handleRateEvent}
                onViewRatings={handleViewRatings}
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
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setShowDetailsModal(false)}
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
  );
}
