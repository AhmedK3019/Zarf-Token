import { useState, useEffect } from "react";
import api from "../../services/api";

export default function VendorRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/vendorRequests/");
      setRequests(res.data || []);
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
                  className="bg-white rounded-2xl p-6 shadow-[0_10px_25px_rgba(165,148,249,0.2)] border border-white/50 hover:shadow-[0_15px_35px_rgba(165,148,249,0.3)] transition-all hover:-translate-y-1"
                >
                  <h3 className="text-xl font-bold text-[#4C3BCF] mb-2">
                    {req.vendorId.companyname || "Vendor"}
                  </h3>
                  <p className="text-sm text-[#312A68] mb-1">
                    Email: {req.vendorId.email || "N/A"}
                  </p>
                  <p className="text-sm text-[#312A68] mb-4">
                    Request Type:{" "}
                    {req.isBazarBooth ? "Bazaar Booth" : "Platform Booth"}
                  </p>

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
              ))}
            </div>
          )}
        </div>
      </div>

      <footer className="relative z-10 w-full px-6 py-6 text-center text-sm text-[#312A68]/80">
        {new Date().getFullYear()} Zarf Token. All rights reserved.
      </footer>

      <div className="pointer-events-none absolute bottom-[-12%] left-1/2 h-64 w-[130%] -translate-x-1/2 rounded-[50%] bg-gradient-to-r from-[#736CED] via-[#A594F9] to-[#6DD3CE] opacity-70 -z-10" />
    </div>
  );
}
