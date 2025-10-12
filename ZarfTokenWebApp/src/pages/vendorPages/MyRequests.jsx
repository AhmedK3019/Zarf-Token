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
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import api from "../../services/api";
import { useAuthUser } from "../../context/UserContext";

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

// --- STATUS BADGE COMPONENT ---
function StatusBadge({ status }) {
  const statusConfig = {
    Pending: {
      icon: Clock,
      color: "text-yellow-600 bg-yellow-50 border-yellow-200",
      label: "Pending Review",
    },
    Rejected: {
      icon: AlertCircle,
      color: "text-red-600 bg-red-50 border-red-200",
      label: "Rejected",
    },
  };

  const config = statusConfig[status] || statusConfig.Pending;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md border ${config.color}`}
    >
      <Icon size={12} />
      {config.label}
    </span>
  );
}

// --- MODAL COMPONENT ---
function DetailsModal({ request, onClose }) {
  if (!request) return null;

  if (request.bazarId) {
    // Bazaar Request
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl m-4 max-h-[90vh] overflow-y-auto transform animate-slide-up">
          <div className="sticky top-0 bg-white/80 backdrop-blur-lg border-b border-gray-200 p-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-[#4C3BCF]">
                {request.bazarId?.bazaarname || "Bazaar Request"}
              </h2>
              <div className="flex items-center gap-3 mt-2">
                <StatusBadge status={request.status} />
                <p className="text-sm text-[#312A68] flex items-center gap-2">
                  <MapPin size={14} />{" "}
                  {request.bazarId?.location || "Location TBD"}
                </p>
              </div>
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
                <Info size={16} className="mt-1 text-[#736CED] flex-shrink-0" />
                <div>
                  <span className="font-semibold">Booth Size:</span>{" "}
                  {request.boothSize}
                </div>
              </div>
              {request.location && (
                <div className="flex items-start gap-3">
                  <MapPin
                    size={16}
                    className="mt-1 text-[#736CED] flex-shrink-0"
                  />
                  <div>
                    <span className="font-semibold">Requested Location:</span>{" "}
                    {request.location}
                  </div>
                </div>
              )}
              {request.bazarId?.startdate && (
                <div className="flex items-start gap-3">
                  <Calendar
                    size={16}
                    className="mt-1 text-[#736CED] flex-shrink-0"
                  />
                  <div>
                    <span className="font-semibold">Event Starts:</span>{" "}
                    {formatDateTime(
                      request.bazarId.startdate,
                      request.bazarId.starttime
                    )}
                  </div>
                </div>
              )}
              {request.bazarId?.enddate && (
                <div className="flex items-start gap-3">
                  <Clock
                    size={16}
                    className="mt-1 text-[#736CED] flex-shrink-0"
                  />
                  <div>
                    <span className="font-semibold">Event Ends:</span>{" "}
                    {formatDateTime(
                      request.bazarId.enddate,
                      request.bazarId.endtime
                    )}
                  </div>
                </div>
              )}
              {request.people && request.people.length > 0 && (
                <div className="flex items-start gap-3">
                  <Users
                    size={16}
                    className="mt-1 text-[#736CED] flex-shrink-0"
                  />
                  <div>
                    <span className="font-semibold">Team Members:</span>
                    <ul className="mt-2 space-y-1">
                      {request.people.map((person, index) => (
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
              <div className="flex items-start gap-3">
                <Calendar
                  size={16}
                  className="mt-1 text-[#736CED] flex-shrink-0"
                />
                <div>
                  <span className="font-semibold">Submitted:</span>{" "}
                  {formatDate(request.createdAt)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Platform Request
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl m-4 max-h-[90vh] overflow-y-auto transform animate-slide-up">
        <div className="sticky top-0 bg-white/80 backdrop-blur-lg border-b border-gray-200 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-[#4C3BCF]">
              Platform Booth Request
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <StatusBadge status={request.status} />
              <p className="text-sm text-[#312A68] flex items-center gap-2">
                <Globe size={14} /> Virtual Storefront
              </p>
            </div>
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
              <Info size={16} className="mt-1 text-[#736CED] flex-shrink-0" />
              <div>
                <span className="font-semibold">Booth Size:</span>{" "}
                {request.boothSize}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock size={16} className="mt-1 text-[#736CED] flex-shrink-0" />
              <div>
                <span className="font-semibold">Duration:</span>{" "}
                {request.duration} weeks
              </div>
            </div>
            {request.location && (
              <div className="flex items-start gap-3">
                <MapPin
                  size={16}
                  className="mt-1 text-[#736CED] flex-shrink-0"
                />
                <div>
                  <span className="font-semibold">Platform Location:</span>{" "}
                  {request.location}
                </div>
              </div>
            )}
            {request.people && request.people.length > 0 && (
              <div className="flex items-start gap-3">
                <Users
                  size={16}
                  className="mt-1 text-[#736CED] flex-shrink-0"
                />
                <div>
                  <span className="font-semibold">Team Members:</span>
                  <ul className="mt-2 space-y-1">
                    {request.people.map((person, index) => (
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
            <div className="flex items-start gap-3">
              <Calendar
                size={16}
                className="mt-1 text-[#736CED] flex-shrink-0"
              />
              <div>
                <span className="font-semibold">Submitted:</span>{" "}
                {formatDate(request.createdAt)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- MAIN COMPONENT ---
export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [view, setView] = useState("bazaar");

  // Get user from context
  const { user } = useAuthUser();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get my vendor requests by passing vendorId as query parameter
        const response = await api.get(
          `/vendorRequests/mine?vendorId=${user._id}`
        );

        console.log("API Response:", response.data);

        // Only filter by status (backend handles vendor filtering)
        const vendorRequests = response.data.filter(
          (request) =>
            request.status === "Pending" || request.status === "Rejected"
        );

        setRequests(vendorRequests);
      } catch (err) {
        console.error("Error fetching requests:", err);
        if (err.response?.status === 401) {
          setError("Authentication failed. Please log in again.");
        } else {
          setError(
            `Failed to fetch your requests: ${
              err.response?.data?.message || err.message
            }`
          );
        }
      } finally {
        setLoading(false);
      }
    };
    if (user?._id) {
      fetchRequests();
    }
  }, [user]);

  const filteredItems = requests.filter((item) => {
    if (view === "bazaar") return item.isBazarBooth;
    if (view === "platform") return !item.isBazarBooth;
    return false;
  });

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
              <h1 className="text-4xl font-bold text-[#736CED]">My Requests</h1>
              <p className="text-md text-[#312A68] mt-2">
                Track your booth application requests and their status.
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
                Bazaar Requests
              </button>
              <button
                onClick={() => setView("platform")}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${
                  view === "platform"
                    ? "bg-[#736CED] text-white shadow"
                    : "text-[#312A68] hover:bg-white/70"
                }`}
              >
                Platform Requests
              </button>
            </div>

            {loading ? (
              <div className="text-center py-16">
                <p>Loading your requests...</p>
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
                    ? "pending/rejected bazaar requests"
                    : "pending/rejected platform requests"}
                  .
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredItems.map((request) =>
                  request.isBazarBooth ? (
                    <div
                      key={request._id}
                      className="bg-white rounded-2xl p-6 shadow-lg flex flex-col"
                    >
                      {/* Bazaar Request Card */}
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl font-bold text-[#4C3BCF]">
                            {request.bazarId?.bazaarname || "Bazaar Request"}
                          </h3>
                          <StatusBadge status={request.status} />
                        </div>
                        <p className="text-sm text-[#312A68] mt-1">
                          {request.bazarId?.shortdescription ||
                            "Bazaar booth application"}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-[#736CED]">
                          <span className="flex items-center gap-1">
                            <Building size={14} />
                            {request.boothSize}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users size={14} />
                            {request.people?.length || 0} members
                          </span>
                        </div>
                        {request.bazarId?.location && (
                          <div className="flex items-center gap-2 mt-2 text-sm text-[#312A68]">
                            <MapPin size={14} />
                            {request.bazarId.location}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-2 text-sm text-[#312A68]">
                          <Calendar size={14} />
                          Submitted {formatDate(request.createdAt)}
                        </div>
                      </div>
                      <div className="mt-auto pt-4 border-t">
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="text-sm font-semibold text-[#736CED] hover:text-[#4C3BCF] transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={request._id}
                      className="bg-white rounded-2xl p-6 shadow-lg flex flex-col"
                    >
                      {/* Platform Request Card */}
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl font-bold text-[#4C3BCF]">
                            Platform Booth Request
                          </h3>
                          <StatusBadge status={request.status} />
                        </div>
                        <p className="text-sm text-[#312A68] mt-1">
                          Virtual storefront application
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-[#736CED]">
                          <span className="flex items-center gap-1">
                            <Building size={14} />
                            {request.boothSize}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {request.duration} weeks
                          </span>
                          <span className="flex items-center gap-1">
                            <Users size={14} />
                            {request.people?.length || 0} members
                          </span>
                        </div>
                        {request.location && (
                          <div className="flex items-center gap-2 mt-2 text-sm text-[#312A68]">
                            <MapPin size={14} />
                            {request.location}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-2 text-sm text-[#312A68]">
                          <Calendar size={14} />
                          Submitted {formatDate(request.createdAt)}
                        </div>
                      </div>
                      <div className="mt-auto pt-4 border-t">
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="text-sm font-semibold text-[#736CED] hover:text-[#4C3BCF] transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </main>
      </div>
      {selectedRequest && (
        <DetailsModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </>
  );
}
