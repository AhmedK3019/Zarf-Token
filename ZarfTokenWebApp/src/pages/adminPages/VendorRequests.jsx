import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { Clock, MapPin, Calendar, Users, Info, Square, Download, FileText, AlertCircle, User, Eye } from "lucide-react";

// --- ADDED: Utility and Badge Components (copied from MyRequests.jsx) ---
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

export default function VendorRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

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

  const handleDownloadDocument = async (documentId, personName) => {
    try {
      // First, get the file info to get the original filename
      const fileInfoResponse = await api.get(`/uploads`);
      const fileInfo = fileInfoResponse.data.find(file => file._id === documentId);
      
      const response = await api.get(`/uploads/${documentId}`, {
        responseType: 'blob'
      });
      
      // Check if we actually received data
      if (!response.data || response.data.size === 0) {
        throw new Error('No file data received');
      }
      let filename = `${personName}_ID_Document`;
      if (fileInfo && fileInfo.fileName) {
        const ext = fileInfo.fileName.split('.').pop();
        filename = `${personName}_ID_Document.${ext}`;
      }
      
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      setError(`Failed to download document: ${err.response?.data?.error || err.message}`);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleViewDocument = async (documentId) => {
    try {
      // First get the file info to get the fileId
      const fileInfoResponse = await api.get(`/uploads`);
      const fileInfo = fileInfoResponse.data.find(file => file._id === documentId);
      
      if (!fileInfo || !fileInfo.fileId) {
        throw new Error('File information not found');
      }
      
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const url = `${baseUrl}/uploads/fileId/${fileInfo.fileId}`;
      
      // Open in new tab for viewing - this endpoint serves files inline
      window.open(url, '_blank');
    } catch (err) {
      console.error('View error:', err);
      setError('Failed to view document');
      setTimeout(() => setError(null), 3000);
    }
  };

  const ENABLE_POLLING = true;
  const POLL_MS = 10000;

  useEffect(() => {
    let mounted = true;
    fetchRequests();

    if (ENABLE_POLLING) {
      const id = setInterval(() => {
        if (mounted) fetchRequests();
      }, POLL_MS);
      return () => {
        mounted = false;
        clearInterval(id);
      };
    }

    // cleanup function when polling disabled
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen w-full overflow-hidden bg-muted text-[#1F1B3B]">
      <div className="relative flex min-h-screen w-full flex-col items-center px-6 py-8">
        <div className="w-full">

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
                      {" "}
                      Vendor: {req.vendorId?.email || "N/A"}
                    </p>

                    <div className="border-t border-gray-100 pt-4 space-y-3 text-sm">
                      {req.isBazarBooth ? (
                        <>
                          <div className="flex items-start gap-2">
                            <Info size={14} className="text-[#736CED] mt-0.5" />
                            <span>
                              <strong>Type:</strong> Bazaar Booth
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Calendar
                              size={14}
                              className="text-[#736CED] mt-0.5"
                            />
                            <span>
                              <strong>Event:</strong>{" "}
                              {req.bazarId?.bazaarname || "N/A"}
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
                              {req.bazarId?.enddate
                                ? ` – ${formatDate(req.bazarId.enddate)}`
                                : ""}
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Square
                              size={14}
                              className="text-[#736CED] mt-0.5"
                            />
                            <span>
                              <strong>Size:</strong> {req.boothSize}
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Users
                              size={14}
                              className="text-[#736CED] mt-0.5"
                            />
                            <span>
                              <strong>Team Members:</strong> {req.people.length}
                              <ul className="mt-2 space-y-2">
                                {req.people.map((p, i) => (
                                  <li
                                    key={i}
                                    className="flex items-center gap-3 p-2 rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors"
                                  >
                                    {/* Avatar */}
                                    <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                      <User size={14} className="text-gray-500" />
                                    </div>
                                    
                                    {/* Name and Email */}
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm font-medium text-gray-900 truncate">{p.name}</div>
                                      <div className="text-xs text-gray-500 truncate">{p.email}</div>
                                    </div>
                                    
                                    {/* View and Download Icons */}
                                    <div className="flex-shrink-0 flex gap-1">
                                      {p.DocumentId ? (
                                        <>
                                          <button
                                            onClick={() => handleViewDocument(p.DocumentId)}
                                            className="p-1 text-gray-400 hover:text-green-600 transition-colors rounded"
                                            title="View ID Document"
                                          >
                                            <Eye size={14} />
                                          </button>
                                          <button
                                            onClick={() => handleDownloadDocument(p.DocumentId, p.name)}
                                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors rounded"
                                            title="Download ID Document"
                                          >
                                            <Download size={14} />
                                          </button>
                                        </>
                                      ) : (
                                        <div className="p-1 text-red-400" title="No document uploaded">
                                          <AlertCircle size={14} />
                                        </div>
                                      )}
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-start gap-2">
                            <Info size={14} className="text-[#736CED] mt-0.5" />
                            <span>
                              <strong>Type:</strong> Platform Booth
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Square
                              size={14}
                              className="text-[#736CED] mt-0.5"
                            />
                            <span>
                              <strong>Size:</strong> {req.boothSize}
                            </span>
                          </div>
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
                          <div className="flex items-start gap-2">
                            <Users
                              size={14}
                              className="text-[#736CED] mt-0.5"
                            />
                            <span>
                              <strong>Team:</strong> {req.people.length}
                              <ul className="mt-2 space-y-2">
                                {req.people.map((p, i) => (
                                  <li
                                    key={i}
                                    className="flex items-center gap-3 p-2 rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors"
                                  >
                                    {/* Avatar */}
                                    <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                      <User size={14} className="text-gray-500" />
                                    </div>
                                    
                                    {/* Name and Email */}
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm font-medium text-gray-900 truncate">{p.name}</div>
                                      <div className="text-xs text-gray-500 truncate">{p.email}</div>
                                    </div>
                                    
                                    {/* View and Download Icons */}
                                    <div className="flex-shrink-0 flex gap-1">
                                      {p.DocumentId ? (
                                        <>
                                          <button
                                            onClick={() => handleViewDocument(p.DocumentId)}
                                            className="p-1 text-gray-400 hover:text-green-600 transition-colors rounded"
                                            title="View ID Document"
                                          >
                                            <Eye size={14} />
                                          </button>
                                          <button
                                            onClick={() => handleDownloadDocument(p.DocumentId, p.name)}
                                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors rounded"
                                            title="Download ID Document"
                                          >
                                            <Download size={14} />
                                          </button>
                                        </>
                                      ) : (
                                        <div className="p-1 text-red-400" title="No document uploaded">
                                          <AlertCircle size={14} />
                                        </div>
                                      )}
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 border-t pt-4">
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
    </div>
  );
}
