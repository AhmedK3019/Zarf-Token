import React, { useState, useRef, useEffect } from "react";
import { getEventDetails, formatDate } from "../pages/eventUtils";
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
  const event = getEventDetails(rawEvent);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const descriptionRef = useRef(null);
  const isRegistered = event.attendees.some((attendee) => attendee.userId === user?._id);

  // Check if description overflows one line
  useEffect(() => {
    if (descriptionRef.current && event.description) {
      const element = descriptionRef.current;
      // Check if the content is taller than one line
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

  const canRegister =
    userIsEligible &&
    (event.type === "trip" || event.type === "workshop") &&
    // Use the original data to check for both field name spellings
    (rawEvent.registrationdeadline || rawEvent.registerationdeadline) &&
    new Date() < new Date(rawEvent.registrationdeadline || rawEvent.registerationdeadline) &&
    !isRegistered && // Use the variable here
    (event.capacity ? event.attendees.length < event.capacity : true);

  const isBazaar = event.type === 'bazaar';
  const isPlatformBooth = event.type === 'booth' && !event.original.isBazarBooth;
  const isBazaarBooth = event.type === 'booth' && event.original.isBazarBooth;

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
          <span className="capitalize">
            {event.type}
          </span>
        </div>

        <h3 className="text-xl font-bold text-[#4C3BCF] mb-3">{event.name}</h3>

        <div className="space-y-2 text-sm text-[#312A68]">
          {/* Your existing event details... */}
          {isBazaarBooth && event.original.bazarId && (
            <p className="flex items-center gap-2">
              <span><Store size={16} className="mt-1 text-[#736CED] flex-shrink-0" /></span>
              Part of: {event.original.bazarId.bazaarname || 'Bazaar'}
            </p>
          )}

          {isPlatformBooth && event.vendor && (
            <p className="flex items-center gap-2">
              <span><Building size={16} className="mt-1 text-[#736CED] flex-shrink-0" /></span>
              Vendor: {event.vendor}
            </p>
          )}
          {event.duration && !isBazaarBooth && (
            <p className="flex items-center gap-2">
              <span><Calendar size={16} className="mt-1 text-[#736CED] flex-shrink-0" /></span>
              {event.duration} week(s)
            </p>
          )}
          {event.location && !isBazaarBooth && (
            <p className="flex items-center gap-2">
              <span><MapPin size={16} className="mt-1 text-[#736CED] flex-shrink-0" /></span>
              {event.location}
            </p>
          )}

          {isBazaarBooth && event.location && (
            <p className="flex items-center gap-2">
              <span><MapPin size={16} className="mt-1 text-[#736CED] flex-shrink-0" /></span>
              Booth Location: {event.location}
            </p>
          )}

          {event.price > 0 && (
            <p className="flex items-center gap-2">
              <span><DollarSign size={16} className="mt-1 text-[#736CED] flex-shrink-0" /></span>
              Price: {event.price} EGP
            </p>
          )}

          {event.startDate && (
            <p className="flex items-center gap-2">
              <span><Clock size={16} className="mt-1 text-[#736CED] flex-shrink-0" /></span>
              {formatDate(event.startDate)}
            </p>
          )}

          {event.endDate && (
            <p className="flex items-center gap-2">
              <span><Clock size={16} className="mt-1 text-[#736CED] flex-shrink-0" /></span>
              Ends: {formatDate(event.endDate)}
            </p>
          )}

          {event.registrationDeadline && (
            <p className="flex items-center gap-2 text-[#E53E3E]">
              <span><ClockAlert size={16} className="mt-1 text-[#736CED] flex-shrink-0" /></span>
              Register by: {formatDate(new Date(event.registrationDeadline))}
            </p>
          )}
        </div>

        {/* Description with smart expand/collapse */}
        {event.description && (
          <div className="mt-4">
            <div
              ref={descriptionRef}
              className={`text-[#312A68] text-sm leading-relaxed ${hasOverflow ? 'cursor-pointer hover:text-[#4C3BCF]' : ''
                } transition-colors ${isDescriptionExpanded ? 'line-clamp-none' : 'line-clamp-1'
                }`}
              onClick={toggleDescription}
            >
              {event.description}
            </div>

            {/* Only show Read more/Show less if description overflows */}
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
            <button onClick={() => onDelete(event.original)} className="text-xs bg-rose-50 text-rose-700 px-3 py-1 rounded-full hover:bg-rose-100 transition-colors">
              Delete
            </button>
          )}

          {/* Show Registered button if already registered */}
          {isRegistered && (
            <button disabled className="text-xs bg-gray-300 text-gray-600 px-3 py-1 rounded-full transition-colors hover:bg-gray-400 cursor-not-allowed">
              Registered ✓
            </button>
          )}

          {/* Show Register button if eligible and not registered */}
          {canRegister && (
            <button onClick={() => onRegister(event.original)} className="text-xs bg-[#2DD4BF] text-white px-3 py-1 rounded-full hover:bg-[#14B8A6] transition-colors">
              Register
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

          {(isPlatformBooth || isBazaarBooth) && (
            <button onClick={() => onViewDetails(event.original)} className="text-xs font-semibold text-[#736CED] hover:text-[#4C3BCF] transition-colors">
              View Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;