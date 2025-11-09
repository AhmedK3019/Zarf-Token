import { getEventDetails } from "../pages/eventUtils";
import {
  Clock,
  MapPin,
  Calendar,
  Users,
  X,
  Info,
  BookOpen,
  Building2,
  UserCheck,
  Briefcase,
  DollarSign,
  PlusCircle,
  ClockAlert,
  Globe,
  User,
} from "lucide-react";

const localFormatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const EventDetailsModal = ({ event: rawEvent, onClose }) => {
  if (!rawEvent) return null;

  const event = getEventDetails(rawEvent);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-muted bg-opacity-90 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl m-4 max-h-[90vh] overflow-y-auto transform animate-slide-up">
        <div className="sticky top-0 bg-white/80 backdrop-blur-lg border-b border-gray-200 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-[#4C3BCF]">{event.name}</h2>
            <div className="flex items-center gap-2 mt-2">
              <MapPin size={18} className="text-[#736CED] flex-shrink-0" />
              <span className="text-lg font-semibold text-[#736CED] capitalize">
                {event.location}
              </span>
            </div>
            {event.original.createdBy && (
              <div className="flex items-center gap-2 mt-1">
                <Users size={16} className="text-[#736CED] flex-shrink-0" />
                <span className="text-m text-[#736CED] font-semibold">
                  Created By: {event.original.createdBy.firstname}{" "}
                  {event.original.createdBy.lastname}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6 space-y-6">
          {/* BOOTH DETAILS RENDER */}
          {event.type === "booth" && (
            <div className="space-y-4 text-[#312A68]">
              <div className="flex items-start gap-3">
                <Info size={16} className="mt-1 text-[#736CED] flex-shrink-0" />
                <div>
                  <span className="font-semibold">Size:</span>{" "}
                  {rawEvent.boothSize}
                </div>
              </div>

              {rawEvent.location && (
                <div className="flex items-start gap-3">
                  <MapPin
                    size={16}
                    className="mt-1 text-[#736CED] flex-shrink-0"
                  />
                  <div>
                    <span className="font-semibold">Platform Location:</span>{" "}
                    {rawEvent.location}
                  </div>
                </div>
              )}

              {/* Show duration for ALL booths */}
              <div className="flex items-start gap-3">
                <Calendar
                  size={16}
                  className="mt-1 text-[#736CED] flex-shrink-0"
                />
                <div>
                  <span className="font-semibold">Duration:</span>{" "}
                  {rawEvent.duration} weeks
                </div>
              </div>

              {rawEvent.people && rawEvent.people.length > 0 && (
                <div className="flex items-start gap-3">
                  <Users
                    size={16}
                    className="mt-1 text-[#736CED] flex-shrink-0"
                  />
                  <div>
                    <span className="font-semibold">Team Members:</span>
                    <ul className="mt-2 space-y-1">
                      {rawEvent.people.map((person, index) => (
                        <li
                          key={index}
                          className="text-sm bg-gray-50 p-2 rounded"
                        >
                          <strong>• {person.name}</strong>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* WORKSHOP DETAILS RENDER */}
          {event.type === "workshop" && (
            <div className="space-y-4 text-[#312A68]">
              <div className="flex items-start gap-3">
                <Clock
                  size={16}
                  className="mt-1 text-[#736CED] flex-shrink-0"
                />
                <div>
                  <span className="font-semibold">Start Date:</span>{" "}
                  {event.startDate ? localFormatDate(event.startDate) : "N/A"}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar
                  size={16}
                  className="mt-1 text-[#736CED] flex-shrink-0"
                />
                <div>
                  <span className="font-semibold">End Date:</span>{" "}
                  {localFormatDate(event.endDate)}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ClockAlert
                  size={16}
                  className="mt-1 text-[#E53E3E] flex-shrink-0"
                />
                <div>
                  <span className="font-semibold">Register By:</span>{" "}
                  {event.registrationDeadline
                    ? localFormatDate(new Date(event.registrationDeadline))
                    : "N/A"}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <BookOpen
                  size={16}
                  className="mt-1 text-[#736CED] flex-shrink-0"
                />
                <div>
                  <span className="font-semibold">Full Agenda:</span>
                  <p className="text-sm whitespace-pre-wrap mt-1 bg-gray-50 p-3 rounded-md">
                    {event.fullagenda || "No agenda provided."}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building2
                  size={16}
                  className="mt-1 text-[#736CED] flex-shrink-0"
                />
                <div>
                  <span className="font-semibold">Faculty Responsible:</span>{" "}
                  {event.faculty}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users
                  size={16}
                  className="mt-1 text-[#736CED] flex-shrink-0"
                />
                <div>
                  <span className="font-semibold">Capacity:</span>{" "}
                  {event.capacity} attendees
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users
                  size={16}
                  className="mt-1 text-[#736CED] flex-shrink-0"
                />
                <div>
                  <span className="font-semibold">Registered:</span>
                  <p className="text-sm mt-1">
                    {event.attendees?.length || 0} registered
                    {event.capacity && (
                      <span className="text-gray-600 ml-2">
                        (
                        {Math.round(
                          ((event.attendees?.length || 0) / event.capacity) *
                            100
                        )}
                        % full)
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {event.fundingsource && (
                <div className="flex items-start gap-3">
                  <Briefcase
                    size={16}
                    className="mt-1 text-[#736CED] flex-shrink-0"
                  />
                  <div>
                    <span className="font-semibold">Funding Source:</span>{" "}
                    {event.fundingsource}
                  </div>
                </div>
              )}

              {event.requiredFunding > 0 && (
                <div className="flex items-start gap-3">
                  <DollarSign
                    size={16}
                    className="mt-1 text-[#736CED] flex-shrink-0"
                  />
                  <div>
                    <span className="font-semibold">Required Budget:</span>{" "}
                    {event.requiredFunding.toLocaleString()} EGP
                  </div>
                </div>
              )}

              {event.extrarequiredfunding > 0 && (
                <div className="flex items-start gap-3">
                  <PlusCircle
                    size={16}
                    className="mt-1 text-[#736CED] flex-shrink-0"
                  />
                  <div>
                    <span className="font-semibold">
                      Extra Required Funding:
                    </span>{" "}
                    {event.extrarequiredfunding.toLocaleString()} EGP
                  </div>
                </div>
              )}

              {event.professors && event.professors.length > 0 && (
                <div className="flex items-start gap-3">
                  <UserCheck
                    size={16}
                    className="mt-1 text-[#736CED] flex-shrink-0"
                  />
                  <div>
                    <span className="font-semibold">
                      Participating Professors:
                    </span>
                    <ul className="mt-2 space-y-1">
                      {event.professors.map((prof, index) => (
                        <li
                          key={index}
                          className="text-sm bg-gray-50 p-2 rounded"
                        >
                          <strong>
                            • {prof.firstname} {prof.lastname}
                          </strong>{" "}
                          {prof.email && `(${prof.email})`}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
          {/* TRIP DETAILS RENDER */}
          {event.type === "trip" && (
            <div className="space-y-4 text-[#312A68]">
              <div className="flex items-start gap-3">
                <Users
                  size={16}
                  className="mt-1 text-[#736CED] flex-shrink-0"
                />
                <div>
                  <span className="font-semibold">Registration Status:</span>
                  <p className="text-sm mt-1">
                    {event.attendees?.length || 0} of {event.capacity} people
                    registered
                    {event.capacity && (
                      <span className="text-gray-600 ml-2">
                        (
                        {Math.round(
                          ((event.attendees?.length || 0) / event.capacity) *
                            100
                        )}
                        % full)
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {event.description && (
                <div className="flex items-start gap-3">
                  <Info
                    size={16}
                    className="mt-1 text-[#736CED] flex-shrink-0"
                  />
                  <div>
                    <span className="font-semibold">Full Description:</span>
                    <p className="text-sm mt-1 whitespace-pre-wrap">
                      {event.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          {/* CONFERENCE DETAILS RENDER */}
          {event.type === "conference" && (
            <div className="space-y-4 text-[#312A68]">
              <div className="flex items-start gap-3">
                <User size={16} className="mt-1 text-[#736CED] flex-shrink-0" />
                <div>
                  <span className="font-semibold">Professor:</span>{" "}
                  {event.professorname || "N/A"}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock
                  size={16}
                  className="mt-1 text-[#736CED] flex-shrink-0"
                />
                <div>
                  <span className="font-semibold">Start Date:</span>{" "}
                  {event.startDate ? localFormatDate(event.startDate) : "N/A"}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar
                  size={16}
                  className="mt-1 text-[#736CED] flex-shrink-0"
                />
                <div>
                  <span className="font-semibold">End Date:</span>{" "}
                  {localFormatDate(event.endDate)}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin
                  size={16}
                  className="mt-1 text-[#736CED] flex-shrink-0"
                />
                <div>
                  <span className="font-semibold">Location:</span>{" "}
                  {event.location}
                </div>
              </div>

              {/* Conference Agenda */}
              <div className="flex items-start gap-3">
                <BookOpen
                  size={16}
                  className="mt-1 text-[#736CED] flex-shrink-0"
                />
                <div>
                  <span className="font-semibold">Conference Agenda:</span>
                  <p className="text-sm whitespace-pre-wrap mt-1 bg-gray-50 p-3 rounded-md">
                    {event.fullagenda || "No agenda provided."}
                  </p>
                </div>
              </div>

              {event.website && (
                <div className="flex items-start gap-3">
                  <Globe
                    size={16}
                    className="mt-1 text-[#736CED] flex-shrink-0"
                  />
                  <div>
                    <span className="font-semibold">Conference Link:</span>
                    <a
                      href={event.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#736CED] hover:underline ml-2 block mt-1"
                    >
                      {event.website}
                    </a>
                  </div>
                </div>
              )}

              {event.fundingsource && (
                <div className="flex items-start gap-3">
                  <Briefcase
                    size={16}
                    className="mt-1 text-[#736CED] flex-shrink-0"
                  />
                  <div>
                    <span className="font-semibold">Funding Source:</span>{" "}
                    {event.fundingsource}
                  </div>
                </div>
              )}

              {event.requiredFunding > 0 && (
                <div className="flex items-start gap-3">
                  <DollarSign
                    size={16}
                    className="mt-1 text-[#736CED] flex-shrink-0"
                  />
                  <div>
                    <span className="font-semibold">Required Budget:</span>{" "}
                    {event.requiredFunding.toLocaleString()} EGP
                  </div>
                </div>
              )}

              {event.extrarequiredresources && (
                <div className="flex items-start gap-3">
                  <PlusCircle
                    size={16}
                    className="mt-1 text-[#736CED] flex-shrink-0"
                  />
                  <div>
                    <span className="font-semibold">
                      Extra Required Resources:
                    </span>{" "}
                    {event.extrarequiredresources}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetailsModal;
