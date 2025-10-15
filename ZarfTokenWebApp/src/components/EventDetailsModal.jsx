import { getEventDetails } from "../pages/eventUtils";
import {
  Clock,
  MapPin,
  Calendar,
  Users,
  X,
  Info,
  Globe,
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

  console.log("Bazaar booth debug:", {
    rawEvent,
    hasBazarId: !!rawEvent.bazarId,
    bazarIdType: typeof rawEvent.bazarId,
    bazarIdData: rawEvent.bazarId,
    startdate: rawEvent.bazarId?.startdate,
    enddate: rawEvent.bazarId?.enddate
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl m-4 max-h-[90vh] overflow-y-auto transform animate-slide-up">
        <div className="sticky top-0 bg-white/80 backdrop-blur-lg border-b border-gray-200 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-[#4C3BCF]">
              {event.name}
            </h2>
            <p className="text-sm text-[#312A68] flex items-center gap-2 mt-1">
              <Globe size={14} /> Platform Storefront
            </p>
            {rawEvent.status && <p className="text-xs mt-2 font-semibold text-gray-600">Status: {rawEvent.status}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="space-y-4 text-[#312A68]">
            <div className="flex items-start gap-3"><Info size={16} className="mt-1 text-[#736CED] flex-shrink-0" /><div><span className="font-semibold">Size:</span> {rawEvent.boothSize}</div></div>
            {rawEvent.location && <div className="flex items-start gap-3"><MapPin size={16} className="mt-1 text-[#736CED] flex-shrink-0" /><div><span className="font-semibold">Platform Location:</span> {rawEvent.location}</div></div>}
            {/* For bazaar booths - show start and end dates */}
            {rawEvent.type === 'booth' && rawEvent.isBazarBooth && rawEvent.bazarId ? (
              <>
                <div className="flex items-start gap-3">
                  <Clock size={16} className="mt-1 text-[#736CED] flex-shrink-0" />
                  <div>
                    <span className="font-semibold">Event Dates:</span>
                    {rawEvent.bazarId.startdate ? ` ${localFormatDate(new Date(rawEvent.bazarId.startdate))}` : 'N/A'}
                    {rawEvent.bazarId.enddate ? ` - ${localFormatDate(new Date(rawEvent.bazarId.enddate))}` : ''}
                  </div>
                </div>
              </>
            ) : (
              /* For platform booths - show duration */
              <div className="flex items-start gap-3">
                <Clock size={16} className="mt-1 text-[#736CED] flex-shrink-0" />
                <div><span className="font-semibold">Duration:</span> {rawEvent.duration} weeks</div>
              </div>
            )}
            {rawEvent.people && rawEvent.people.length > 0 && (
              <div className="flex items-start gap-3">
                <Users size={16} className="mt-1 text-[#736CED] flex-shrink-0" />
                <div>
                  <span className="font-semibold">Team Members:</span>
                  <ul className="mt-2 space-y-1">
                    {rawEvent.people.map((person, index) => (<li key={index} className="text-sm bg-gray-50 p-2 rounded"><strong>{person.name}</strong> - {person.email}</li>))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsModal;