import React, { useEffect, useState } from "react";
import api from "../../services/api";

export default function AllUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [search, setSearch] = useState("");

  
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/allUsers/allUsers");
      setUsers(res.data || []);
    } catch (err) {
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
      setMessage("User deleted successfully");
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      setError("Failed to delete user");
      setTimeout(() => setError(null), 2000);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  
  const filteredUsers = users.filter((u) => {
    const term = search.toLowerCase();
    return (
      (u.firstName && u.firstName.toLowerCase().includes(term)) ||
      (u.lastName && u.lastName.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.role && u.role.toLowerCase().includes(term))
    );
  });

  return (
    <div className="min-h-screen w-full overflow-hidden bg-[#D5CFE1] text-[#1F1B3B]">
      <div className="relative flex min-h-screen w-full flex-col items-center px-6 py-8">
        <div className="w-full max-w-6xl">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold text-[#736CED] sm:text-5xl mb-4">
              All Users
            </h1>
            <p className="text-lg text-[#312A68] max-w-2xl mx-auto">
              Manage all registered users below. You can search, view, or delete users.
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

          
          <div className="mb-6 text-center">
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-md border border-white/50 bg-white/70 text-[#1F1B3B] placeholder-[#312A68] rounded-full px-5 py-2 focus:outline-none focus:ring-2 focus:ring-[#736CED] shadow-sm"
            />
          </div>

         
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#736CED]"></div>
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
                    {user.firstName || user.firstname} {user.lastName || user.lastname}
                  </h3>
                  <p className="text-sm text-[#312A68] mb-1">
                    Email: {user.email || "N/A"}
                  </p>
                  <p className="text-sm text-[#312A68] mb-1 capitalize">
                    Role: {user.role || "User"}
                  </p>
                  <p
                    className={`text-sm mb-4 ${
                      user.status?.toLowerCase() === "active"
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    Status: {user.status || "Unknown"}
                  </p>

                  <div className="flex justify-end">
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

      
      <div className="pointer-events-none absolute bottom-[-12%] left-1/2 h-64 w-[130%] -translate-x-1/2 rounded-[50%] bg-gradient-to-r from-[#736CED] via-[#A594F9] to-[#6DD3CE] opacity-70 -z-10" />
    </div>
  );
}
