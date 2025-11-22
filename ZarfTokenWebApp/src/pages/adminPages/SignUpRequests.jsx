import { useState, useEffect } from "react";
import api from "../../services/api";

export default function SignUpRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState({});

  const fetchRequests = async () => {
    setError(null);
    try {
      const res = await api.get("/registerRequests/getAllRegisterRequests");
      setRequests(res.data.requests || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load registration requests");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (id, role) => {
    setSelectedRoles((prev) => ({ ...prev, [id]: role }));
  };

  const handleAccept = async (id) => {
    const chosenRole = selectedRoles[id];
    if (!chosenRole) {
      alert("Please select a role before accepting.");
      return;
    }

    if (!window.confirm(`Accept this request as ${chosenRole}?`)) return;

    try {
      await api.post(`/registerRequests/setRole/${id}`, { role: chosenRole });

      setRequests((prev) => prev.filter((r) => r._id !== id));
      setMessage(`Request approved as ${chosenRole}`);
      setTimeout(() => setMessage(null), 2500);
    } catch (err) {
      console.error(err);
      setError("Failed to accept request");
      setTimeout(() => setError(null), 2500);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject this request?"))
      return;
    try {
      await api.delete(`/registerRequests/deleteRegisterRequest/${id}`);
      setRequests((prev) => prev.filter((r) => r._id !== id));
      setMessage("Request rejected successfully");
      setTimeout(() => setMessage(null), 2500);
    } catch (err) {
      console.error(err);
      setError("Failed to reject request");
      setTimeout(() => setError(null), 2500);
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

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#736CED]"></div>
              <p className="mt-4 text-[#312A68]">Loading requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 text-[#312A68]">
              No sign-up requests available.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {requests.map((req) => (
                <div
                  key={req._id}
                  className="bg-white rounded-2xl p-6 shadow-[0_10px_25px_rgba(165,148,249,0.2)] border border-white/50 hover:shadow-[0_15px_35px_rgba(165,148,249,0.3)] transition-all hover:-translate-y-1"
                >
                  <h3 className="text-xl font-bold text-[#4C3BCF] mb-2">
                    {req.firstname} {req.lastname}
                  </h3>
                  <p className="text-sm text-[#312A68] mb-1">
                    Email: {req.email}
                  </p>
                  <p className="text-sm text-[#312A68] mb-4">
                    GUC ID: {req.gucid || "N/A"}
                  </p>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-[#312A68] mb-1">
                      Assign Role
                    </label>
                    <select
                      value={selectedRoles[req._id] || ""}
                      onChange={(e) =>
                        handleRoleChange(req._id, e.target.value)
                      }
                      className="w-full rounded-full border border-[#A594F9] bg-white px-4 py-2 text-[#312A68] focus:outline-none focus:ring-2 focus:ring-[#736CED] transition"
                    >
                      <option value="" disabled>
                        Select Role
                      </option>
                      <option value="Staff">Staff</option>
                      <option value="TA">Teaching Assistant</option>
                      <option value="Professor">Professor</option>
                    </select>
                  </div>

                  <div className="flex justify-between gap-3">
                    <button
                      onClick={() => handleAccept(req._id)}
                      className="flex-1 rounded-lg px-4 py-2 text-sm font-semibold text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 focus-visible:ring-green-200"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleReject(req._id)}
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

      <footer className="relative z-10 w-full px-6 py-6 text-center text-sm text-[#312A68]/80">
        {new Date().getFullYear()} Zarf Token. All rights reserved.
      </footer>

      <div className="pointer-events-none absolute bottom-[-12%] left-1/2 h-64 w-[130%] -translate-x-1/2 rounded-[50%] bg-gradient-to-r from-[#736CED] via-[#A594F9] to-[#6DD3CE] opacity-70 -z-10" />
    </div>
  );
}
