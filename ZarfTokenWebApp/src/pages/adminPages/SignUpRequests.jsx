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
    <div className="min-h-screen w-full bg-muted text-[#1F1B3B]">
      <div className="flex min-h-screen w-full flex-col items-center px-6 py-8">
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
            <div className="bg-white rounded-2xl shadow-[0_10px_25px_rgba(165,148,249,0.2)] border border-white/50 overflow-hidden mb-12">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#001889] text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        First Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Last Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        GUC ID
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Role
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
                        className="hover:bg-[#F8F7FF] transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-[#312A68]">
                          {req.firstname}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#312A68]">
                          {req.lastname}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#312A68]">
                          {req.email}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#312A68]">
                          {req.gucid || "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={selectedRoles[req._id] || ""}
                            onChange={(e) =>
                              handleRoleChange(req._id, e.target.value)
                            }
                            className="w-full max-w-[180px] rounded-lg border border-[#A594F9] bg-white px-3 py-2 text-sm text-[#312A68] focus:outline-none focus:ring-2 focus:ring-[#736CED] transition"
                          >
                            <option value="" disabled>
                              Select Role
                            </option>
                            <option value="Staff">Staff</option>
                            <option value="TA">Teaching Assistant</option>
                            <option value="Professor">Professor</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-3">
                            <button
                              onClick={() => handleAccept(req._id)}
                              className="w-10 h-10 rounded-full flex items-center justify-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 border-2 border-green-500 bg-green-50 text-green-600 hover:bg-green-500 hover:text-white focus-visible:ring-green-200"
                              title="Accept"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2.5}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleReject(req._id)}
                              className="w-10 h-10 rounded-full flex items-center justify-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 border-2 border-red-500 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white focus-visible:ring-red-200"
                              title="Reject"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2.5}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
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
    </div>
  );
}
