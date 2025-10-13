import React, { useState, useEffect } from "react";
import api from "../../services/api";
import {
  Clock,
  MapPin,
  Calendar,
  Users,
  X,
  Building,
  Info,
  Globe,
  AlertCircle
} from "lucide-react";

// --- ADDED: Utility and Badge Components (copied from MyRequests.jsx) ---
function formatDate(dateStr) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch (e) { return dateStr; }
}

function formatDateTime(dateStr, timeStr) {
  try {
    const d = new Date(dateStr);
    if (timeStr) {
      const [hours, minutes] = timeStr.split(":");
      d.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    }
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
  } catch (e) { return `${formatDate(dateStr)} ${timeStr || ""}`; }
}

function StatusBadge({ status }) {
  const config = {
    Pending: { icon: Clock, color: "text-yellow-600 bg-yellow-50 border-yellow-200", label: "Pending Review" },
    Rejected: { icon: AlertCircle, color: "text-red-600 bg-red-50 border-red-200", label: "Rejected" },
  };
  const { icon: Icon, color, label } = config[status] || config.Pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md border ${color}`}>
      <Icon size={12} /> {label}
    </span>
  );
}

// --- ADDED: Details Modal Component (adapted from MyRequests.jsx) ---
function DetailsModal({ request, onClose }) {
  if (!request) return null;

  // Bazaar Request Modal
  if (request.isBazarBooth) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl m-4 max-h-[90vh] overflow-y-auto transform animate-slide-up">
          <div className="sticky top-0 bg-white/80 backdrop-blur-lg border-b p-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-[#4C3BCF]">{request.bazarId?.bazaarname || "Bazaar Request"}</h2>
              <p className="text-lg font-semibold text-[#736CED] mt-1">From: {request.vendorId?.companyname || "N/A"}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"><X size={24} /></button>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3"><Info size={16} className="mt-1 text-[#736CED]" /><div><span className="font-semibold">Booth Size:</span> {request.boothSize}</div></div>
            <div className="flex items-start gap-3"><Calendar size={16} className="mt-1 text-[#736CED]" />
              <div>
                <span className="font-semibold">Event Dates:</span> {
                  formatDate(request.bazarId?.startdate)
                }{request.bazarId?.enddate ? ` – ${formatDate(request.bazarId.enddate)}` : ""}
              </div>
            </div>
            <div className="flex items-start gap-3"><Users size={16} className="mt-1 text-[#736CED]" />
              <div>
                <span className="font-semibold">Team Members:</span>
                <ul className="mt-2 space-y-1">{request.people.map((p, i) => <li key={i} className="text-sm bg-gray-50 p-2 rounded">{p.name} - {p.email}</li>)}</ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Platform Request Modal
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl m-4 max-h-[90vh] overflow-y-auto transform animate-slide-up">
        <div className="sticky top-0 bg-white/80 backdrop-blur-lg border-b p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-[#4C3BCF]">Platform Request</h2>
            <p className="text-lg font-semibold text-[#736CED] mt-1">From: {request.vendorId?.companyname || "N/A"}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"><X size={24} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3"><Info size={16} className="mt-1 text-[#736CED]" /><div><span className="font-semibold">Booth Size:</span> {request.boothSize}</div></div>
          <div className="flex items-start gap-3"><MapPin size={16} className="mt-1 text-[#736CED]" /><div><span className="font-semibold">Requested Location:</span> {request.location}</div></div>
          <div className="flex items-start gap-3"><Clock size={16} className="mt-1 text-[#736CED]" /><div><span className="font-semibold">Duration:</span> {request.duration} weeks</div></div>
          <div className="flex items-start gap-3"><Users size={16} className="mt-1 text-[#736CED]" />
            <div>
              <span className="font-semibold">Team Members:</span>
              <ul className="mt-2 space-y-1">{request.people.map((p, i) => <li key={i} className="text-sm bg-gray-50 p-2 rounded">{p.name} - {p.email}</li>)}</ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


export default function VendorRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/vendorRequests/");
      const filtered = res.data.filter((req) => req.status === "Pending");
      setRequests(filtered || []);
    } catch (err) {
      setError("Failed to load vendor requests");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    const confirmMsg = `Are you sure you want to ${action} this request?`;
    if (!window.confirm(confirmMsg)) return;
    try {
      if (action === "accept")
        await api.post(`/vendorRequests/${id}/${action}`);
      else await api.delete(`/vendorRequests/${id}`);
      setMessage(`Request ${action}ed successfully`);
      setRequests((prev) => prev.filter((r) => r._id !== id));
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      setError(`Failed to ${action} request`);
      setTimeout(() => setError(null), 2000);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="min-h-screen w-full overflow-hidden bg-[#D5CFE1] text-[#1F1B3B]">
      <div className="relative flex min-h-screen w-full flex-col items-center px-6 py-8">
        <div className="w-full max-w-6xl">
          {/* Header */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold text-[#736CED] sm:text-5xl mb-4">
              Vendor Participation Requests
            </h1>
            <p className="text-lg text-[#312A68] max-w-2xl mx-auto">
              Review all pending vendor participation requests below.
            </p>
          </div>

          {message && (
            <div className="mb-4 text-center bg-green-100 text-green-800 py-2 rounded">
              {message}
            </div>
          )}
          {error && (
            <div className="mb-4 text-center bg-red-100 text-red-800 py-2 rounded">
              {error}
            </div>
          )}

          {/* Loading / Empty / Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#736CED]"></div>
              <p className="mt-4 text-[#312A68]">Loading requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 text-[#312A68]">
              No vendor requests available.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {requests.map((req) => (
                <div
                  key={req._id}
                  className="bg-white rounded-2xl p-6 shadow-lg flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-xl font-bold text-[#4C3BCF] mb-2">
                      {req.vendorId.companyname || "Vendor"}
                    </h3>
                    <p className="text-sm text-[#312A68] mb-1 flex flex-row items-center whitespace-nowrap">
                      Email: {req.vendorId.email || "N/A"}
                    </p>
                    <p className="text-sm text-[#312A68] mb-4">
                      Request Type:{" "}
                      {req.isBazarBooth ? "Bazaar Booth" : "Platform Booth"}
                    </p>
                  </div>

                  <div className="text-left mb-4">
                    <button
                      onClick={() => setSelectedRequest(req)}
                      className="text-sm font-semibold text-[#736CED] hover:text-[#4C3BCF] transition-colors"
                    >
                      View Details
                    </button>
                    <div className="mt-4 border-t pt-4">
                    </div>

                    <div className="flex justify-between gap-3">
                      <button
                        onClick={() => handleAction(req._id, "accept")}
                        className="flex-1 bg-[#6DD3CE] text-white font-medium px-4 py-2 rounded-full hover:bg-[#54C6EB] transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleAction(req._id, "reject")}
                        className="flex-1 bg-[#C14953] text-white font-medium px-4 py-2 rounded-full hover:bg-red-600 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <footer className="relative z-10 w-full px-6 py-6 text-center text-sm text-[#312A68]/80">
        {new Date().getFullYear()} Zarf Token. All rights reserved.
      </footer>

      <div className="pointer-events-none absolute bottom-[-12%] left-1/2 h-64 w-[130%] -translate-x-1/2 rounded-[50%] bg-gradient-to-r from-[#736CED] via-[#A594F9] to-[#6DD3CE] opacity-70 -z-10" />


      {/* --- ADDED: Conditional rendering of the modal --- */}
      {selectedRequest && (
        <DetailsModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>

  );
}