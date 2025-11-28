import { useEffect, useState } from "react";
import api from "../../services/api.js";
import { Trash2, ArchiveRestore } from "lucide-react";

export default function ArchivedEvents() {
  const [archived, setArchived] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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

  const getEventName = (event) => {
    return (
      event.tripname ||
      event.workshopname ||
      event.bazaarname ||
      event.boothname ||
      event.conferencename ||
      "Unnamed Event"
    );
  };

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };
  const getArchived = async () => {
    try {
      setLoading(true);
      let response = await api.get("/allEvents/getArchivedEvents");
      setArchived(response.data);
      setError("");
    } catch (error) {
      setError("Error fetching archived events");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getArchived();
  }, []);

  const LoadingSpinner = () => (
    <div className="text-center py-12">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#4a4ae6]"></div>
      <p className="mt-4 text-gray-600">Loading events...</p>
    </div>
  );
  const handleUnArchive = async (item) => {
    try {
      await api.patch(`/allEvents/unArchiveEvent/${item._id}/${item.type}`);
      let NewData = archived.filter((event) => {
        event._id !== item._id;
      });
      setArchived(NewData);
      getArchived();
    } catch (error) {
      console.error("Error happened while unarchiving:" + error);
    }
  };
  const handleDelete = async (item) => {
    try {
      let path;
      switch (item.type) {
        case "workshop":
          path = `workshops/deleteWorkShop/${item._id}`;
          break;
        case "booth":
          path = `booths/${item._id}`;
          break;
        case "bazaar":
          path = `bazaars/deleteBazaar/${item._id}`;
          break;
        case "trip":
          path = `trips/deleteTrip/${item._id}`;
          break;
        case "conference":
          path = `conferences/deleteConference/${item._id}`;
          break;
      }

      await api.delete(path);
      let NewData = archived.filter((event) => {
        event._id !== item._id;
      });
      setArchived(NewData);
      getArchived();
    } catch (error) {
      console.error("Error happened while deleting:" + error);
    }
  };

  if (loading) {
    return (
      <div>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-8 text-center col-span-full">
        <p className="font-bold">⚠️ Data Error</p>
        <p>{error}</p>
      </div>
    );
  }

  if (archived.length === 0) {
    return (
      <div className="text-gray-500 p-8 text-center col-span-full">
        <p className="font-bold">📁 No Archived Events Found</p>
        <p>Your archive is empty.</p>
      </div>
    );
  }
  return (
    <div className="p-6">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#1F1B3B] text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Event Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Location
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Start Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  End Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Description
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {archived.map((event) => {
                const eventTypeColor = getEventTypeColor(event.type);
                return (
                  <tr
                    key={event._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span
                        className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold capitalize"
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
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">
                        {getEventName(event)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {event.location || "Unknown location"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {formatDate(event.startdate)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {formatDate(event.enddate)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div
                        className="max-w-xs truncate"
                        title={event.shortdescription}
                      >
                        {event.shortdescription || "No description"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleUnArchive(event)}
                          className="rounded-full border border-blue-200 bg-white/90 p-2 text-blue-600 shadow-sm transition hover:bg-blue-50 focus-visible:outline-none"
                          title="Unarchive"
                          aria-label="Unarchive"
                        >
                          <ArchiveRestore size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(event)}
                          className="rounded-full border border-red-200 bg-white/90 p-2 text-red-600 shadow-sm transition hover:bg-red-50 focus-visible:outline-none"
                          title="Delete"
                          aria-label="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
