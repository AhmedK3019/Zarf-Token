import React, { useState, useEffect } from "react";
import api from "../../services/api";
import {
  Clock,
  MapPin,
  Calendar,
  Users,
  Info,
  Square,
  Download,
  AlertCircle,
  User,
  Eye,
  X,
  CheckSquare,
  Square as UncheckedSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// --- Utility: Date Formatter ---
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

// --- Constants ---
const ROLE_OPTIONS = ["Student", "Staff", "TA", "Professor"];

export default function VendorRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // --- Modal State (Only for Platform Booths) ---
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);

  // --- Expandable Team Members State ---
  const [expandedTeams, setExpandedTeams] = useState(new Set());

  // --- Fetch Data ---
  const fetchRequests = async () => {
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

  // --- Handle Actions ---
  const handleAction = async (id, action) => {
    const requestToProcess = requests.find((r) => r._id === id);
    if (!requestToProcess) return;

    // REJECT FLOW
    if (action === "reject") {
      const confirmMsg = `Are you sure you want to REJECT this request?`;
      if (!window.confirm(confirmMsg)) return;
      processRequest(id, "reject");
      return;
    }

    // ACCEPT FLOW
    if (action === "accept") {
      if (requestToProcess.isBazarBooth) {
        // CASE 1: BAZAAR BOOTH
        // Allowed users are already defined in the Bazaar settings.
        // No need for modal. Just confirm and accept.
        if (
          window.confirm(
            `Accept Bazaar Booth request for ${requestToProcess.vendorId?.companyname}?`
          )
        ) {
          processRequest(id, "accept", []); // No specific roles needed in body
        }
      } else {
        // CASE 2: PLATFORM BOOTH (Not a Bazaar)
        // Must define allowed users via Modal.
        setSelectedRequest(requestToProcess);
        setSelectedRoles([]); // Reset selection
        setShowAcceptModal(true);
      }
    }
  };

  // --- Toggle Team Members Expansion ---
  const toggleTeamExpansion = (requestId) => {
    setExpandedTeams(prev => {
      const newSet = new Set(prev);
      if (newSet.has(requestId)) {
        newSet.delete(requestId);
      } else {
        newSet.add(requestId);
      }
      return newSet;
    });
  };

  // --- Modal Checkbox Toggle ---
  const toggleRole = (role) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter((r) => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  // --- Submit Acceptance from Modal ---
  const handleConfirmModalAccept = () => {
    if (selectedRoles.length === 0) {
      alert("Please select at least one audience group.");
      return;
    }
    // Process request with the selected roles
    processRequest(selectedRequest._id, "accept", selectedRoles);

    // Cleanup
    setShowAcceptModal(false);
    setSelectedRequest(null);
  };

  // --- API Logic ---
  const processRequest = async (id, action, roles = []) => {
    try {
      if (action === "accept") {
        // Send roles in body (only used by backend if it's a platform booth, typically)
        await api.post(`/vendorRequests/${id}/${action}`, {
          allowedusers: roles,
        });
      } else {
        await api.delete(`/vendorRequests/${id}`);
      }

      setMessage(`Request ${action}ed successfully`);
      setRequests((prev) => prev.filter((r) => r._id !== id));
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      console.error(err);
      setError(`Failed to ${action} request`);
      setTimeout(() => setError(null), 2000);
    }
  };

  // --- File Handlers ---
  const handleDownloadDocument = async (documentId, personName) => {
    try {
      const fileInfoResponse = await api.get(`/uploads`);
      const fileInfo = fileInfoResponse.data.find((f) => f._id === documentId);
      const response = await api.get(`/uploads/${documentId}`, {
        responseType: "blob",
      });
      if (!response.data || response.data.size === 0)
        throw new Error("No file data");

      let filename = `${personName}_ID`;
      if (fileInfo?.fileName) {
        const ext = fileInfo.fileName.split(".").pop();
        filename += `.${ext}`;
      }
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download document");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleViewDocument = async (documentId) => {
    try {
      const fileInfoResponse = await api.get(`/uploads`);
      const fileInfo = fileInfoResponse.data.find((f) => f._id === documentId);
      if (!fileInfo?.fileId) throw new Error("File info not found");
      const baseUrl =
        import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      window.open(`${baseUrl}/uploads/fileId/${fileInfo.fileId}`, "_blank");
    } catch (err) {
      setError("Failed to view document");
      setTimeout(() => setError(null), 3000);
    }
  };

  // --- Polling Effect ---
  useEffect(() => {
    let mounted = true;
    fetchRequests();
    const id = setInterval(() => {
      if (mounted) fetchRequests();
    }, 10000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="min-h-screen w-full overflow-hidden bg-muted text-[#1F1B3B]">
      <div className="relative flex min-h-screen w-full flex-col items-center px-6 py-8">
        <div className="w-full">
          {/* Messages */}
          {message && (
            <div className="mb-4 text-center bg-green-100 text-green-800 py-2 rounded animate-pulse">
              {message}
            </div>
          )}
          {error && (
            <div className="mb-4 text-center bg-red-100 text-red-800 py-2 rounded">
              {error}
            </div>
          )}

          {/* Loading / Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#736CED]"></div>
              <p className="mt-4 text-[#312A68]">Loading requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 text-[#312A68]">
              No pending requests found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {requests.map((req) => (
                <div
                  key={req._id}
                  className="bg-white rounded-2xl p-6 shadow-lg flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-xl font-bold text-[#4C3BCF] mb-1">
                      {req.vendorId?.companyname || "Vendor"}
                    </h3>
                    <p className="text-xs font-semibold text-[#736CED] mb-4">
                      {req.vendorId?.email || "No Email"}
                    </p>

                    <div className="border-t border-gray-100 pt-4 space-y-3 text-sm">
                      {/* Type Indicator */}
                      <div className="flex items-start gap-2">
                        <Info size={14} className="text-[#736CED] mt-0.5" />
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            req.isBazarBooth
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {req.isBazarBooth ? "Bazaar Booth" : "Platform Booth"}
                        </span>
                      </div>

                      {/* Details based on Type */}
                      {req.isBazarBooth ? (
                        <>
                          <div className="flex items-start gap-2">
                            <Calendar
                              size={14}
                              className="text-[#736CED] mt-0.5"
                            />
                            <span>
                              <strong>Event:</strong> {req.bazarId?.bazaarname}
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Calendar
                              size={14}
                              className="text-[#736CED] mt-0.5"
                            />
                            <span>
                              <strong>Dates:</strong>{" "}
                              {formatDate(req.bazarId?.startdate)}
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-start gap-2">
                            <MapPin
                              size={14}
                              className="text-[#736CED] mt-0.5"
                            />
                            <span>
                              <strong>Location:</strong> {req.location}
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Clock
                              size={14}
                              className="text-[#736CED] mt-0.5"
                            />
                            <span>
                              <strong>Duration:</strong> {req.duration} weeks
                            </span>
                          </div>
                        </>
                      )}

                      <div className="flex items-start gap-2">
                        <Square size={14} className="text-[#736CED] mt-0.5" />
                        <span>
                          <strong>Size:</strong> {req.boothSize}
                        </span>
                      </div>

                      {/* Team */}
                      <div className="flex items-start gap-2">
                        <Users size={14} className="text-[#736CED] mt-0.5" />
                        <div className="w-full">
                          <strong>Team Members:</strong> {req.people.length}
                          <ul className="mt-2 space-y-2">
                            {/* Always show first member */}
                            {req.people.length > 0 && (
                              <li className="flex items-center gap-2 p-2 rounded bg-gray-50">
                                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                                  <User size={12} className="text-gray-500" />
                                </div>
                                <div className="flex-1 min-w-0 overflow-hidden">
                                  <div className="text-xs font-medium truncate">
                                    {req.people[0].name}
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  {req.people[0].DocumentId ? (
                                    <>
                                      <button
                                        onClick={() =>
                                          handleViewDocument(req.people[0].DocumentId)
                                        }
                                        className="text-gray-400 hover:text-green-600"
                                      >
                                        <Eye size={14} />
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDownloadDocument(
                                            req.people[0].DocumentId,
                                            req.people[0].name
                                          )
                                        }
                                        className="text-gray-400 hover:text-blue-600"
                                      >
                                        <Download size={14} />
                                      </button>
                                    </>
                                  ) : (
                                    <AlertCircle
                                      size={14}
                                      className="text-red-300"
                                    />
                                  )}
                                </div>
                              </li>
                            )}
                            
                            {/* Show remaining members if expanded */}
                            {expandedTeams.has(req._id) && req.people.slice(1).map((p, i) => (
                              <li
                                key={i + 1}
                                className="flex items-center gap-2 p-2 rounded bg-gray-50"
                              >
                                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                                  <User size={12} className="text-gray-500" />
                                </div>
                                <div className="flex-1 min-w-0 overflow-hidden">
                                  <div className="text-xs font-medium truncate">
                                    {p.name}
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  {p.DocumentId ? (
                                    <>
                                      <button
                                        onClick={() =>
                                          handleViewDocument(p.DocumentId)
                                        }
                                        className="text-gray-400 hover:text-green-600"
                                      >
                                        <Eye size={14} />
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDownloadDocument(
                                            p.DocumentId,
                                            p.name
                                          )
                                        }
                                        className="text-gray-400 hover:text-blue-600"
                                      >
                                        <Download size={14} />
                                      </button>
                                    </>
                                  ) : (
                                    <AlertCircle
                                      size={14}
                                      className="text-red-300"
                                    />
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                          
                          {/* Show more/less button if there are more than 1 member */}
                          {req.people.length > 1 && (
                            <button
                              onClick={() => toggleTeamExpansion(req._id)}
                              className="mt-2 text-xs text-[#736CED] hover:text-[#4C3BCF] font-medium flex items-center gap-1 transition-colors"
                            >
                              {expandedTeams.has(req._id) ? (
                                <>
                                  <ChevronUp size={12} />
                                  Show less
                                </>
                              ) : (
                                <>
                                  <ChevronDown size={12} />
                                  Show {req.people.length - 1} more member{req.people.length - 1 !== 1 ? 's' : ''}
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 border-t pt-4 flex gap-3">
                    <button
                      onClick={() => handleAction(req._id, "accept")}
                      className="flex-1 rounded-lg px-4 py-2 text-sm font-semibold text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 focus-visible:ring-green-200"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleAction(req._id, "reject")}
                      className="flex-1 rounded-lg px-4 py-2 text-sm font-semibold text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 focus-visible:ring-red-200"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL: Only shown for Platform Booths --- */}
      {showAcceptModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 bg-[#1F1B3B] text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">Accept Platform Booth</h3>
                <p className="text-xs text-gray-300">
                  {selectedRequest.vendorId?.companyname}
                </p>
              </div>
              <button
                onClick={() => setShowAcceptModal(false)}
                className="text-white/80 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="mb-5 text-sm text-gray-600">
                <p className="mb-2">
                  Since this is a standalone <strong>Platform Booth</strong> at{" "}
                  <span className="font-semibold text-[#4C3BCF]">
                    {selectedRequest.location}
                  </span>
                  , you must define who is allowed to interact with it.
                </p>
                <p className="text-xs text-[#C14953] font-semibold">
                  * Select at least one audience group.
                </p>
              </div>

              <div className="space-y-2">
                {ROLE_OPTIONS.map((role) => {
                  const isSelected = selectedRoles.includes(role);
                  return (
                    <div
                      key={role}
                      onClick={() => toggleRole(role)}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all select-none ${
                        isSelected
                          ? "border-[#736CED] bg-[#736CED]/10"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className={
                          isSelected ? "text-[#736CED]" : "text-gray-300"
                        }
                      >
                        {isSelected ? (
                          <CheckSquare size={20} />
                        ) : (
                          <UncheckedSquare size={20} />
                        )}
                      </div>
                      <span
                        className={`font-medium ${
                          isSelected ? "text-[#1F1B3B]" : "text-gray-500"
                        }`}
                      >
                        {role}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowAcceptModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmModalAccept}
                disabled={selectedRoles.length === 0}
                className={`px-6 py-2 rounded-full font-medium text-white shadow-sm transition-all text-sm ${
                  selectedRoles.length > 0
                    ? "bg-[#6DD3CE] hover:bg-[#54C6EB]"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                Confirm & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
