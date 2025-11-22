import React, { useState, useEffect } from "react";
import {
  Clock,
  MapPin,
  Calendar,
  Users,
  X,
  Building,
  Info,
  Globe,
  RefreshCcw,
  Search,
} from "lucide-react";
import api from "../../services/api";
import { useAuthUser } from "../../hooks/auth";

// --- UTILITY FUNCTIONS ---
function formatDate(dateStr) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch (e) {
    return dateStr;
  }
}
function formatDateTime(dateStr, timeStr) {
  try {
    const d = new Date(dateStr);
    if (timeStr) {
      const [hours, minutes] = timeStr.split(":");
      d.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    }
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch (e) {
    return `${formatDate(dateStr)} ${timeStr || ""}`;
  }
}

const StatCard = ({ label, value, helper, accent }) => (
  <div className="rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm">
    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
      {label}
    </p>
    <p className={`text-2xl font-bold ${accent || "text-[#001845]"}`}>
      {value}
    </p>
    {helper ? <p className="text-xs text-gray-500">{helper}</p> : null}
  </div>
);

// --- MODAL COMPONENT ---
function DetailsModal({ booth, onClose, getPlatformBoothEndDate }) {
  if (!booth) return null;

  if (booth.bazarId) {
    // Bazaar Booth
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl m-4 max-h-[90vh] overflow-y-auto transform animate-slide-up">
          <div className="sticky top-0 bg-white/80 backdrop-blur-lg border-b border-gray-200 p-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-[#4C3BCF]">
                {booth.boothname || "Bazaar Booth Request"}
              </h2>
              {booth.bazarId?.bazaarname && (
                <p className="text-lg font-semibold text-[#736CED] mt-1">
                  at {booth.bazarId.bazaarname}
                </p>
              )}
              <p className="text-sm text-[#312A68] flex items-center gap-2 mt-1">
                <MapPin size={14} /> {booth.bazarId?.location}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Building
                  size={16}
                  className="mt-1 text-[#736CED] flex-shrink-0"
                />
                <div>
                  <span className="font-semibold">Booth Name:</span>{" "}
                  {booth.boothname}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Info size={16} className="mt-1 text-[#736CED] flex-shrink-0" />
                <div>
                  <span className="font-semibold">Size:</span> {booth.boothSize}
                </div>
              </div>
              {booth.location && (
                <div className="flex items-start gap-3">
                  <MapPin
                    size={16}
                    className="mt-1 text-[#736CED] flex-shrink-0"
                  />
                  <div>
                    <span className="font-semibold">Location:</span>{" "}
                    {booth.location}
                  </div>
                </div>
              )}
              {booth.bazarId?.startdate && (
                <div className="flex items-start gap-3">
                  <Calendar
                    size={16}
                    className="mt-1 text-[#736CED] flex-shrink-0"
                  />
                  <div>
                    <span className="font-semibold">Starts:</span>{" "}
                    {formatDateTime(
                      booth.bazarId.startdate,
                      booth.bazarId.starttime
                    )}
                  </div>
                </div>
              )}
              {booth.bazarId?.enddate && (
                <div className="flex items-start gap-3">
                  <Clock
                    size={16}
                    className="mt-1 text-[#736CED] flex-shrink-0"
                  />
                  <div>
                    <span className="font-semibold">Ends:</span>{" "}
                    {formatDateTime(
                      booth.bazarId.enddate,
                      booth.bazarId.endtime
                    )}
                  </div>
                </div>
              )}
              {booth.people && booth.people.length > 0 && (
                <div className="flex items-start gap-3">
                  <Users
                    size={16}
                    className="mt-1 text-[#736CED] flex-shrink-0"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">Team Members:</span>
                    {booth.people.map((person, index) => (
                      <span
                        key={index}
                        className="inline-block bg-gray-50 px-2 py-1 rounded text-xs font-medium text-[#312A68]"
                      >
                        {person.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Platform Booth
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl m-4 max-h-[90vh] overflow-y-auto transform animate-slide-up">
        <div className="sticky top-0 bg-white/80 backdrop-blur-lg border-b border-gray-200 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-[#4C3BCF]">
              {booth.boothname}
            </h2>
            <p className="text-sm text-[#312A68] flex items-center gap-2 mt-1">
              <Globe size={14} /> Platform Storefront
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Building
                size={16}
                className="mt-1 text-[#736CED] flex-shrink-0"
              />
              <div>
                <span className="font-semibold">Booth Name:</span>{" "}
                {booth.boothname}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Info size={16} className="mt-1 text-[#736CED] flex-shrink-0" />
              <div>
                <span className="font-semibold">Size:</span> {booth.boothSize}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock size={16} className="mt-1 text-[#736CED] flex-shrink-0" />
              <div>
                <span className="font-semibold">Duration:</span>{" "}
                {booth.duration} weeks
              </div>
            </div>
            {booth.location && (
              <div className="flex items-start gap-3">
                <MapPin
                  size={16}
                  className="mt-1 text-[#736CED] flex-shrink-0"
                />
                <div>
                  <span className="font-semibold">Platform Location:</span>{" "}
                  {booth.location}
                </div>
              </div>
            )}
            {booth.people && booth.people.length > 0 && (
              <div className="flex items-start gap-3">
                <Users
                  size={16}
                  className="mt-1 text-[#736CED] flex-shrink-0"
                />
                <div>
                  <span className="font-semibold">Team Members:</span>
                  <ul className="mt-2 space-y-1">
                    {booth.people.map((person, index) => (
                      <li
                        key={index}
                        className="text-sm bg-gray-50 p-2 rounded"
                      >
                        <strong>{person.name}</strong> - {person.email}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- MAIN COMPONENT ---
export default function AcceptedBooths() {
  const [booths, setBooths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooth, setSelectedBooth] = useState(null);
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Get user from context
  const { user } = useAuthUser();

  useEffect(() => {
    const fetchBooths = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get("/booths/my-booths");

        const vendorBooths = response.data.filter(
          (booth) => booth.status === "Approved"
        );

        setBooths(vendorBooths);
      } catch (err) {
        console.error("Error fetching booths:", err);
        if (err.response?.status === 401) {
          setError("Please log in to view your booths.");
        } else {
          setError("Failed to fetch your booths. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchBooths();
  }, [user, refreshKey]);

  const stats = React.useMemo(() => {
    return booths.reduce(
      (acc, booth) => {
        acc.total += 1;
        if (booth.isBazarBooth) acc.bazaar += 1;
        else acc.platform += 1;
        return acc;
      },
      { total: 0, bazaar: 0, platform: 0 }
    );
  }, [booths]);

  const filteredItems = booths.filter((item) => {
    if (typeFilter === "bazaar" && !item.isBazarBooth) return false;
    if (typeFilter === "platform" && item.isBazarBooth) return false;
    const term = search.trim().toLowerCase();
    if (term) {
      const haystack = [
        item.boothname,
        item.bazarId?.bazaarname,
        item.location,
        item.bazarId?.location,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(term)) return false;
    }
    return true;
  });

  const getPlatformBoothEndDate = (startDate, durationWeeks) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + durationWeeks * 7);
    return formatDate(d.toISOString());
  };

  const handleRefresh = () => setRefreshKey((key) => key + 1);

  const resetFilters = () => {
    setTypeFilter("all");
    setSearch("");
  };

  return (
    <>
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } } .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        @keyframes slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } } .animate-slide-up { animation: slide-up 0.4s ease-out forwards; }
      `}</style>
      <div className="min-h-screen w-full bg-gradient-to-br from-[#f5f7ff] via-white to-[#eef2ff] text-[#1F1B3B] font-sans px-4 py-8 lg:px-6 lg:py-10">
        <main className="mx-auto w-full max-w-7xl space-y-6">
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total"
              value={stats.total}
              helper="Approved booths"
              accent="text-[#001845]"
            />
            <StatCard
              label="Bazaar"
              value={stats.bazaar}
              helper="Accepted bazaar booths"
              accent="text-[#4C3BCF]"
            />
            <StatCard
              label="Platform"
              value={stats.platform}
              helper="Active platform booths"
              accent="text-[#736CED]"
            />
            <StatCard
              label="Team Size"
              value={booths.reduce(
                (sum, b) => sum + (b.people?.length || 0),
                0
              )}
              helper="Team members across booths"
              accent="text-emerald-700"
            />
          </section>

          <section className="rounded-3xl border border-gray-100 bg-white/80 p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Filters
                </p>
                <p className="text-sm text-gray-600">
                  Search and filter your accepted booths by type or name.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {typeFilter !== "all" || search.trim().length > 0 ? (
                  <button
                    onClick={resetFilters}
                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
                  >
                    <RefreshCcw className="h-4 w-4 text-gray-500" />
                    Clear filters
                  </button>
                ) : null}
                <button
                  onClick={handleRefresh}
                  className="inline-flex items-center gap-2 rounded-full border border-[#4C3BCF] bg-[#4C3BCF] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3728a6] hover:border-[#3728a6]"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Refresh
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white/70 p-4 shadow-inner">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
                <label className="relative flex-1 min-w-[220px]">
                  <span className="mb-2 block text-sm font-semibold text-gray-800">
                    Search
                  </span>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by booth or bazaar"
                      className="h-12 w-full rounded-2xl border border-gray-200 bg-white pl-10 pr-4 text-sm font-semibold text-gray-900 shadow-sm transition focus:border-[#4C3BCF] focus:outline-none focus:ring-2 focus:ring-[#d7d1ff]"
                    />
                  </div>
                </label>
                <label className="w-full lg:w-56">
                  <span className="mb-2 block text-sm font-semibold text-gray-800">
                    Type
                  </span>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-900 shadow-sm transition focus:border-[#4C3BCF] focus:outline-none focus:ring-2 focus:ring-[#d7d1ff]"
                  >
                    <option value="all">All</option>
                    <option value="bazaar">Bazaar</option>
                    <option value="platform">Platform</option>
                  </select>
                </label>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            {loading ? (
              <div className="flex flex-col items-center gap-4 rounded-3xl border border-gray-100 bg-white/80 px-6 py-12 text-center shadow-sm">
                <div className="inline-block h-12 w-12 border-4 border-[#736CED] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-gray-600">Loading your booths...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center gap-3 rounded-3xl border border-rose-200 bg-rose-50 px-6 py-10 text-center text-rose-700">
                <p className="text-lg font-semibold">{error}</p>
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-300 transition hover:bg-rose-700"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Try again
                </button>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-gray-200 bg-white/80 px-8 py-16 text-center shadow-sm">
                <p className="text-lg font-semibold text-[#001845]">
                  You have no approved booths that match these filters.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 rounded-full border border-[#4C3BCF] px-4 py-2 text-sm font-semibold text-[#4C3BCF] transition hover:bg-[#4C3BCF] hover:text-white"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredItems.map((booth) => (
                  <div
                    key={booth._id}
                    className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white/95 p-6 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#4C3BCF] via-[#E11D48] to-[#001845]" />
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          {booth.isBazarBooth
                            ? "Bazaar booth"
                            : "Platform booth"}
                        </p>
                        <h3 className="text-xl font-bold text-[#001845]">
                          {booth.boothname ||
                            (booth.isBazarBooth
                              ? "Bazaar Booth"
                              : "Platform Storefront")}
                        </h3>
                        {booth.bazarId?.bazaarname && (
                          <p className="text-sm font-semibold text-[#736CED]">
                            at {booth.bazarId.bazaarname}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 text-sm text-[#312A68] sm:grid-cols-2">
                      <div className="inline-flex items-center gap-2 rounded-2xl bg-gray-50 px-3 py-2 font-semibold">
                        <Info size={14} />
                        {booth.boothSize}
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-2xl bg-gray-50 px-3 py-2 font-semibold">
                        <Clock size={14} />
                        {booth.duration
                          ? `${booth.duration} weeks`
                          : booth.bazarId?.startdate && booth.bazarId?.enddate
                          ? `${formatDate(
                              booth.bazarId.startdate
                            )} - ${formatDate(booth.bazarId.enddate)}`
                          : "Scheduled"}
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-2xl bg-gray-50 px-3 py-2 font-semibold">
                        <Users size={14} />
                        {booth.people ? booth.people.length : 0} team
                      </div>
                      {booth.isBazarBooth && booth.bazarId?.startdate && (
                        <div className="inline-flex items-center gap-2 rounded-2xl bg-gray-50 px-3 py-2 font-semibold">
                          <Calendar size={14} />
                          Starts{" "}
                          {formatDateTime(
                            booth.bazarId.startdate,
                            booth.bazarId.starttime
                          )}
                        </div>
                      )}
                    </div>

                    {booth.location && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-[#312A68]">
                        <MapPin size={14} />
                        {booth.location}
                      </div>
                    )}
                    {booth.isBazarBooth && booth.bazarId?.location && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-[#312A68]">
                        <MapPin size={14} />
                        {booth.bazarId.location}
                      </div>
                    )}

                    <div className="mt-auto pt-4 flex items-center justify-between">
                      <button
                        onClick={() => setSelectedBooth(booth)}
                        className="inline-flex items-center gap-2 rounded-full border border-[#4C3BCF] bg-[#4C3BCF] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3728a6] hover:border-[#3728a6]"
                      >
                        View Details
                      </button>
                      {!booth.isBazarBooth &&
                        booth.duration &&
                        booth.startdate && (
                          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Ends{" "}
                            {getPlatformBoothEndDate(
                              booth.startdate,
                              booth.duration
                            )}
                          </span>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
      {selectedBooth && (
        <DetailsModal
          booth={selectedBooth}
          onClose={() => setSelectedBooth(null)}
          getPlatformBoothEndDate={getPlatformBoothEndDate}
        />
      )}
    </>
  );
}
