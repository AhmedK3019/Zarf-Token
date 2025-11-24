import { MapPin, Calendar } from "lucide-react";
export default function ArchivedCard({ event, onUnArchive, onDelete }) {
  const actionButtonBase =
    "w-full rounded-lg px-4 py-2 text-sm font-semibold text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

  return (
    <div className="rounded-2xl shadow-md p-6 bg-white w-full">
      {/* Event Type Badge */}
      <div className="inline-flex items-center justify-center gap-0.5 bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
        <span className="w-2 h-2 bg-gary-600 rounded-full"></span>
        {event.type}
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
          un archive
        </button>

        <button
          type="button"
          onClick={() => {
            onDelete(event);
          }}
          className={`${actionButtonBase} border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 focus-visible:ring-red-200 rounded-lg`}
        >
          delete
        </button>
      </div>
    </div>
  );
}
