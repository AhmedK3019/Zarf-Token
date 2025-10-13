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
  const [view, setView] = useState("bazaar");

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
  }, [user]);

  const filteredItems = booths.filter((item) => {
    if (view === "bazaar") return item.isBazarBooth;
    if (view === "platform") return !item.isBazarBooth;
    return false;
  });

  const getPlatformBoothEndDate = (startDate, durationWeeks) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + durationWeeks * 7);
    return formatDate(d.toISOString());
  };

  return (
    <>
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } } .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        @keyframes slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } } .animate-slide-up { animation: slide-up 0.4s ease-out forwards; }
      `}</style>
      <div className="min-h-screen w-full bg-[#D5CFE1] text-[#1F1B3B] font-sans">
        <main className="flex w-full flex-1 flex-col items-center px-4 sm:px-6 py-8">
          <div className="w-full max-w-6xl">
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold text-[#736CED]">My Booths</h1>
              <p className="text-md text-[#312A68] mt-2">
                Manage your accepted booths and platform storefronts.
              </p>
            </div>

            <div className="mb-6 flex justify-center bg-white/50 p-1 rounded-full w-fit mx-auto shadow-inner">
              <button
                onClick={() => setView("bazaar")}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${
                  view === "bazaar"
                    ? "bg-[#736CED] text-white shadow"
                    : "text-[#312A68] hover:bg-white/70"
                }`}
              >
                Bazaar Booths
              </button>
              <button
                onClick={() => setView("platform")}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${
                  view === "platform"
                    ? "bg-[#736CED] text-white shadow"
                    : "text-[#312A68] hover:bg-white/70"
                }`}
              >
                Platform Booths
              </button>
            </div>

            {loading ? (
              <div className="text-center py-16">
                <p>Loading your booths...</p>
              </div>
            ) : error ? (
              <div className="text-center py-16 text-red-500">
                <p>{error}</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-16 bg-white/50 rounded-2xl">
                <p className="text-lg text-[#312A68]">
                  You have no{" "}
                  {view === "bazaar"
                    ? "accepted bazaar booths"
                    : "active platform booths"}{" "}
                  yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredItems.map((booth) => (
                  <div
                    key={booth._id}
                    className="bg-white rounded-2xl p-6 shadow-lg flex flex-col"
                  >
                    <div>
                      <h3 className="text-xl font-bold text-[#4C3BCF]">
                        {booth.boothname || (booth.isBazarBooth ? "Bazaar Booth" : "Platform Storefront")}
                      </h3>
                      {booth.bazarId?.bazaarname && (
                          <p className="text-lg font-semibold text-[#736CED] mt-1">
                            at {booth.bazarId.bazaarname}
                          </p>
                        )}
                      <div className="flex flex-wrap gap-4 mt-3 text-sm text-[#736CED]">
                        
                        <span className="flex items-center gap-1">
                          <Info size={14} />
                          {booth.boothSize}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {booth.duration ? `${booth.duration} weeks` : (booth.bazarId?.startdate && booth.bazarId?.enddate ? `${formatDate(booth.bazarId.startdate)} - ${formatDate(booth.bazarId.enddate)}` : "")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={14} className="mt-1 text-[#736CED] flex-shrink-0" />
                          <span>{booth.people ? booth.people.length : 0}</span>
                        </span>
                      </div>
                      {booth.location && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-[#312A68]">
                          <MapPin size={14} />
                          {booth.location}
                        </div>
                      )}
                      {booth.isBazarBooth && booth.bazarId?.location && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-[#312A68]">
                          <MapPin size={14} />
                          {booth.bazarId.location}
                        </div>
                      )}
                    </div>
                    <div className="mt-auto pt-4">
                      <button
                        onClick={() => setSelectedBooth(booth)}
                        className="text-sm font-semibold text-[#736CED] hover:text-[#4C3BCF] transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
