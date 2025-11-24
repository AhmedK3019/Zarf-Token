import { useEffect, useState } from "react";
import api from "../../services/api.js";
import ArchivedCard from "../../components/ArchivedCard.jsx";

export default function ArchivedEvents() {
  const [archived, setArchived] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
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
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {archived.map((event) => (
        <ArchivedCard
          key={event._id}
          event={event}
          onUnArchive={handleUnArchive}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
