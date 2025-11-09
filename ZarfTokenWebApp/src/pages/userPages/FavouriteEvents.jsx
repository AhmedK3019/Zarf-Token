import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { useAuthUser } from "../../hooks/auth";
import EventCard from "../../components/EventCard";
import EventDetailsModal from "../../components/EventDetailsModal";

const typeOptions = [
  { id: "", name: "All Types" },
  { id: "workshop", name: "Workshops" },
  { id: "trip", name: "Trips" },
  { id: "bazaar", name: "Bazaars" },
  { id: "conference", name: "Conferences" },
  { id: "booth", name: "Booths" },
];
const statusOptions = [
  { id: "", name: "All Status" },
  { id: "upcoming", name: "Upcoming" },
  { id: "past", name: "Past" },
];
const regOptions = [
  { id: "", name: "All Registrations" },
  { id: "registered", name: "Registered" },
  { id: "not_registered", name: "Not Registered" },
];
const sortOptions = [
  { id: "date_added_desc", name: "Date Added (Newest)" },
  { id: "date_added_asc", name: "Date Added (Oldest)" },
  { id: "event_date_asc", name: "Event Date (Upcoming)" },
  { id: "event_date_desc", name: "Event Date (Latest)" },
  { id: "alpha_asc", name: "Alphabetical (A-Z)" },
  { id: "alpha_desc", name: "Alphabetical (Z-A)" },
];

export default function FavouriteEvents() {
  const { user } = useAuthUser();
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const [toastType, setToastType] = useState("info");
  const [error, setError] = useState(null);
  const [favs, setFavs] = useState([]);

  // Filters
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [regFilter, setRegFilter] = useState("");
  const [sortBy, setSortBy] = useState("date_added_desc");

  // Modals
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchFavourites = async () => {
    if (!user?._id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/user/getFavourites/${user._id}`);
      const list = (res?.data?.favourites || []).map((r) => ({
        ...r,
        status:
          r.status || (r.item
            ? (new Date(r.item.enddate || r.item.startdate) < new Date()
                ? "past"
                : (new Date(r.item.startdate) > new Date() ? "upcoming" : "ongoing"))
            : "unavailable"),
        addedAt: r.addedAt || new Date().toISOString(),
        registration: r.registration || "unknown",
      }));
      setFavs(list);
      setToastMsg("Favorites loaded"); setToastType("success"); setTimeout(()=>setToastMsg(null),1500);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load favourites");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavourites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  const filtered = useMemo(() => {
    let out = favs.slice();
    if (typeFilter) out = out.filter((f) => f.itemType === typeFilter);
    if (statusFilter) out = out.filter((f) => f.status === statusFilter);
    if (regFilter)
      out = out.filter((f) =>
        regFilter === "registered"
          ? f.registration === "registered"
          : f.registration !== "registered"
      );
    const sortKey = sortBy.split("_")[0];
    const sortDir = sortBy.endsWith("desc") ? -1 : 1;
    out.sort((a, b) => {
      if (sortKey === "alpha") {
        const an = a.item?.workshopname || a.item?.tripname || a.item?.bazaarname || a.item?.conferencename || a.item?.boothname || "";
        const bn = b.item?.workshopname || b.item?.tripname || b.item?.bazaarname || b.item?.conferencename || b.item?.boothname || "";
        return sortDir * an.localeCompare(bn);
      }
      if (sortKey === "event") {
        const at = a.item?.startdate ? new Date(a.item.startdate).getTime() : 0;
        const bt = b.item?.startdate ? new Date(b.item.startdate).getTime() : 0;
        return sortDir * (at - bt);
      }
      // default date_added
      const at = a.addedAt ? new Date(a.addedAt).getTime() : 0;
      const bt = b.addedAt ? new Date(b.addedAt).getTime() : 0;
      return sortDir * (at - bt);
    });
    return out;
  }, [favs, typeFilter, statusFilter, regFilter, sortBy]);

  const handleRemove = async (fav) => {
    try {
      await api.post(`/user/removeFavourite/${user._id}`, {
        itemType: fav.itemType,
        itemId: fav.itemId,
      });
      setFavs((cur) =>
        cur.filter(
          (x) => !(x.itemType === fav.itemType && x.itemId === fav.itemId)
        )
      );
      setToastMsg("Removed from favorites");
      setToastType("success");
      setTimeout(() => setToastMsg(null), 2000);
      return true;
    } catch (e) {
      setToastMsg(
        e?.response?.data?.message || "Failed to remove from favorites"
      );
      setToastType("error");
      setTimeout(() => setToastMsg(null), 2500);
      return false;
    }
  };

  const totalCount = filtered.length;

  return (
    <div className="p-6 w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#4C3BCF]">My Favorites</h2>
        <div className="text-sm text-gray-600">You have {totalCount} events in favorites</div>
      </div>

      {/* Filters & Sorting */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6 max-w-7xl mx-auto">
        <select className="border rounded-lg p-2" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          {typeOptions.map((o) => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </select>
        <select className="border rounded-lg p-2" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          {statusOptions.map((o) => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </select>
        <select className="border rounded-lg p-2" value={regFilter} onChange={(e) => setRegFilter(e.target.value)}>
          {regOptions.map((o) => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </select>
        <select className="border rounded-lg p-2" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          {sortOptions.map((o) => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="py-20 text-center text-[#312A68]">Loading your favorites...</div>
      )}
      {error && (
        <div className="py-4 text-red-600">{error}</div>
      )}
      {!loading && !error && filtered.length === 0 && (
        <div className="bg-white rounded-xl p-10 text-center border">
          <div className="text-lg font-semibold text-[#4C3BCF] mb-2">No favorites yet</div>
          <div className="text-sm text-gray-600 mb-4">Browse events and add them to your favorites.</div>
          <a href="/dashboard/user/all-events" className="inline-block px-4 py-2 rounded-full bg-[#736CED] text-white hover:bg-[#5b53d6]">Browse Events</a>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((fav) => (
          <div key={`${fav.itemType}-${fav.itemId}`} className="relative">
            {fav.item ? (
              <EventCard
                event={{ ...fav.item, type: fav.itemType }} 
                user={user}
                userIsPrivileged={false}
                userIsEligible={true}
                onViewDetails={() => { setSelectedEvent(fav.item); setShowDetailsModal(true); }}
                isFavourite={true}
                onToggleFavourite={() => handleRemove(fav)}
              />
            ) : (
              <div className="border rounded-lg p-4 bg-gray-50 text-gray-600 flex flex-col gap-4">
                <div>Event no longer available</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showDetailsModal && selectedEvent && (
        <EventDetailsModal event={selectedEvent} onClose={() => setShowDetailsModal(false)} />
      )}
    {toastMsg && (<div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-md text-white ${toastType==="error"?"bg-red-600":"bg-emerald-600"}`}>{toastMsg}</div>)}
    </div>
  );
}
