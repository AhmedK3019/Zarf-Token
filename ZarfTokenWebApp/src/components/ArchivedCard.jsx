import {
  MapPin,
  Calendar,
  RotateCcw,
  Trash2,
  ArchiveRestore,
} from "lucide-react";
export default function ArchivedCard({ event, onUnArchive, onDelete }) {
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
    <div className="relative rounded-2xl shadow-md p-6 bg-white w-full">
      {/* Action buttons at top right */}
      <div className="absolute right-4 top-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onUnArchive(event)}
          title="UnArchive"
          className="rounded-full border border-blue-200 bg-white/90 p-2 text-blue-600 shadow-sm transition hover:bg-blue-100 focus-visible:outline-none"
          aria-label="UnArchive"
        >
          <ArchiveRestore size={16} />
        </button>

        <button
          type="button"
          onClick={() => onDelete(event)}
          title="Delete"
          className="rounded-full border border-red-200 bg-white/90 p-2 text-red-600 shadow-sm transition hover:bg-red-100 focus-visible:outline-none"
          aria-label="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>

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
    </div>
  );
}
