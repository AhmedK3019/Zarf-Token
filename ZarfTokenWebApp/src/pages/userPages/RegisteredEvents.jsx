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

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return String(dateStr);
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    // time is already stored as string like "14:30" in models
    return timeStr;
  };

  const EventCard = ({ event }) => {
    const isWorkshop = event?.type === "workshop";
    const title = isWorkshop ? event?.workshopname : event?.tripname;
    const attendeesCount = event?.attendees?.length || 0;
    const description = event?.shortdescription || "";

    return (
      <div className="p-5 rounded-2xl border border-[#736CED]/20 bg-white/70 hover:shadow-[0_8px_20px_rgba(115,108,237,0.15)] transition">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-[#312A68]">{title}</h3>
          <span className="px-3 py-1 text-xs rounded-full bg-[#736CED]/10 text-[#736CED] font-medium">
            {isWorkshop ? "Workshop" : "Trip"}
          </span>
        </div>

        <div className="mt-2 space-y-1 text-sm text-[#312A68]/80">
          <p>
            <span className="font-semibold">Date:</span>{" "}
            {formatDate(event?.startdate)} {formatTime(event?.starttime)}
            {event?.enddate || event?.endtime ? (
              <>
                {" "}
                - {formatDate(event?.enddate)} {formatTime(event?.endtime)}
              </>
            ) : null}
          </p>
          <p>
            <span className="font-semibold">Location:</span>{" "}
            {event?.location || "TBA"}
          </p>

          {isWorkshop ? (
            <>
              {event?.facultyresponsibilty && (
                <p>
                  <span className="font-semibold">Faculty Responsible:</span>{" "}
                  {event.facultyresponsibilty}
                </p>
              )}
            </>
          ) : (
            <>
              {event?.price !== undefined && (
                <p>
                  <span className="font-semibold">Price:</span> {event.price}{" "}
                  EGP
                </p>
              )}
              {event?.capacity !== undefined && (
                <p>
                  <span className="font-semibold">Capacity:</span>{" "}
                  {attendeesCount}/{event.capacity}
                </p>
              )}
              {event?.registerationdeadline && (
                <p>
                  <span className="font-semibold">Registration deadline:</span>{" "}
                  {formatDate(event.registerationdeadline)}
                </p>
              )}
            </>
          )}
        </div>

        {description && (
          <p className="mt-3 text-sm text-[#312A68]/70 line-clamp-3">
            {description}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between text-xs text-[#312A68]/60">
          <span>
            Attendees:{" "}
            <span className="font-semibold text-[#312A68]">
              {attendeesCount}
            </span>
          </span>
          <span className="italic">ID: {event?._id?.slice(-6)}</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-muted flex items-center justify-center text-[#736CED]">
        Loading your registered events...
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-hidden bg-muted text-[#1F1B3B]">
      <div className="relative flex min-h-screen w-full flex-col items-center">
        <main className="relative z-10 flex w-full flex-1 flex-col items-center px-6 py-8">
          <div className="w-full">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-[#736CED] sm:text-4xl mb-2">
                My Registered Events
              </h2>
              {error ? (
                <p className="max-w-2xl mx-auto text-[#9F2D20] bg-[#FEE2E2] border border-[#FCA5A5] rounded-lg px-4 py-2">
                  {error}
                </p>
              ) : (
                <p className="text-[#312A68] opacity-80">
                  Here are the workshops and trips you signed up for.
                </p>
              )}
            </div>

            {events.length === 0 ? (
              <div className="text-center text-[#312A68]/70 py-16 bg-white/50 rounded-3xl">
                You haven’t registered for any events yet.
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {events.map((event) => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
