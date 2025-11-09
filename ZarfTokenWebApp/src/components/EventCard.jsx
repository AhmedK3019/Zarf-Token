import React, { useState, useRef, useEffect } from "react";
import { getEventDetails, formatSimpleDate } from "../pages/eventUtils";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  Clock,
  MapPin,
  User,
  Building,
  DollarSign,
  ClockAlert,
  Store,
  ChevronDown,
  ChevronUp,
  Calendar,
  Heart,
  X,
  MessageCircle,
  Star,
} from "lucide-react";

const EventCard = ({
  event: rawEvent,
  user,
  userIsPrivileged,
  userIsEligible,
  onDelete,
  onRegister,
  onViewBooths,
  onViewDetails,
  isFavourite,
  onToggleFavourite,
  onViewComments,
  onRateEvent,
  refreshTrigger,
  renderRegistrationControls,
  footerExtra,
}) => {
  const navigate = useNavigate();
  const event = getEventDetails(rawEvent);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const descriptionRef = useRef(null);

  // Local state for ratings and comments display
  const [ratings, setRatings] = useState([]);
  const [comments, setComments] = useState([]);
  const [ratingsLoading, setRatingsLoading] = useState(true);

  const isRegistered = Array.isArray(event.attendees)
    ? event.attendees.some((a) => a.userId === user?._id)
    : false;

  // Check if user actually attended the event (for rating/commenting permissions)
  // const hasAttended = Array.isArray(event.original?.attendees)
  //   ? event.original.attendees.some((a) => a.userId === user?._id)
  //   : false;

  // Fetch ratings and comments on component mount
  useEffect(() => {
    const fetchRatingsAndComments = async () => {
      if (['booth'].includes(event.type)) {
        setRatingsLoading(false);
        return;
      }

      try {
        // Fetch ratings
        const ratingsResponse = await api.get(`/allEvents/viewAllRatings/${event.id}/${event.type}`);
        setRatings(ratingsResponse.data.ratings || []);

        // Fetch comments
        const commentsResponse = await api.get(`/allEvents/viewAllComments/${event.id}/${event.type}`);
        setComments(commentsResponse.data.userComments || []);
      } catch (error) {
        console.error('Failed to fetch ratings/comments:', error);
        setRatings([]);
        setComments([]);
      } finally {
        setRatingsLoading(false);
      }
    };

    fetchRatingsAndComments();
  }, [event.id, event.type, refreshTrigger]); // Add refreshTrigger to dependency array

  const onUpdate = (type) => {
    navigate(`/dashboard/eventsOffice/edit-event/${type}/${event.id}`);
  };

  useEffect(() => {
    if (descriptionRef.current && event.description) {
      const el = descriptionRef.current;
      setHasOverflow(el.scrollHeight > el.clientHeight);
    }
  }, [event.description]);

  const canDelete =
    userIsPrivileged &&
    (event.type === "bazaar" ||
      event.type === "booth" ||
      event.type === "conference" ||
      (event.type === "workshop" && event.attendees.length === 0) ||
      (event.type === "trip" && event.attendees.length === 0));

  const canUpdate =
    user?.role?.toLowerCase().includes("event") &&
    (event.type === "bazaar" ||
      event.type === "conference" ||
      event.type === "trip") &&
    new Date(event.startDate) > Date.now();

  const canRegister =
    userIsEligible &&
    (event.type === "trip" || event.type === "workshop") &&
    event.registrationDeadline &&
    new Date() < new Date(event.registrationDeadline) &&
    !isRegistered &&
    (event.capacity ? event.attendees.length < event.capacity : true);

  const isBazaar = event.type === "bazaar";
  const isPlatformBooth =
    event.type === "booth" && !event.original?.isBazarBooth;
  const isBazaarBooth = event.type === "booth" && event.original?.isBazarBooth;
  const isWorkshop = event.type === "workshop";

  const toggleDescription = () => {
    if (hasOverflow) setIsDescriptionExpanded((v) => !v);
  };

  const averageRating = ratings.length > 0 
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
    : 0;

  const getEventTypeColor = (type) => {
    const colors = {
      workshop: "#3B82F6",
      bazaar: "#8B5CF6",
      trip: "#10B981",
      conference: "#F59E0B",
      booth: "#EC4899",
    };
    return colors[type] || "#4a4ae6";
  };

  const eventTypeColor = getEventTypeColor(event.type);

  return (
    <div className="relative bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex flex-col">
      {typeof onToggleFavourite === "function" &&
        user &&
        (user.role === "Student" ||
          user.role === "Professor" ||
          user.role === "TA" ||
          user.role === "Staff") && (
          <button
            type="button"
            aria-label="Toggle favourite"
            data-testid="fav-toggle"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavourite?.(rawEvent);
            }}
            className="absolute right-4 top-4 p-2 rounded-full bg-white/90 border hover:bg-white shadow-sm"
            title={isFavourite ? "Remove from favourites" : "Add to favourites"}
          >
            <Heart
              size={18}
              color={isFavourite ? "#e11d48" : "#64748b"}
              fill={isFavourite ? "#e11d48" : "none"}
            />
          </button>
        )}

      <div className="flex-grow">
        <div
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium mb-4"
          style={{
            backgroundColor: `${eventTypeColor}15`,
            color: eventTypeColor,
          }}
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: eventTypeColor }}
          />
          <span className="capitalize">
            {event.type === "booth" && !event.original?.isBazarBooth
              ? "Platform Booth"
              : event.type}
          </span>
        </div>

        <h3 className="text-xl font-bold text-[#4a4ae6] mb-3">{event.name}</h3>

        <div className="space-y-2 text-sm text-gray-700">
          {event.type === "conference" && (
            <p className="flex items-center gap-2">
              <User size={16} className="mt-1 text-gray-500 flex-shrink-0" />
              {event.professorname}
            </p>
          )}

          {isBazaarBooth && event.original?.bazarId && (
            <p className="flex items-center gap-2">
              <Store size={16} className="mt-1 text-gray-500 flex-shrink-0" />
              Part of: {event.original.bazarId.bazaarname || "Bazaar"}
            </p>
          )}

          {isPlatformBooth && event.vendor && (
            <p className="flex items-center gap-2">
              <Building
                size={16}
                className="mt-1 text-gray-500 flex-shrink-0"
              />
              Vendor: {event.vendor}
            </p>
          )}

          {event.location && !isBazaarBooth && (
            <p className="flex items-center gap-2">
              <MapPin size={16} className="mt-1 text-red-500 flex-shrink-0" />
              <span className="text-gray-700">{event.location}</span>
            </p>
          )}

          {event.duration && event.type === "booth" && (
            <p className="flex items-center gap-2">
              <Calendar
                size={16}
                className="mt-1 text-gray-500 flex-shrink-0"
              />
              {event.duration} week{event.duration > 1 ? "s" : ""}
            </p>
          )}

          {isBazaarBooth && event.location && (
            <p className="flex items-center gap-2">
              <MapPin size={16} className="mt-1 text-red-500 flex-shrink-0" />
              <span className="text-gray-700">
                Booth Location: {event.location}
              </span>
            </p>
          )}

          {event.price > 0 && (
            <p className="flex items-center gap-2">
              <DollarSign
                size={16}
                className="mt-1 text-gray-500 flex-shrink-0"
              />
              Price: {event.price} EGP
            </p>
          )}

          {event.startDate && (
            <div className="flex items-center gap-2">
              <Calendar
                size={16}
                className="mt-1 text-gray-500 flex-shrink-0"
              />
              <span>
                Starts {formatSimpleDate(event.startDate)}
                {event.duration &&
                  ` · ${event.duration} ${
                    event.type === "workshop" ? "day" : "week"
                  }${event.duration === 1 ? "" : "s"}`}
              </span>
            </div>
          )}

          {event.registrationDeadline && (
            <div className="flex items-center gap-2 text-[#E53E3E]">
              <ClockAlert
                size={16}
                className="mt-1 text-[#E53E3E] flex-shrink-0"
              />
              <span>
                Register by:{" "}
                {formatSimpleDate(new Date(event.registrationDeadline))}
              </span>
            </div>
          )}
        </div>

        {event.description && (
          <div className="mt-4">
            <div
              ref={descriptionRef}
              className={`text-gray-600 text-sm leading-relaxed ${
                hasOverflow ? "cursor-pointer hover:text-gray-800" : ""
              } transition-colors ${
                isDescriptionExpanded ? "line-clamp-none" : "line-clamp-1"
              }`}
              onClick={toggleDescription}
            >
              {event.description}
            </div>

            {hasOverflow && (
              <button
                onClick={toggleDescription}
                className="mt-1 flex items-center gap-1 text-xs text-[#4a4ae6] hover:text-[#3d3dd4] transition-colors"
              >
                {isDescriptionExpanded ? (
                  <>
                    Show less <ChevronUp size={12} />
                  </>
                ) : (
                  <>
                    Read more <ChevronDown size={12} />
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        {event.faculty && (
          <p className="text-xs text-gray-500 mb-2">Faculty: {event.faculty}</p>
        )}

        {event.website && (
          <a
            href={event.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-[#4a4ae6] hover:text-[#3d3dd4] transition-colors underline mb-2 inline-block"
          >
            Visit Website
          </a>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          {canDelete && (
            <button
              onClick={() => onDelete?.(event.original)}
              className="text-xs bg-red-50 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors font-medium"
            >
              Delete
            </button>
          )}

          {canUpdate && (
            <button
              onClick={() => onUpdate(event.type)}
              className="text-xs bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg hover:bg-purple-100 transition-colors font-medium"
            >
              Update
            </button>
          )}

          {/* Registration area: allow caller to provide a custom renderer. If none is provided, fall back to default behavior. */}
          {typeof renderRegistrationControls === "function" ? (
            renderRegistrationControls({
              event,
              rawEvent,
              isRegistered,
              canRegister,
            })
          ) : (
            <>
              {isRegistered && (
                <button
                  disabled
                  className="text-xs bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg transition-colors cursor-not-allowed font-medium"
                >
                  Registered
                </button>
              )}

              {canRegister && (
                <button
                  onClick={() => onRegister?.(event.original)}
                  className="text-xs bg-[#4a4ae6] text-white px-3 py-1.5 rounded-lg hover:bg-[#3d3dd4] transition-colors font-medium"
                >
                  Register
                </button>
              )}

              {userIsEligible &&
                !canRegister &&
                !isRegistered &&
                (event.type === "trip" || event.type === "workshop") && (
                  <button
                    disabled
                    className="text-xs bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg transition-colors cursor-not-allowed font-medium"
                  >
                    Registration Closed
                  </button>
                )}
            </>
          )}

          {isBazaar && (
            <button
              onClick={() => onViewBooths?.(event.original)}
              className="text-xs font-semibold text-[#4a4ae6] hover:text-[#3d3dd4] transition-colors px-3 py-1.5"
            >
              View Booths
            </button>
          )}

          {(isPlatformBooth ||
            isBazaarBooth ||
            isWorkshop ||
            event.type === "trip" ||
            event.type === "conference") && (
            <button
              onClick={() => onViewDetails?.(event.original)}
              className="text-xs font-semibold text-[#4a4ae6] hover:text-[#3d3dd4] transition-colors px-3 py-1.5"
            >
              View Details
            </button>
          )}

          {footerExtra && (
            <div className="w-full flex justify-start">{footerExtra}</div>
          )}
        </div>

        {/* Ratings and Comments Section - Only for supported event types */}
        {!['booth'].includes(event.type) && (
          <div className="mt-4 pt-4">
            {ratingsLoading ? (
              <div className="text-center py-2">
                <div className="text-xs text-gray-500">Loading ratings...</div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          className={`${
                            star <= Math.round(averageRating) 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 ml-1">
                      ({averageRating > 0 ? `${averageRating.toFixed(1)}` : 'No ratings'})
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {ratings.length} rating{ratings.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => onViewComments?.(event.original, event.id, event.type)}
                    className="flex-1 text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors font-medium flex items-center justify-center gap-1"
                  >
                    <MessageCircle size={12} />
                    Comments
                  </button>
                  <button 
                    onClick={() => onRateEvent?.(event.original, event.id, event.type)}
                    className="flex-1 text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors font-medium flex items-center justify-center gap-1"
                  >
                    <Star size={12} />
                    Rate Event
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;
