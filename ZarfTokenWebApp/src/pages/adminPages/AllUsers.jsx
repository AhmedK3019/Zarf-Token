import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { useAuthUser } from "../../hooks/auth";

const ENABLE_POLLING = true;
const POLL_MS = 10000; // 10 seconds

// Lightweight role matcher so the dropdown can stay in sync with API payloads
const normalizeRole = (role) => (role || "").toLowerCase().trim();

export default function AllUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    role: "Admin",
  });
  const [creating, setCreating] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const { user: authUser } = useAuthUser();

  const clearToasts = () => {
    setTimeout(() => {
      setMessage(null);
      setError(null);
    }, 2200);
  };

  const fetchUsers = async () => {
    setError(null);
    setFieldErrors({});
    try {
      const res = await api.get("/allUsers/allUsers");
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load users");
      clearToasts();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, role) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    const normalizedRole = normalizeRole(role);
    // Preserve the correct deletion endpoint for privileged roles
    const endpoint =
      normalizedRole === "admin"
        ? `/admin/deleteAdmin/${id}`
        : normalizedRole.includes("event")
        ? `/eventsOffice/deleteEventsOffice/${id}`
        : `/allUsers/${id}`;

    try {
      await api.delete(endpoint);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      if (id === authUser?._id) {
        localStorage.removeItem("token");
        window.alert(
          "You have deleted your own account. You will be logged out."
        );
        window.location.href = "/";
      }
      setMessage("User deleted successfully");
      clearToasts();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to delete user");
      clearToasts();
    }
  };

  const handleBlock = async (id, role) => {
    if (!window.confirm("Are you sure you want to block this user?")) return;
    try {
      const res = await api.patch(`/allUsers/blockUser/${id}/${role}`);
      setMessage(res.data.message || "User blocked successfully");
      clearToasts();
      fetchUsers();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to block user");
      clearToasts();
    }
  };

  const handleUnblock = async (id, role) => {
    try {
      const res = await api.patch(`/allUsers/unBlockUser/${id}/${role}`);
      setMessage(res.data.message || "User unblocked successfully");
      clearToasts();
      fetchUsers();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to unblock user");
      clearToasts();
    }
  };

  const validateCreate = () => {
    if (!createForm.firstname || createForm.firstname.length < 3)
      return "First name must be at least 3 characters";
    if (!createForm.lastname || createForm.lastname.length < 3)
      return "Last name must be at least 3 characters";
    if (!createForm.email) return "Email is required";
    if (!createForm.password || createForm.password.length < 6)
      return "Password must be at least 6 characters";
    return null;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const validation = validateCreate();
    setError(null);
    setMessage(null);
    setFieldErrors({});
    if (validation) {
      setError(validation);
      const nextErrors = {};
      if (!createForm.firstname || createForm.firstname.length < 3) {
        nextErrors.firstname = "First name must be at least 3 characters";
      }
      if (!createForm.lastname || createForm.lastname.length < 3) {
        nextErrors.lastname = "Last name must be at least 3 characters";
      }
      if (!createForm.email) {
        nextErrors.email = "Email is required";
      }
      if (!createForm.password || createForm.password.length < 6) {
        nextErrors.password = "Password must be at least 6 characters";
      }
      setFieldErrors(nextErrors);
      clearToasts();
      return;
    }
    setCreating(true);
    try {
      const payload = {
        firstname: createForm.firstname,
        lastname: createForm.lastname,
        email: createForm.email,
        password: createForm.password,
        role: createForm.role,
      };

      if (createForm.role === "Admin") {
        await api.post("/admin/createAdmin", payload);
      } else {
        await api.post("/eventsOffice/createEventOffice", payload);
      }

      setMessage("Admin/officer created successfully.");
      setCreateForm((prev) => ({
        ...prev,
        firstname: "",
        lastname: "",
        email: "",
        password: "",
      }));
      fetchUsers();
      clearToasts();
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to create account"
      );
      clearToasts();
    } finally {
      setCreating(false);
    }
  };

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
  }, [authUser]);

  const filteredUsers = useMemo(() => {
    const term = search.toLowerCase();

    return users.filter((u) => {
      const normalizedRole = normalizeRole(u.role);
      const matchesSearch =
        (u.firstName && u.firstName.toLowerCase().includes(term)) ||
        (u.firstname && u.firstname.toLowerCase().includes(term)) ||
        (u.lastName && u.lastName.toLowerCase().includes(term)) ||
        (u.lastname && u.lastname.toLowerCase().includes(term)) ||
        (u.companyname && u.companyname.toLowerCase().includes(term)) ||
        (u.email && u.email.toLowerCase().includes(term)) ||
        (normalizedRole && normalizedRole.includes(term));

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          u.status?.toLowerCase() === statusFilter) ||
        (statusFilter === "blocked" &&
          u.status?.toLowerCase() === statusFilter);

      const matchesType = (() => {
        switch (userTypeFilter) {
          case "admins":
            return normalizedRole === "admin";
          case "officers":
            return normalizedRole.includes("event");
          case "admins-officers":
            return (
              normalizedRole === "admin" || normalizedRole.includes("event")
            );
          case "students":
            return normalizedRole === "student";
          case "staff":
            return (
              normalizedRole === "staff" ||
              normalizedRole === "professor" ||
              normalizedRole === "ta"
            );
          default:
            return true;
        }
      })();

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [search, statusFilter, users, userTypeFilter]);

  return (
    <div className="min-h-screen w-full bg-muted text-[#1F1B3B]">
      <div className="flex min-h-screen w-full flex-col items-center px-6 py-8">
        <div className="w-full max">
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

          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
              <input
                type="text"
                placeholder="Search by name, email, or role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full md:max-w-xs border border-white/50 bg-white/70 text-[#1F1B3B] placeholder-[#312A68] rounded-full px-5 py-2 focus:outline-none focus:ring-2 focus:ring-[#736CED] shadow-sm"
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-white/50 bg-white/70 text-[#1F1B3B] rounded-full px-5 py-2 focus:outline-none focus:ring-2 focus:ring-[#736CED] shadow-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="blocked">Blocked Only</option>
              </select>

              <select
                value={userTypeFilter}
                onChange={(e) => setUserTypeFilter(e.target.value)}
                className="border border-white/50 bg-white/70 text-[#1F1B3B] rounded-full px-5 py-2 focus:outline-none focus:ring-2 focus:ring-[#736CED] shadow-sm"
              >
                <option value="all">All Users</option>
                <option value="admins">Admins</option>
                <option value="officers">Officers</option>
                <option value="admins-officers">Admins & Officers</option>
                <option value="students">Students</option>
                <option value="staff">Staff</option>
              </select>
            </div>

            <button
              onClick={() => setShowCreate((v) => !v)}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#001889] px-5 py-2 text-white font-semibold shadow-md hover:bg-[#3a2faa] transition-colors"
            >
              {showCreate ? "Close" : "Add Admin/Officer"}
            </button>
          </div>

          {showCreate && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
              onClick={() => setShowCreate(false)}
            >
              <div
                className="relative w-full max-w-3xl rounded-2xl bg-white p-6 shadow-[0_18px_45px_rgba(0,0,0,0.18)] border border-gray-100"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowCreate(false)}
                  className="absolute right-4 top-4 text-lg font-semibold text-[#4C3BCF] hover:text-[#3a2faa]"
                  aria-label="Close create admin/officer form"
                >
                  ×
                </button>
                <div className="pr-10">
                  <h3 className="text-xl font-semibold text-[#4C3BCF]">
                    Create Admin / Officer
                  </h3>
                </div>
                <form
                  onSubmit={handleCreate}
                  className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2"
                >
                  <label className="flex flex-col gap-2 text-sm font-medium text-[#312A68]">
                    First name
                    <input
                      name="firstname"
                      value={createForm.firstname}
                      onChange={(e) =>
                        setCreateForm((s) => {
                          setFieldErrors((prev) => ({
                            ...prev,
                            firstname: null,
                          }));
                          return {
                            ...s,
                            firstname: e.target.value,
                          };
                        })
                      }
                      className={`rounded-xl border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#736CED] ${
                        fieldErrors.firstname
                          ? "border-red-400 focus:ring-red-300"
                          : "border-gray-200"
                      }`}
                      required
                    />
                    {fieldErrors.firstname && (
                      <span className="text-xs text-red-600">
                        {fieldErrors.firstname}
                      </span>
                    )}
                  </label>
                  <label className="flex flex-col gap-2 text-sm font-medium text-[#312A68]">
                    Last name
                    <input
                      name="lastname"
                      value={createForm.lastname}
                      onChange={(e) =>
                        setCreateForm((s) => {
                          setFieldErrors((prev) => ({
                            ...prev,
                            lastname: null,
                          }));
                          return {
                            ...s,
                            lastname: e.target.value,
                          };
                        })
                      }
                      className={`rounded-xl border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#736CED] ${
                        fieldErrors.lastname
                          ? "border-red-400 focus:ring-red-300"
                          : "border-gray-200"
                      }`}
                      required
                    />
                    {fieldErrors.lastname && (
                      <span className="text-xs text-red-600">
                        {fieldErrors.lastname}
                      </span>
                    )}
                  </label>
                  <label className="flex flex-col gap-2 text-sm font-medium text-[#312A68]">
                    Email (GUC)
                    <input
                      name="email"
                      type="email"
                      value={createForm.email}
                      onChange={(e) =>
                        setCreateForm((s) => {
                          setFieldErrors((prev) => ({ ...prev, email: null }));
                          return {
                            ...s,
                            email: e.target.value,
                          };
                        })
                      }
                      className={`rounded-xl border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#736CED] ${
                        fieldErrors.email
                          ? "border-red-400 focus:ring-red-300"
                          : "border-gray-200"
                      }`}
                      required
                    />
                    {fieldErrors.email && (
                      <span className="text-xs text-red-600">
                        {fieldErrors.email}
                      </span>
                    )}
                  </label>
                  <label className="flex flex-col gap-2 text-sm font-medium text-[#312A68]">
                    Password
                    <input
                      name="password"
                      type="password"
                      value={createForm.password}
                      onChange={(e) =>
                        setCreateForm((s) => {
                          setFieldErrors((prev) => ({
                            ...prev,
                            password: null,
                          }));
                          return {
                            ...s,
                            password: e.target.value,
                          };
                        })
                      }
                      className={`rounded-xl border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#736CED] ${
                        fieldErrors.password
                          ? "border-red-400 focus:ring-red-300"
                          : "border-gray-200"
                      }`}
                      required
                    />
                    {fieldErrors.password && (
                      <span className="text-xs text-red-600">
                        {fieldErrors.password}
                      </span>
                    )}
                  </label>
                  <label className="flex flex-col gap-2 text-sm font-medium text-[#312A68]">
                    Role
                    <select
                      name="role"
                      value={createForm.role}
                      onChange={(e) =>
                        setCreateForm((s) => ({
                          ...s,
                          role: e.target.value,
                        }))
                      }
                      className="rounded-xl border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#736CED]"
                    >
                      <option>Admin</option>
                      <option>Event office</option>
                    </select>
                  </label>
                  <div className="md:col-span-2 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCreate(false)}
                      className="rounded-full px-5 py-2 text-[#4C3BCF] bg-[#EEE9FF] hover:bg-[#e0d9ff] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creating}
                      className="rounded-full px-6 py-2 bg-[#4C3BCF] text-white font-semibold shadow hover:bg-[#3a2faa] transition-colors disabled:opacity-70"
                    >
                      {creating ? "Creating..." : "Create Account"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

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
            <div className="bg-white rounded-2xl shadow-[0_10px_25px_rgba(165,148,249,0.2)] border border-white/50 overflow-hidden mb-12">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#001889] text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Name
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
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Status
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr
                        key={user._id}
                        className="hover:bg-[#F8F7FF] transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-[#312A68]">
                          {user.firstName ||
                            user.firstname ||
                            user.companyname ||
                            "Unknown"}{" "}
                          {user.lastName || user.lastname || ""}{" "}
                          {authUser?._id === user?._id && (
                            <span className="text-[#4C3BCF] font-semibold">
                              (You)
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#312A68]">
                          {user.email || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#312A68]">
                          {user.gucid || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#312A68] capitalize">
                          {user.companyname ? "Vendor" : user.role || "User"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                              user.status?.toLowerCase() === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.status || "Unknown"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-3">
                            {normalizeRole(user.role) !== "admin" && (
                              <>
                                {user.status?.toLowerCase() === "active" ? (
                                  <button
                                    onClick={() =>
                                      handleBlock(user._id, user.role)
                                    }
                                    className="w-10 h-10 rounded-full flex items-center justify-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 border-2 border-yellow-500 bg-yellow-50 text-yellow-600 hover:bg-yellow-500 hover:text-white focus-visible:ring-yellow-200"
                                    title="Block"
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
                                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                      />
                                    </svg>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() =>
                                      handleUnblock(user._id, user.role)
                                    }
                                    className="w-10 h-10 rounded-full flex items-center justify-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 border-2 border-green-500 bg-green-50 text-green-600 hover:bg-green-500 hover:text-white focus-visible:ring-green-200"
                                    title="Unblock"
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
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                  </button>
                                )}
                              </>
                            )}
                            <button
                              onClick={() => handleDelete(user._id, user.role)}
                              className="w-10 h-10 rounded-full flex items-center justify-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 border-2 border-red-500 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white focus-visible:ring-red-200"
                              title="Delete"
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
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
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
