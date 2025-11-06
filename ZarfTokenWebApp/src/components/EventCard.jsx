import React, { useState, useRef, useEffect } from "react";
import { getEventDetails, formatSimpleDate } from "../pages/eventUtils";
import { useNavigate } from "react-router-dom";
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
}) => {
  const navigate = useNavigate();
  const event = getEventDetails(rawEvent);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const descriptionRef = useRef(null);
  const isRegistered = event.attendees.some(
    (attendee) => attendee.userId === user?._id
  );

  const onUpdate = (type) => {
    navigate(`/dashboard/eventsOffice/edit-event/${type}/${event.id}`);
  };
  // Check if description overflows one line
  useEffect(() => {
    if (descriptionRef.current && event.description) {
      const element = descriptionRef.current;
      setHasOverflow(element.scrollHeight > element.clientHeight);
    }
  }, [event.description]);

  // --- Conditional Rendering Logic ---
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
    event.type === "booth" && !event.original.isBazarBooth;
  const isBazaarBooth = event.type === "booth" && event.original.isBazarBooth;
  const isWorkshop = event.type === "workshop";

  const toggleDescription = () => {
    if (hasOverflow) {
      setIsDescriptionExpanded(!isDescriptionExpanded);
    }
  };

  // Get event type color
  const getEventTypeColor = (type) => {
    const colors = {
      workshop: "#3B82F6", // Blue
      bazaar: "#8B5CF6", // Purple
      trip: "#10B981", // Green
      conference: "#F59E0B", // Orange
      booth: "#EC4899", // Pink
    };
    return colors[type] || "#4a4ae6";
  };

  const eventTypeColor = getEventTypeColor(event.type);

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex flex-col">
      <div className="flex-grow">
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium mb-4" style={{ backgroundColor: `${eventTypeColor}15`, color: eventTypeColor }}>
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: eventTypeColor }} />
          <span className="capitalize">{event.type === "booth" && !event.original.isBazarBooth ? "Platform Booth" : event.type}</span>
        </div>

        <h3 className="text-xl font-bold text-[#4a4ae6] mb-3">{event.name}</h3>

        <div className="space-y-2 text-sm text-gray-700">
          {event.type === "conference" && (
            <p className="flex items-center gap-2">
              <User size={16} className="mt-1 text-gray-500 flex-shrink-0" />
              {event.professorname}
            </p>
          )}

          {isBazaarBooth && event.original.bazarId && (
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
              <span className="text-gray-700">Booth Location: {event.location}</span>
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

          {/* Simplified Date Display */}
          {event.startDate && (
            <div className="flex items-center gap-2">
              <Calendar
                size={16}
                className="mt-1 text-gray-500 flex-shrink-0"
              />
              <span>
                Starts {formatSimpleDate(event.startDate)}
                {event.duration &&
                  ` • ${event.duration} ${
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

        {/* Description with smart expand/collapse */}
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
            Visit Website →
          </a>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          {canDelete && (
            <button
              onClick={() => onDelete(event.original)}
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

          {isRegistered && (
            <button
              disabled
              className="text-xs bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg transition-colors cursor-not-allowed font-medium"
            >
              Registered ✓
            </button>
          )}

          {canRegister && (
            <button
              onClick={() => onRegister(event.original)}
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

          {isBazaar && (
            <button
              onClick={() => onViewBooths(event.original)}
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
              onClick={() => onViewDetails(event.original)}
              className="text-xs font-semibold text-[#4a4ae6] hover:text-[#3d3dd4] transition-colors px-3 py-1.5"
            >
              View Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
