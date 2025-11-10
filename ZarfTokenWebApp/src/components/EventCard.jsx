import React, { useState, useRef, useEffect } from "react";
import { getEventDetails, formatSimpleDate } from "../pages/eventUtils";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
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
  onViewRatings,
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
  const referenceDate = event.endDate || event.startDate;
  const isPastEvent = referenceDate
    ? new Date(referenceDate).getTime() < Date.now()
    : false;
  const startLabel = event.startDate ? formatSimpleDate(event.startDate) : null;
  const registrationDeadlineLabel = event.registrationDeadline
    ? formatSimpleDate(new Date(event.registrationDeadline))
    : null;
  const durationLabel =
    event.duration &&
    `${event.duration} ${
      event.type === "workshop" ? "day" : "week"
    }${event.duration === 1 ? "" : "s"}`;
  const canShowFavourite =
    typeof onToggleFavourite === "function" &&
    user &&
    (user.role === "Student" ||
      user.role === "Professor" ||
      user.role === "TA" ||
      user.role === "Staff");

  const infoRows = [
    event.type === "conference" &&
      event.professorname && {
        icon: User,
        label: event.professorname,
      },
    isBazaarBooth &&
      event.original?.bazarId && {
        icon: Store,
        label: `Part of: ${event.original.bazarId.bazaarname || "Bazaar"}`,
      },
    isPlatformBooth &&
      event.vendor && {
        icon: Building,
        label: `Vendor: ${event.vendor}`,
      },
    event.location && {
      icon: MapPin,
      label: isBazaarBooth ? `Booth Location: ${event.location}` : event.location,
    },
    event.price > 0 && {
      icon: DollarSign,
      label: `Price: ${event.price} EGP`,
    },
    event.type === "booth" &&
      event.duration && {
        icon: Calendar,
        label: `${event.duration} week${event.duration > 1 ? "s" : ""}`,
      },
    startLabel && {
      icon: Calendar,
      label: durationLabel
        ? `Starts ${startLabel} · ${durationLabel}`
        : `Starts ${startLabel}`,
    },
    registrationDeadlineLabel && {
      icon: ClockAlert,
      label: `Register by ${registrationDeadlineLabel}`,
      accent: "text-rose-600 font-semibold",
    },
    event.faculty && {
      icon: Building,
      label: `Faculty: ${event.faculty}`,
      subtle: true,
    },
  ].filter(Boolean);

  const actionButtons = [];
  const actionButtonBase =
    "w-full rounded-lg px-4 py-2 text-sm font-semibold text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

  const addActionButton = (node, key) => {
    if (!node) return;
    actionButtons.push(
      <div key={key} className="flex w-full">
        {node}
      </div>
    );
  };

  if (canDelete) {
    addActionButton(
      <button
        type="button"
        onClick={() => onDelete?.(event.original)}
        className={`${actionButtonBase} border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 focus-visible:ring-red-200`}
      >
        Delete
      </button>,
      "delete"
    );
  }

  if (canUpdate) {
    addActionButton(
      <button
        type="button"
        onClick={() => onUpdate(event.type)}
        className={`${actionButtonBase} border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 focus-visible:ring-purple-200`}
      >
        Update
      </button>,
      "update"
    );
  }

  const defaultRegistrationButtons = [];

  if (isRegistered) {
    defaultRegistrationButtons.push(
      <button
        key="registered"
        type="button"
        disabled
        className={`${actionButtonBase} cursor-not-allowed border border-gray-200 bg-gray-50 text-[#555] focus-visible:ring-gray-200`}
      >
        Registered
      </button>
    );
  }

  if (canRegister) {
    defaultRegistrationButtons.push(
      <button
        key="register"
        type="button"
        onClick={() => onRegister?.(event.original)}
        className={`${actionButtonBase} bg-[#4a4ae6] text-white hover:bg-[#3d3dd4] focus-visible:ring-[#736ced]`}
      >
        Register
      </button>
    );
  }

  if (
    userIsEligible &&
    !canRegister &&
    !isRegistered &&
    (event.type === "trip" || event.type === "workshop")
  ) {
    defaultRegistrationButtons.push(
      <button
        key="registration-closed"
        type="button"
        disabled
        className={`${actionButtonBase} border border-dashed border-gray-300 bg-gray-100 text-[#555] focus-visible:ring-gray-200`}
      >
        Registration Closed
      </button>
    );
  }

  const registrationControls =
    typeof renderRegistrationControls === "function"
      ? renderRegistrationControls({
          event,
          rawEvent,
          isRegistered,
          canRegister,
        })
      : defaultRegistrationButtons;

  React.Children.toArray(registrationControls).forEach((control, index) => {
    addActionButton(control, `reg-${index}`);
  });

  if (isBazaar) {
    addActionButton(
      <button
        type="button"
        onClick={() => onViewBooths?.(event.original)}
        className={`${actionButtonBase} border border-[#4a4ae6]/30 text-[#4a4ae6] hover:bg-[#4a4ae6]/10 focus-visible:ring-[#4a4ae6]/30`}
      >
        View Booths
      </button>,
      "view-booths"
    );
  }

  if (
    isPlatformBooth ||
    isBazaarBooth ||
    isWorkshop ||
    event.type === "trip" ||
    event.type === "conference"
  ) {
    addActionButton(
      <button
        type="button"
        onClick={() => onViewDetails?.(event.original)}
        className={`${actionButtonBase} border border-[#4a4ae6]/30 text-[#4a4ae6] hover:bg-[#4a4ae6]/10 focus-visible:ring-[#4a4ae6]/30`}
      >
        View Details
      </button>,
      "view-details"
    );
  }

  if (footerExtra) {
    React.Children.toArray(footerExtra).forEach((extra, index) => {
      addActionButton(extra, `extra-${index}`);
    });
  }

  return (
    <div className="relative flex min-h-[420px] flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl">
      {(isPastEvent || canShowFavourite) && (
        <div className="absolute right-4 top-4 flex items-center gap-2">
          {isPastEvent && (
            <span className="rounded-full bg-[#f0f0f0] px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-700">
              Past Event
            </span>
          )}
          {canShowFavourite && (
            <button
              type="button"
              aria-label="Toggle favourite"
              data-testid="fav-toggle"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavourite?.(rawEvent);
              }}
              className="rounded-full border border-gray-200 bg-white/90 p-2 shadow-sm transition hover:bg-white"
              title={isFavourite ? "Remove from favourites" : "Add to favourites"}
            >
              <Heart
                size={18}
                color={isFavourite ? "#e11d48" : "#64748b"}
                fill={isFavourite ? "#e11d48" : "none"}
              />
            </button>
          )}
        </div>
      )}

      <div className="flex h-full flex-col">
        <div className="pb-4">
          <div
            className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold capitalize"
            style={{
              backgroundColor: `${eventTypeColor}15`,
              color: eventTypeColor,
            }}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: eventTypeColor }}
            />
            {event.type === "booth" && !event.original?.isBazarBooth
              ? "Platform Booth"
              : event.type}
          </div>

          <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
        </div>

        <div className="space-y-2 pb-2 text-sm">
          {infoRows.map(({ icon: Icon, label, accent, subtle }, index) => (
            <div key={`info-${index}`} className="flex items-center gap-3">
              <Icon size={16} className={subtle ? "text-gray-300" : "text-gray-400"} />
              <span
                className={`leading-5 ${
                  accent ? accent : subtle ? "text-[#555]" : "text-gray-700"
                }`}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        {event.description && (
          <div className="mt-4 flex-1">
            <div
              ref={descriptionRef}
              className={`text-sm leading-relaxed text-[#555] ${
                hasOverflow ? "cursor-pointer hover:text-gray-800" : ""
              } transition-colors ${
                isDescriptionExpanded ? "line-clamp-none" : "line-clamp-2"
              }`}
              onClick={toggleDescription}
            >
              {event.description}
            </div>

            {hasOverflow && (
              <button
                onClick={toggleDescription}
                className="mt-1 flex items-center gap-1 text-xs font-semibold text-[#4a4ae6] hover:text-[#3d3dd4] transition-colors"
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

        <div className="mt-6 border-t border-gray-100 pt-4">
          {event.website && (
            <a
              href={event.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-[#4a4ae6] underline-offset-2 hover:underline"
            >
              Visit Website
            </a>
          )}

          {actionButtons.length > 0 && (
            <div className="mt-4 grid w-full gap-2 sm:grid-cols-2">
              {actionButtons}
            </div>
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
                  <button 
                    onClick={() => onViewRatings?.(event.original, event.id, event.type)}
                    className="flex items-center gap-1 hover:bg-gray-50 rounded-lg p-1 -ml-1 transition-colors group"
                  >
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          className={`${
                            star <= Math.round(averageRating) 
                              ? 'text-yellow-400 fill-current group-hover:text-yellow-500' 
                              : 'text-gray-300 group-hover:text-gray-400'
                          } transition-colors`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 ml-1 group-hover:text-gray-800 transition-colors">
                      ({averageRating > 0 ? `${averageRating.toFixed(1)}` : 'No ratings'})
                    </span>
                  </button>
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
                  {/* Rate button - only for regular users */}
                  {user?.role !== "Admin" && user?.role !== "Event office" && (
                    <button 
                      onClick={() => onRateEvent?.(event.original, event.id, event.type)}
                      className="flex-1 text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors font-medium flex items-center justify-center gap-1"
                    >
                      <Star size={12} />
                      Rate Event
                    </button>
                  )}
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
