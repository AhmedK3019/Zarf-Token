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

  // --- Details Modal State ---
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsRequest, setDetailsRequest] = useState(null);

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

  // --- Open Details Modal ---
  const openDetailsModal = (request) => {
    setDetailsRequest(request);
    setShowDetailsModal(true);
  };

  // --- Toggle Team Members Expansion ---
  const toggleTeamExpansion = (requestId) => {
    setExpandedTeams((prev) => {
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
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#001889] text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Company Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Location
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Dates & Duration
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Size
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {requests.map((req) => (
                      <tr
                        key={req._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-semibold text-[#4C3BCF]">
                              {req.vendorId?.companyname || "Vendor"}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {req.vendorId?.email || "No Email"}
                            </div>
                            <span
                              className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-semibold ${
                                req.isBazarBooth
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {req.isBazarBooth
                                ? "Bazaar Booth"
                                : "Platform Booth"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {req.isBazarBooth ? (
                            <div>
                              <div className="font-medium">
                                {req.bazarId?.bazaarname || "N/A"}
                              </div>
                              <div className="text-xs text-gray-500">
                                Event Location
                              </div>
                            </div>
                          ) : (
                            req.location || "N/A"
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {req.isBazarBooth ? (
                            <div>
                              <div>{formatDate(req.bazarId?.startdate)}</div>
                              {req.bazarId?.enddate && (
                                <div className="text-xs text-gray-500">
                                  to {formatDate(req.bazarId.enddate)}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div>
                              <div>{formatDate(req.startdate)}</div>
                              <div className="text-xs text-gray-500">
                                to {formatDate(req.enddate)}
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {req.boothSize}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openDetailsModal(req)}
                              className="rounded-full border border-blue-200 bg-white/90 p-2 text-blue-600 shadow-sm transition hover:bg-blue-50 focus-visible:outline-none"
                              title="View Details"
                              aria-label="View Details"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => handleAction(req._id, "accept")}
                              className="rounded-full border border-green-200 bg-white/90 p-2 text-green-600 shadow-sm transition hover:bg-green-50 focus-visible:outline-none"
                              title="Accept"
                              aria-label="Accept"
                            >
                              <CheckSquare size={18} />
                            </button>
                            <button
                              onClick={() => handleAction(req._id, "reject")}
                              className="rounded-full border border-red-200 bg-white/90 p-2 text-red-600 shadow-sm transition hover:bg-red-50 focus-visible:outline-none"
                              title="Reject"
                              aria-label="Reject"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- DETAILS MODAL --- */}
      {showDetailsModal && detailsRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 bg-[#1F1B3B] text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">Request Details</h3>
                <p className="text-xs text-gray-300">
                  {detailsRequest.vendorId?.companyname}
                </p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-white/80 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-6">
                {/* Company Info */}
                <div className="border-b pb-4">
                  <h4 className="text-sm font-semibold text-[#736CED] uppercase mb-3">
                    Company Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Company Name:</span>
                      <p className="font-medium">
                        {detailsRequest.vendorId?.companyname}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Email:</span>
                      <p className="font-medium">
                        {detailsRequest.vendorId?.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Booth Info */}
                <div className="border-b pb-4">
                  <h4 className="text-sm font-semibold text-[#736CED] uppercase mb-3">
                    Booth Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Type:</span>
                      <p className="font-medium">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                            detailsRequest.isBazarBooth
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {detailsRequest.isBazarBooth
                            ? "Bazaar Booth"
                            : "Platform Booth"}
                        </span>
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Size:</span>
                      <p className="font-medium">{detailsRequest.boothSize}</p>
                    </div>
                    {detailsRequest.isBazarBooth ? (
                      <>
                        <div>
                          <span className="text-gray-500">Event:</span>
                          <p className="font-medium">
                            {detailsRequest.bazarId?.bazaarname}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Event Dates:</span>
                          <p className="font-medium">
                            {formatDate(detailsRequest.bazarId?.startdate)}
                            {detailsRequest.bazarId?.enddate && (
                              <>
                                {" "}
                                to {formatDate(detailsRequest.bazarId.enddate)}
                              </>
                            )}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <span className="text-gray-500">Location:</span>
                          <p className="font-medium">
                            {detailsRequest.location}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Duration:</span>
                          <p className="font-medium">
                            {detailsRequest.duration} weeks
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Team Members */}
                <div>
                  <h4 className="text-sm font-semibold text-[#736CED] uppercase mb-3">
                    Team Members ({detailsRequest.people.length})
                  </h4>
                  <div className="space-y-3">
                    {detailsRequest.people.map((person, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#736CED]/10 rounded-full flex items-center justify-center">
                            <User size={20} className="text-[#736CED]" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{person.name}</p>
                            <p className="text-xs text-gray-500">
                              Team Member {idx + 1}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {person.DocumentId ? (
                            <>
                              <button
                                onClick={() =>
                                  handleViewDocument(person.DocumentId)
                                }
                                className="rounded-full border border-green-200 bg-white p-2 text-green-600 shadow-sm transition hover:bg-green-50"
                                title="View ID"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() =>
                                  handleDownloadDocument(
                                    person.DocumentId,
                                    person.name
                                  )
                                }
                                className="rounded-full border border-blue-200 bg-white p-2 text-blue-600 shadow-sm transition hover:bg-blue-50"
                                title="Download ID"
                              >
                                <Download size={16} />
                              </button>
                            </>
                          ) : (
                            <div className="flex items-center gap-1 text-red-500 text-xs">
                              <AlertCircle size={16} />
                              <span>No ID</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
