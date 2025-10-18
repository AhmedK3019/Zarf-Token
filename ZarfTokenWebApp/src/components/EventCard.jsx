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

  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0_10px_25px_rgba(165,148,249,0.2)] border border-white/50 hover:shadow-[0_15px_35px_rgba(165,148,249,0.3)] transition-all hover:-translate-y-1 flex flex-col">
      <div className="flex-grow">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#EEE9FF] px-3 py-1 text-xs font-medium text-[#5A4BBA] mb-4">
          <span className="h-2 w-2 rounded-full bg-[#6DD3CE]" />
          <span className="capitalize">{event.type}</span>
        </div>

        <h3 className="text-xl font-bold text-[#4C3BCF] mb-3">{event.name}</h3>

        <div className="space-y-2 text-sm text-[#312A68]">
          {event.type === "conference" && (
            <p className="flex items-center gap-2">
              <User size={16} className="mt-1 text-[#736CED] flex-shrink-0" />
              {event.professorname}
            </p>
          )}

          {isBazaarBooth && event.original.bazarId && (
            <p className="flex items-center gap-2">
              <Store size={16} className="mt-1 text-[#736CED] flex-shrink-0" />
              Part of: {event.original.bazarId.bazaarname || "Bazaar"}
            </p>
          )}

          {isPlatformBooth && event.vendor && (
            <p className="flex items-center gap-2">
              <Building
                size={16}
                className="mt-1 text-[#736CED] flex-shrink-0"
              />
              Vendor: {event.vendor}
            </p>
          )}

          {event.location && !isBazaarBooth && (
            <p className="flex items-center gap-2">
              <MapPin size={16} className="mt-1 text-[#736CED] flex-shrink-0" />
              {event.location}
            </p>
          )}

          {event.duration && event.type === "booth" && (
            <p className="flex items-center gap-2">
              <Calendar
                size={16}
                className="mt-1 text-[#736CED] flex-shrink-0"
              />
              {event.duration} week{event.duration > 1 ? "s" : ""}
            </p>
          )}

          {isBazaarBooth && event.location && (
            <p className="flex items-center gap-2">
              <MapPin size={16} className="mt-1 text-[#736CED] flex-shrink-0" />
              Booth Location: {event.location}
            </p>
          )}

          {event.price > 0 && (
            <p className="flex items-center gap-2">
              <DollarSign
                size={16}
                className="mt-1 text-[#736CED] flex-shrink-0"
              />
              Price: {event.price} EGP
            </p>
          )}

          {/* Simplified Date Display */}
          {event.startDate && (
            <div className="flex items-center gap-2">
              <Calendar
                size={16}
                className="mt-1 text-[#736CED] flex-shrink-0"
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
              className={`text-[#312A68] text-sm leading-relaxed ${
                hasOverflow ? "cursor-pointer hover:text-[#4C3BCF]" : ""
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
                className="mt-1 flex items-center gap-1 text-xs text-[#736CED] hover:text-[#4C3BCF] transition-colors"
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
          <p className="text-xs text-[#312A68]/70">Faculty: {event.faculty}</p>
        )}

        {event.website && (
          <a
            href={event.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold !text-[#736CED] hover:!text-[#4C3BCF] transition-colors underline"
          >
            Visit Website →
          </a>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          {canDelete && (
            <button
              onClick={() => onDelete(event.original)}
              className="text-xs bg-rose-50 text-rose-700 px-3 py-1 rounded-full hover:bg-rose-100 transition-colors"
            >
              Delete
            </button>
          )}

          {canUpdate && (
            <button
              onClick={() => onUpdate(event.type)}
              className="text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-100 transition-colors"
            >
              Update
            </button>
          )}

          {isRegistered && (
            <button
              disabled
              className="text-xs bg-gray-300 text-gray-600 px-3 py-1 rounded-full transition-colors hover:bg-gray-400 cursor-not-allowed"
            >
              Registered ✓
            </button>
          )}

          {canRegister && (
            <button
              onClick={() => onRegister(event.original)}
              className="text-xs bg-[#2DD4BF] text-white px-3 py-1 rounded-full hover:bg-[#14B8A6] transition-colors"
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
                className="text-xs bg-gray-300 text-gray-600 px-3 py-1 rounded-full transition-colors hover:bg-gray-400 cursor-not-allowed"
              >
                Registration Closed
              </button>
            )}

          {isBazaar && (
            <button
              onClick={() => onViewBooths(event.original)}
              className="text-xs font-semibold text-[#736CED] hover:text-[#4C3BCF] transition-colors"
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
              className="text-xs font-semibold text-[#736CED] hover:text-[#4C3BCF] transition-colors"
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
