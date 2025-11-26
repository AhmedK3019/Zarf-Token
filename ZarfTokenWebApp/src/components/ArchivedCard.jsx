import { MapPin, Calendar } from "lucide-react";
export default function ArchivedCard({ event, onUnArchive, onDelete }) {
  const actionButtonBase =
    "w-full rounded-lg px-4 py-2 text-sm font-semibold text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

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
    <div className="rounded-2xl shadow-md p-6 bg-white w-full">
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

      {/* Name */}
      <h2 className="text-2xl font-semibold mt-3">
        {event.tripname ||
          event.workshopname ||
          event.bazaarname ||
          event.boothname ||
          event.conferencename}
      </h2>

      {/* Location */}
      <div className="flex items-center gap-2 text-gray-600 mt-3">
        <MapPin className="w-4 h-4 text-gray-500" />
        <span>{event.location || "Unknown location"}</span>
      </div>

      {/* Start date */}
      <div className="flex items-center gap-2 text-gray-600 mt-2">
        <Calendar className="w-4 h-4 text-gray-500" />
        <span>Starts {new Date(event.startdate).toDateString()}</span>
      </div>
      {/* enddate */}
      <div className="flex items-center gap-2 text-gray-600 mt-2">
        <Calendar className="w-4 h-4 text-gray-500" />
        <span>Ends {new Date(event.enddate).toDateString()}</span>
      </div>

      {/* Short description */}
      <p className="mt-4 text-gray-700">{event.shortdescription || ""}</p>

      <hr className="my-6" />
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => {
            onUnArchive(event);
          }}
          className={`${actionButtonBase} border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 focus-visible:ring-blue-200 rounded-lg`}
        >
          UnArchive
        </button>

        <button
          type="button"
          onClick={() => {
            onDelete(event);
          }}
          className={`${actionButtonBase} border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 focus-visible:ring-red-200 rounded-lg`}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
