import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuthUser } from "../../hooks/auth";

export default function AllUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "active", "blocked"
  // useAuthUser returns { user, login, logout }
  // previously destructured as `u` which is undefined here -> auth becomes null
  const { user: authUser } = useAuthUser();

  const fetchUsers = async () => {
    setError(null);
    try {
      const res = await api.get("/allUsers/allUsers");
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/allUsers/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      if (id === authUser?._id) {
        localStorage.removeItem("token");
        window.alert(
          "You have deleted your own account. You will be logged out."
        );
        window.location.href = "/";
      }
      setMessage("User deleted successfully");
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to delete user");
      setTimeout(() => setError(null), 2000);
    }
  };

  const handleBlock = async (id) => {
    if (!window.confirm("Are you sure you want to block this user?")) return;
    try {
      const res = await api.put(`/admin/blockUser/${id}`);
      setMessage(res.data.message || "User blocked successfully");
      setTimeout(() => setMessage(null), 2000);
      // Refresh users list
      fetchUsers();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to block user");
      setTimeout(() => setError(null), 2000);
    }
  };

  const handleUnblock = async (id) => {
    if (!window.confirm("Are you sure you want to unblock this user?")) return;
    try {
      const res = await api.put(`/admin/unblockUser/${id}`);
      setMessage(res.data.message || "User unblocked successfully");
      setTimeout(() => setMessage(null), 2000);
      // Refresh users list
      fetchUsers();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to unblock user");
      setTimeout(() => setError(null), 2000);
    }
  };

  // Polling configuration: set to false to disable polling
  const ENABLE_POLLING = true;
  const POLL_MS = 10000; // 10 seconds

  useEffect(() => {
    let mounted = true;
    // initial load
    fetchUsers();

    // set up polling when enabled
    if (ENABLE_POLLING) {
      const id = setInterval(() => {
        if (mounted) fetchUsers();
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
  }, [authUser]);

  const filteredUsers = users.filter((u) => {
    const term = search.toLowerCase();
    const matchesSearch =
      (u.firstName && u.firstName.toLowerCase().includes(term)) ||
      (u.lastName && u.lastName.toLowerCase().includes(term)) ||
      (u.companyname && u.companyname.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.role && u.role.toLowerCase().includes(term));
    
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && u.status?.toLowerCase() === "active") ||
      (statusFilter === "blocked" && u.status?.toLowerCase() === "blocked");
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen w-full overflow-x-hidden overflow-y-auto bg-muted text-[#1F1B3B]">
      <div className="relative flex min-h-screen w-full flex-col items-center px-6 py-8">
        <div className="w-full max-w-6xl">

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

          <div className="mb-6 flex flex-col md:flex-row gap-4 justify-center items-center">
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-md border border-white/50 bg-white/70 text-[#1F1B3B] placeholder-[#312A68] rounded-full px-5 py-2 focus:outline-none focus:ring-2 focus:ring-[#736CED] shadow-sm"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-white/50 bg-white/70 text-[#1F1B3B] rounded-full px-5 py-2 focus:outline-none focus:ring-2 focus:ring-[#736CED] shadow-sm"
            >
              <option value="all">All Users</option>
              <option value="active">Active Only</option>
              <option value="blocked">Blocked Only</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#736CED]" />
              <p className="mt-4 text-[#312A68]">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-[#312A68]">
              No users found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {filteredUsers.map((user) => (
                <div
                  key={user._id}
                  className="bg-white rounded-2xl p-6 shadow-[0_10px_25px_rgba(165,148,249,0.2)] border border-white/50 hover:shadow-[0_15px_35px_rgba(165,148,249,0.3)] transition-all hover:-translate-y-1"
                >
                  <h3 className="text-xl font-bold text-[#4C3BCF] mb-2">
                    {user.firstName ||
                      user.firstname ||
                      user.companyname ||
                      "Unknown"}{" "}
                    {user.lastName || user.lastname || ""}{" "}
                    {authUser?._id === user?._id ? "(You)" : ""}
                  </h3>

                  <p className="text-sm text-[#312A68] mb-1">
                    Email: {user.email || "N/A"}
                  </p>

                  <p className="text-sm text-[#312A68] mb-1">
                    GUC ID: {user.gucid || "N/A"}
                  </p>

                  <p className="text-sm text-[#312A68] mb-1 capitalize">
                    Role: {user.companyname ? "Vendor" : user.role || "User"}
                  </p>

                  <p
                    className={`text-sm mb-4 font-semibold ${
                      user.status?.toLowerCase() === "active"
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    Status: {user.status || "Unknown"}
                  </p>

                  <div className="flex justify-end gap-2 flex-wrap">
                    {/* Only show block/unblock for non-admin users */}
                    {user.role?.toLowerCase() !== "admin" &&
                      user.role !== "Admin" && (
                        <>
                          {user.status?.toLowerCase() === "active" ? (
                            <button
                              onClick={() => handleBlock(user._id)}
                              className="bg-orange-500 text-white font-medium px-4 py-2 rounded-full hover:bg-orange-600 transition-colors"
                            >
                              Block
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUnblock(user._id)}
                              className="bg-green-500 text-white font-medium px-4 py-2 rounded-full hover:bg-green-600 transition-colors"
                            >
                              Unblock
                            </button>
                          )}
                        </>
                      )}
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="bg-[#C14953] text-white font-medium px-4 py-2 rounded-full hover:bg-red-600 transition-colors"
                    >
                      Delete
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

      <div className="pointer-events-none absolute bottom-[-10%] left-1/2 h-56 w-[100%] -translate-x-1/2 rounded-[50%] bg-gradient-to-r from-[#736CED] via-[#A594F9] to-[#6DD3CE] opacity-60 -z-10" />
    </div>
  );
}
