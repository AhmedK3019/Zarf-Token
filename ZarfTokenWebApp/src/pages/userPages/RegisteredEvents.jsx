import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuthUser } from "../../hooks/auth";

export default function RegisteredEvents() {
  const { user } = useAuthUser();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRegisteredEvents = async () => {
      try {
        const res = await api.get(
          `/allEvents/getEventsRegisteredByMe/${user._id}`
        );
        setEvents(res.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load registered events.");
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) fetchRegisteredEvents();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-primary">
        Loading your registered events...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto mt-10 p-4 bg-red-100 text-red-800 rounded-lg shadow">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-3xl shadow-[0_10px_25px_rgba(115,108,237,0.15)]">
      <h2 className="text-2xl font-semibold text-primary mb-6">
        My Registered Events
      </h2>

      {events.length === 0 ? (
        <div className="text-center text-primary/60 py-12">
          You haven’t registered for any events yet 🎉
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {events.map((event) => (
            <div
              key={event._id}
              className="p-5 rounded-2xl border border-primary/10 bg-primary/5 hover:shadow-[0_8px_20px_rgba(115,108,237,0.15)] transition"
            >
              <h3 className="text-lg font-semibold text-primary mb-2">
                {event.title}
              </h3>
              <p className="text-sm text-primary/70 mb-1">
                <strong>Date:</strong>{" "}
                {new Date(event.date).toLocaleDateString()}
              </p>
              <p className="text-sm text-primary/70 mb-3">
                <strong>Location:</strong> {event.location || "TBA"}
              </p>
              <p className="text-sm text-primary/80">
                {event.description?.slice(0, 100)}...
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
