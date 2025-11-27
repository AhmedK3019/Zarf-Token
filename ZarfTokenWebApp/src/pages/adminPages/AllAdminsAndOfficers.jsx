import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuthUser } from "../../hooks/auth";

export default function AllAdminsAndOfficers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuthUser();
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setError(null);
    try {
      const res = await api.get("/allUsers/allAdminsAndOfficers");
      // API returns an array
      // remove current user from list
      const payload =
        res.data || res.data?.result || res.data?.users || res.data;
      const filtered = Array.isArray(payload) ? payload : [];
      setUsers(filtered);
    } catch (err) {
      console.error(err);
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Polling configuration: set to false to disable polling
  const ENABLE_POLLING = true;
  const POLL_MS = 10000; // 10 seconds

  // Retry loading once user is available (hydrate may be async)
  useEffect(() => {
    let mounted = true;
    fetchUsers();

    if (ENABLE_POLLING) {
      const id = setInterval(() => {
        if (mounted) fetchUsers();
      }, POLL_MS);
      return () => {
        mounted = false;
        clearInterval(id);
      };
    }

    return () => {
      mounted = false;
    };
  }, [user]);

  const handleDelete = async (id, role) => {
    const ok = window.confirm("Are you sure you want to delete this user?");
    if (!ok) return;
    try {
      // choose endpoint based on role
      if (role && role.toLowerCase().includes("admin")) {
        await api.delete(`/admin/deleteAdmin/${id}`);
      } else {
        // assume events office otherwise
        await api.delete(`/eventsOffice/deleteEventsOffice/${id}`);
      }
      // remove from UI
      setUsers((prev) => prev.filter((u) => u._id !== id && u.id !== id));
      if (id === user?._id) {
        localStorage.removeItem("token");
        window.alert(
          "You have deleted your own account. You will be logged out."
        );
        window.location.href = "/";
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete user. See console for details.");
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center">
      <main className="relative z-10 flex w-full flex-1 flex-col items-center px-6 py-8">
        <div className="w-full max-w-6xl">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#736CED]"></div>
              <p className="mt-4 text-[#312A68]">Loading users...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">{error}</div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#312A68] text-lg">
                No admins or events office users found.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {users.map((u) => {
                const id = u._id || u.id;
                return (
                  <div
                    key={id}
                    className="bg-white rounded-2xl p-6 shadow-[0_10px_25px_rgba(165,148,249,0.12)] border border-white/50 hover:shadow-[0_15px_35px_rgba(165,148,249,0.18)] transition-all hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-[#EEE9FF] px-3 py-1 text-xs font-medium text-[#5A4BBA] mb-2">
                          <span className="h-2 w-2 rounded-full bg-[#6DD3CE]" />
                          <span className="capitalize">{u.role || "user"}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-[#4C3BCF]">
                          {u.firstname} {u.lastname}{" "}
                          {id === user?._id ? "(You)" : ""}
                        </h3>
                        <p className="text-sm text-[#312A68]">{u.email}</p>
                      </div>
                      <div className="text-sm text-right">
                        <p
                          className={`px-3 py-1 rounded-full text-xs ${
                            u.status === "Active"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {u.status || "N/A"}
                        </p>
                      </div>
                    </div>
                    {id !== user?._id && (
                      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                        <button
                          onClick={() => handleDelete(id, u.role)}
                          className="rounded-full bg-rose-50 px-4 py-2 text-rose-700 text-sm font-medium hover:bg-rose-100 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
