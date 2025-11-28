import React, { useEffect, useState, useCallback } from "react";
import api from "../../services/api";
import { useAuthUser } from "../../hooks/auth";
import {
  CheckCircle,
  XCircle,
  Flag,
  Clock,
  FileText,
  Users,
  Calendar,
  X,
  RefreshCw,
  MapPin,
  HandCoins,
  Trash2,
  Edit,
} from "lucide-react";

const COLORS = {
  primary: "#736CED",
  secondary: "#6DD3CE",
  accent: "#C14953",
  muted: "#f5f5f7",
  info: "#E09000",
};

const statusConfig = {
  Pending: {
    color: COLORS.info,
    icon: Clock,
    badge:
      "bg-[#E09000] text-white border border-[#b87800]/60 shadow-[0_2px_6px_rgba(224,144,0,0.45)]",
  },
  Approved: {
    color: COLORS.secondary,
    icon: CheckCircle,
    badge:
      "bg-green-300 text-slate-900 border border-[#36a69f]/50 shadow-[0_2px_6px_rgba(109,211,206,0.35)]",
  },
  Rejected: {
    color: COLORS.accent,
    icon: XCircle,
    badge:
      "bg-[#C14953] text-white border border-[#a63e47]/60 shadow-[0_2px_6px_rgba(193,73,83,0.35)]",
  },
};

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-base font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

const BUTTON_VARIANTS = {
  primary:
    "bg-[#28A745] text-white shadow-[0_6px_15px_rgba(40,167,69,0.35)] hover:-translate-y-0.5 hover:bg-[#1C7938] hover:shadow-[0_10px_24px_rgba(40,167,69,0.4)] focus-visible:ring-[#28A745]/40",
  secondary:
    "bg-white text-[#736CED] border-2 border-[#736CED]/40 shadow-sm hover:-translate-y-0.5 hover:bg-[#736CED]/10 hover:text-[#4f4ac1] focus-visible:ring-[#736CED]/30",
  info: "bg-white text-[#54C6EB] border-2 border-[#54C6EB]/40 shadow-sm hover:-translate-y-0.5 hover:bg-[#54C6EB]/10 hover:text-[#2a8db0] focus-visible:ring-[#54C6EB]/30",
  danger:
    "bg-[#C14953] text-white shadow-[0_6px_15px_rgba(193,73,83,0.35)] hover:-translate-y-0.5 hover:bg-[#a63e47] focus-visible:ring-[#C14953]/40",
};

function classNames(...values) {
  return values.filter(Boolean).join(" ");
}

function StatusBadge({ status }) {
  const config = statusConfig[status] ?? statusConfig.Pending;
  const Icon = config.icon;

  return (
    <span
      className={classNames(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide shadow-[0_2px_6px_rgba(0,0,0,0.15)]",
        config.badge
      )}
    >
      {Icon ? <Icon className="w-3.5 h-3.5" /> : null}
      {status}
    </span>
  );
}

export default function MyWorkshops() {
  const { user } = useAuthUser();
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const [professors, setProfessors] = useState([]);
  const [profSearch, setProfSearch] = useState("");
  // Track accept/reject decision per workshop to update the inline message
  const [editDecisionById, setEditDecisionById] = useState({});
  const [viewingId, setViewingId] = useState(null);

  const handleAcceptEdits = async (_evt) => {
    try {
      const res = await api.post(`/workshops/acceptEdits/${editing}`);
      const payload = res.data.workshop || res.data;
      // Update the card to reflect accepted edits
      setWorkshops((prev) =>
        prev.map((w) => (w._id === editing ? { ...w, ...payload } : w))
      );
      setEditDecisionById((prev) => ({ ...prev, [editing]: "accepted" }));
    } catch (error) {
      setError("Failed to accept edits");
    }
  };

  const handleRejectEdits = async (_evt) => {
    try {
      const res = await api.post(`/workshops/rejectEdits/${editing}`);
      // Keep the card visible and reflect rejection locally
      const payload = res.data.workshop || res.data;
      setWorkshops((prev) =>
        prev.map((w) => (w._id === editing ? { ...w, ...payload } : w))
      );
      setEditDecisionById((prev) => ({ ...prev, [editing]: "rejected" }));
    } catch (error) {
      setError("Failed to reject edits");
    }
  };

  const SkeletonCard = () => (
    <div className="relative overflow-hidden rounded-2xl bg-[#FDFBFF] backdrop-blur-sm border border-white/40 shadow-lg animate-pulse">
      <div className="bg-gray-300 px-6 py-5 overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-400 rounded w-1/4"></div>
            <div className="h-6 bg-gray-400 rounded w-3/4"></div>
            <div className="h-4 bg-gray-400 rounded w-1/2"></div>
          </div>
          <div className="h-6 bg-gray-400 rounded-full w-20"></div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="h-7 bg-gray-300 rounded w-3/4"></div>
          <div className="h-6 bg-gray-300 rounded-full w-16"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
        <div className="flex items-center justify-between gap-4 pt-2">
          <div className="h-4 bg-gray-300 rounded w-1/3"></div>
          <div className="h-10 bg-gray-300 rounded-full w-28"></div>
        </div>
      </div>
    </div>
  );

  const FACULTIES = [
    "IET",
    "MET",
    "EMS",
    "ARCH",
    "CIVIL",
    "MGT",
    "BI",
    "AA",
    "PH & BIO",
    "LAW",
  ];

  const formatCommentDate = useCallback((value) => {
    if (!value) return "Date unavailable";
    try {
      return new Date(value).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return value;
    }
  }, []);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/workshops/getMyWorkshops");
        const items = res.data.myworkshops || res.data || [];
        setWorkshops(items);
      } catch (err) {
        setError("Failed to load workshops");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  useEffect(() => {
    const loadProfs = async () => {
      try {
        const res = await api.get("/user/getProfessors");
        setProfessors(Array.isArray(res?.data) ? res.data : []);
      } catch (e) {
        // non-fatal
      }
    };
    loadProfs();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const startEdit = (workshop) => {
    const profs =
      workshop.professorsparticipating ||
      workshop.professorsParticipating ||
      workshop.professors ||
      [];
    const profIds = Array.isArray(profs)
      ? profs.map((p) => (p && (p._id || p.id) ? p._id || p.id : String(p)))
      : [];
    setEditing(workshop._id);
    setForm({ ...workshop, professorsparticipating: profIds });
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm({});
  };

  const saveEdit = async () => {
    try {
      const payload = { ...form };
      if (Array.isArray(payload.professorsparticipating)) {
        payload.professorsparticipating = payload.professorsparticipating.map(
          (p) => (p && (p._id || p.id) ? p._id || p.id : String(p))
        );
      } else {
        payload.professorsparticipating = [];
      }
      if (payload.extrarequiredfunding !== undefined)
        payload.extrarequiredfunding = Number(payload.extrarequiredfunding) || 0;
      if (payload.capacity !== undefined)
        payload.capacity = Number(payload.capacity) || 0;

      const res = await api.put(
        `/workshops/updateWorkshop/${editing}`,
        payload
      );
      const updated =
        res?.data?.workshop || res?.data?.updatedWorkshop || payload;
      setWorkshops((prev) =>
        prev.map((w) => (w._id === editing ? { ...w, ...updated } : w))
      );
      cancelEdit();
    } catch (err) {
      alert("Failed to update");
    }
  };

  const toggleDetailsView = (id) => {
    setViewingId((prevId) => (prevId === id ? null : id));
    if (editing) cancelEdit();
  };

  const activateEditMode = (workshop) => {
    startEdit(workshop);
    setViewingId(null);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this workshop?")) return;
    try {
      await api.delete(`/workshops/deleteWorkshop/${id}`);
      setWorkshops((prev) => prev.filter((w) => w._id !== id));
    } catch (err) {
      alert("Failed to delete");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen w-full overflow-hidden bg-muted text-[#1F1B3B] p-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen w-full overflow-hidden bg-muted text-[#1F1B3B]">
      <div className="relative flex min-h-screen w-full flex-col items-center">
        <main className="relative z-10 flex w-full flex-1 flex-col items-center px-6 py-8">
          <div className="w-full max-w-6xl">
            {workshops.length === 0 ? (
              <div className="text-center text-[#312A68]/70 py-16 bg-white/50 rounded-3xl">
                You have not created any workshops yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {workshops.map((w) => {
                  const workshopId = w._id || w.id;
                  const normalizedComments = Array.isArray(w.comments)
                    ? w.comments
                    : typeof w.comments === "string" && w.comments.trim()
                    ? [{ message: w.comments }]
                    : [];

                  return (
                    <article
                      key={workshopId}
                      className="relative overflow-hidden rounded-2xl bg-[#FDFBFF] backdrop-blur-sm border border-white/40 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
                    >
                      <div className="relative bg-[#001889] px-6 py-5 text-white overflow-hidden">
                        <div className="relative flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-xs uppercase tracking-wider text-white/70 font-semibold">
                              Faculty Responsible
                            </p>
                            <h3 className="text-lg font-bold mt-1">
                              {w.facultyresponsibilty}
                            </h3>
                            <p className="text-sm text-white/80 mt-0.5">
                              {w.location}
                            </p>
                          </div>
                          <div>
                            <StatusBadge status={w.status} />
                          </div>
                        </div>
                      </div>

                      <div className="px-6 py-6 space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="text-xl font-bold text-[#736CED] flex-1 leading-tight">
                            {w.workshopname}
                          </h4>

                          {/* HEADER BUTTONS: Only show View/Delete when NOT editing */}
                          {editing !== w._id && (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => toggleDetailsView(w._id)}
                                title={viewingId === w._id ? "Close Details" : "View Details"}
                                className={`rounded-full border p-2 shadow-sm transition focus-visible:outline-none ${
                                  viewingId === w._id
                                    ? "bg-[#736CED] text-white border-[#736CED]"
                                    : "bg-white/90 border-gray-200 hover:bg-gray-100 text-gray-700"
                                }`}
                                aria-label="View Workshop Details"
                              >
                                {viewingId === w._id ? <X size={16} /> : <FileText size={16} />}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(w._id)}
                                title="Delete"
                                className="rounded-full border border-red-200 bg-white/90 p-2 text-red-600 shadow-sm transition hover:bg-red-100 focus-visible:outline-none"
                                aria-label="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Standard Summary info (always visible unless editing) */}
                        {editing !== w._id && (
                          <>
                            <p className="text-sm leading-relaxed text-gray-700 line-clamp-2">
                              {w.shortdescription}
                            </p>
                            <div className="text-sm text-gray-600">
                              {w.startdate && w.enddate ? (
                                <span>
                                  {new Date(w.startdate).toLocaleDateString()}{" "}
                                  {w.starttime} -{" "}
                                  {new Date(w.enddate).toLocaleDateString()}{" "}
                                  {w.endtime}
                                </span>
                              ) : null}
                            </div>
                          </>
                        )}

                        {/* ================= VIEW DETAILS MODE (Read Only) ================= */}
                        {viewingId === w._id && editing !== w._id && (
                          <div className="mt-4 p-5 rounded-xl border border-[#736CED]/20 bg-white/80 space-y-4 animate-in fade-in slide-in-from-top-2 relative">
                            {/* --- NEW EDIT ICON BUTTON (Positioned Top Right) --- */}
                            <button
                              type="button"
                              onClick={() => activateEditMode(w)}
                              title="Edit Workshop"
                              className="absolute top-2 right-4 rounded-full  bg-white p-2 text-[#736CED] shadow-sm transition hover:bg-[#736CED] hover:text-white focus-visible:outline-none z-10"
                              aria-label="Edit Workshop"
                            >
                              <Edit size={16} /> 
                            </button>

                            <h3 className="text-sm font-bold text-[#736CED] uppercase tracking-wide mb-2 border-b border-[#736CED]/10 pb-2">
                              Workshop Details
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-700">
                              <div>
                                <label className="block text-xs text-[#312A68]/60 font-semibold uppercase">Location</label>
                                <p>{w.location}</p>
                              </div>
                              <div>
                                <label className="block text-xs text-[#312A68]/60 font-semibold uppercase">Dates</label>
                                <p>
                                  {new Date(w.startdate).toLocaleDateString()} to {new Date(w.enddate).toLocaleDateString()}
                                </p>
                              </div>
                              <div>
                                <label className="block text-xs text-[#312A68]/60 font-semibold uppercase">Time</label>
                                <p>{w.starttime} - {w.endtime}</p>
                              </div>
                              <div>
                                <label className="block text-xs text-[#312A68]/60 font-semibold uppercase">Reg. Deadline</label>
                                <p>{w.registrationDeadline ? new Date(w.registrationDeadline).toLocaleDateString() : "N/A"}</p>
                              </div>
                              <div>
                                <label className="block text-xs text-[#312A68]/60 font-semibold uppercase">Funding Source</label>
                                <p>{w.fundingsource}</p>
                              </div>
                              <div>
                                <label className="block text-xs text-[#312A68]/60 font-semibold uppercase">Total Capacity</label>
                                <p>{w.capacity}</p>
                              </div>
                              <div>
                                <label className="block text-xs text-[#312A68]/60 font-semibold uppercase">Required Budget</label>
                                <p>{w.requiredFunding || 0} EGP</p>
                              </div>
                              <div>
                                <label className="block text-xs text-[#312A68]/60 font-semibold uppercase">Extra Funding</label>
                                <p>{w.extrarequiredfunding || 0} EGP</p>
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs text-[#312A68]/60 font-semibold uppercase mb-1">Short Description</label>
                              <p className="text-sm text-slate-700 bg-white p-2 rounded border border-gray-100">{w.shortdescription}</p>
                            </div>

                            <div>
                              <label className="block text-xs text-[#312A68]/60 font-semibold uppercase mb-1">Full Agenda</label>
                              <p className="text-sm text-slate-700 bg-white p-2 rounded border border-gray-100 whitespace-pre-wrap">{w.fullagenda || "No agenda provided."}</p>
                            </div>

                            <div>
                              <label className="block text-xs text-[#312A68]/60 font-semibold uppercase mb-1">Participating Professors</label>
                              <div className="flex flex-wrap gap-2">
                                {w.professorsparticipating && w.professorsparticipating.length > 0 ? (
                                  w.professorsparticipating.map((prof, idx) => (
                                    <span key={idx} className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs border border-indigo-100">
                                      {prof.firstname} {prof.lastname}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-gray-400 italic text-xs">None listed</span>
                                )}
                              </div>
                            </div>

                            {/* --- MOVED REVIEWER COMMENTS INSIDE HERE --- */}
                            {w.currentMessage?.awaitingResponseFrom === "Professor" && (
                              <div className="w-full">
                                {normalizedComments.length > 0 && (
                                  <div className="rounded-2xl border border-slate-200/70 bg-white/60 backdrop-blur-sm p-4 shadow-sm">
                                    <h4 className="text-base font-semibold text-slate-800 mb-3">Reviewer Comments</h4>
                                    <ul className="space-y-3">
                                      {normalizedComments.map((comment, index) => (
                                        <li key={`${workshopId}-comment-${index}`} className="rounded-xl bg-white border border-slate-200 px-4 py-3 shadow-[0_2px_6px_rgba(15,23,42,0.05)]">
                                          <p className="text-sm text-slate-700 leading-relaxed">{comment.message || String(comment)}</p>
                                          {(comment.author || comment.date) && (
                                            <div className="mt-2 text-xs text-slate-500 flex flex-wrap items-center gap-2">
                                              {comment.author && <span className="font-semibold text-[#736CED]">{comment.author}</span>}
                                              {comment.author && comment.date && <span aria-hidden="true" className="text-slate-300">|</span>}
                                              {comment.date && <span>{formatCommentDate(comment.date)}</span>}
                                            </div>
                                          )}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* --- REMOVED BOTTOM BUTTONS (Since 'Close' is handled by X icon and 'Edit' moved to top) --- */}
                          </div>
                        )}

                        {/* ================= EDIT MODE ================= */}
                        {editing === w._id && (
                          <div className="mt-4 p-4 rounded-xl border border-[#736CED]/30 bg-white/70 space-y-3 animate-in fade-in zoom-in-95">
                            <h3 className="text-sm font-bold text-[#736CED] uppercase tracking-wide mb-2">
                              Editing Workshop
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {/* ... Inputs ... */}
                              <div>
                                <label className="text-xs text-[#312A68]">Workshop Title</label>
                                <input
                                  name="workshopname"
                                  value={form.workshopname || ""}
                                  onChange={handleChange}
                                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-[#736CED] focus:outline-none"
                                />
                              </div>
                              {/* ... Other inputs same as before ... */}
                              <div>
                                <label className="text-xs text-[#312A68]">Location</label>
                                <select
                                  name="location"
                                  value={form.location || "GUC Cairo"}
                                  onChange={handleChange}
                                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-[#736CED] focus:outline-none"
                                >
                                  <option>GUC Cairo</option>
                                  <option>GUC Berlin</option>
                                </select>
                              </div>
                              {/* Date Inputs */}
                              <div>
                                <label className="text-xs text-[#312A68]">Start Date</label>
                                <input
                                  type="date"
                                  name="startdate"
                                  value={form.startdate ? String(form.startdate).substring(0, 10) : ""}
                                  onChange={handleChange}
                                  className="w-full border rounded px-3 py-2"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-[#312A68]">Start Time</label>
                                <input
                                  type="time"
                                  name="starttime"
                                  value={form.starttime || ""}
                                  onChange={handleChange}
                                  className="w-full border rounded px-3 py-2"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-[#312A68]">End Date</label>
                                <input
                                  type="date"
                                  name="enddate"
                                  value={form.enddate ? String(form.enddate).substring(0, 10) : ""}
                                  onChange={handleChange}
                                  className="w-full border rounded px-3 py-2"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-[#312A68]">End Time</label>
                                <input
                                  type="time"
                                  name="endtime"
                                  value={form.endtime || ""}
                                  onChange={handleChange}
                                  className="w-full border rounded px-3 py-2"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-[#312A68]">Registration Deadline</label>
                                <input
                                  type="date"
                                  name="registrationDeadline"
                                  value={form.registrationDeadline ? String(form.registrationDeadline).substring(0, 10) : ""}
                                  onChange={handleChange}
                                  className="w-full border rounded px-3 py-2"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-[#312A68]">Faculty Responsible</label>
                                <select
                                  name="facultyresponsibilty"
                                  value={form.facultyresponsibilty || FACULTIES[0]}
                                  onChange={handleChange}
                                  className="w-full border rounded px-3 py-2"
                                >
                                  {FACULTIES.map((f) => (
                                    <option key={f} value={f}>{f}</option>
                                  ))}
                                </select>
                              </div>
                              {/* Funding & Capacity */}
                              <div>
                                <label className="text-xs text-[#312A68]">Funding Source</label>
                                <select
                                  name="fundingsource"
                                  value={form.fundingsource || "GUC"}
                                  onChange={handleChange}
                                  className="w-full border rounded px-3 py-2"
                                >
                                  <option>GUC</option>
                                  <option>External</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-xs text-[#312A68]">Required Budget (EGP)</label>
                                <input
                                  type="number"
                                  name="requiredFunding"
                                  value={form.requiredFunding ?? 0}
                                  onChange={handleChange}
                                  className="w-full border rounded px-3 py-2"
                                  min={0}
                                />
                              </div>
                              <div>
                                <label className="text-xs text-[#312A68]">Extra Funding (EGP)</label>
                                <input
                                  type="number"
                                  name="extrarequiredfunding"
                                  value={form.extrarequiredfunding ?? 0}
                                  onChange={handleChange}
                                  className="w-full border rounded px-3 py-2"
                                  min={0}
                                />
                              </div>
                              <div>
                                <label className="text-xs text-[#312A68]">Capacity</label>
                                <input
                                  type="number"
                                  name="capacity"
                                  value={form.capacity ?? 1}
                                  onChange={handleChange}
                                  className="w-full border rounded px-3 py-2"
                                  min={1}
                                />
                              </div>
                            </div>
                            
                            {/* Text Areas */}
                            <div>
                              <label className="text-xs text-[#312A68]">Short Description</label>
                              <textarea
                                name="shortdescription"
                                value={form.shortdescription || ""}
                                onChange={handleChange}
                                className="w-full border rounded px-3 py-2"
                                rows={3}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-[#312A68]">Full Agenda</label>
                              <textarea
                                name="fullagenda"
                                value={form.fullagenda || ""}
                                onChange={handleChange}
                                className="w-full border rounded px-3 py-2"
                                rows={5}
                              />
                            </div>

                            {/* Professor Selector */}
                            <div>
                              <label className="text-xs text-[#312A68]">Professors Participating</label>
                              <div className="mb-2">
                                <input
                                  type="text"
                                  placeholder="Search professors by name..."
                                  value={profSearch}
                                  onChange={(e) => setProfSearch(e.target.value)}
                                  className="w-full border rounded px-3 py-2 text-sm"
                                />
                              </div>
                              <div className="max-h-44 overflow-auto rounded border px-3 py-2 bg-white/70">
                                {(Array.isArray(professors) ? professors : [])
                                  .filter((p) => {
                                    const name = `${p.firstname || ""} ${p.lastname || ""}`.trim().toLowerCase();
                                    return name.includes(profSearch.trim().toLowerCase());
                                  })
                                  .map((p) => {
                                    const id = p._id || p.id;
                                    const selected = Array.isArray(form.professorsparticipating) && form.professorsparticipating.some((pid) => String(pid) === String(id));
                                    return (
                                      <label key={id} className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-50 rounded px-1">
                                        <input
                                          type="checkbox"
                                          checked={!!selected}
                                          onChange={() => {
                                            setForm((prev) => {
                                              const current = Array.isArray(prev.professorsparticipating) ? [...prev.professorsparticipating] : [];
                                              if (selected) {
                                                return { ...prev, professorsparticipating: current.filter((pid) => String(pid) !== String(id)) };
                                              }
                                              return { ...prev, professorsparticipating: [...current, id] };
                                            });
                                          }}
                                          className="accent-[#736CED] h-4 w-4 rounded border-gray-300"
                                        />
                                        <span className="text-sm text-gray-700">
                                          {`${p.firstname || ""} ${p.lastname || ""}`.trim() || id}
                                        </span>
                                      </label>
                                    );
                                  })}
                              </div>
                              <p className="text-xs text-[#312A68]/70 mt-1">Select at least one professor.</p>
                            </div>

                            {/* Events Office Comments - EDIT MODE */}
                            {w.currentMessage?.awaitingResponseFrom === "Professor" && (
                              <div>
                                {editDecisionById[w._id] ? (
                                  <div className="rounded-md border border-slate-200 bg-white/70 px-3 py-2 text-sm font-semibold text-slate-700">
                                    {editDecisionById[w._id] === "accepted" ? "Edits Accepted" : "Edits Rejected"}
                                  </div>
                                ) : (
                                  <>
                                    <div>
                                      <label className="text-xs text-[#312A68]">Events office has requested the following changes:</label>
                                      <textarea
                                        value={w.comments || ""}
                                        readOnly
                                        className="w-full border rounded px-3 py-2 bg-gray-100"
                                        rows={3}
                                      />
                                    </div>
                                    <div className="flex justify-end mt-4">
                                      <button className={classNames(BUTTON_BASE, BUTTON_VARIANTS.primary, "w-full sm:w-auto mr-3")} onClick={handleAcceptEdits}>
                                        Accept Edits
                                      </button>
                                      <button className={classNames(BUTTON_BASE, BUTTON_VARIANTS.danger, "w-full sm:w-auto")} onClick={handleRejectEdits}>
                                        Reject Edits
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            )}

                            {/* Save / Cancel Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#736CED]/20 mt-4">
                              <button
                                onClick={cancelEdit}
                                className={classNames(BUTTON_BASE, BUTTON_VARIANTS.danger, "px-8 py-2.5")}
                              >
                                Cancel
                              </button>
                              <button
                                onClick={saveEdit}
                                className={classNames(BUTTON_BASE, BUTTON_VARIANTS.primary, "px-8 py-2.5")}
                              >
                                Save Changes
                              </button>
                            </div>
                          </div>
                        )}

                        {/* ================= PARTICIPANTS SECTION ================= */}
                        {w.status === "Approved" && (
                          <div className="rounded-2xl border border-slate-200/70 bg-white/60 backdrop-blur-sm p-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                              <Users className="w-4 h-4 text-[#736CED]" />
                              <h4 className="text-base font-semibold text-slate-800">
                                Workshop Participants
                              </h4>
                            </div>

                            {/* Capacity Summary */}
                            <div className="mb-4 p-3 bg-gradient-to-r from-[#736CED]/10 to-[#6DD3CE]/10 rounded-lg border border-[#736CED]/20">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-[#312A68]">
                                  Total Capacity: <span className="text-[#736CED] font-bold">{w.capacity || 0}</span>
                                </span>
                                <span className="font-medium text-[#312A68]">
                                  Registered: <span className="text-[#6DD3CE] font-bold">{(w.registered?.length || 0) + (w.attendees?.length || 0)}</span>
                                </span>
                                <span className="font-medium text-[#312A68]">
                                  Remaining:{" "}
                                  <span className={`font-bold ${(w.capacity || 0) - ((w.registered?.length || 0) + (w.attendees?.length || 0)) <= 0 ? "text-[#C14953]" : "text-[#28a745]"}`}>
                                    {Math.max(0, (w.capacity || 0) - ((w.registered?.length || 0) + (w.attendees?.length || 0)))}
                                  </span>
                                </span>
                              </div>
                            </div>

                            {(w.attendees && w.attendees.length > 0) || (w.registered && w.registered.length > 0) ? (
                              <div className="space-y-4">
                                {/* Paid Attendees */}
                                {w.attendees && w.attendees.length > 0 && (
                                  <div>
                                    <h5 className="text-sm font-semibold text-[#28a745] mb-2 flex items-center gap-1">
                                      <CheckCircle className="w-3.5 h-3.5" />
                                      Paid Participants ({w.attendees.length})
                                    </h5>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                      {w.attendees.map((attendee, index) => (
                                        <div key={`attendee-${index}`} className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                                          <div className="w-6 h-6 bg-[#28a745] rounded-full flex items-center justify-center flex-shrink-0">
                                            <CheckCircle className="w-3.5 h-3.5 text-white" />
                                          </div>
                                          <div className="min-w-0 flex-1">
                                            <p className="text-xs font-medium text-gray-900 truncate">{attendee.firstname} {attendee.lastname}</p>
                                            <p className="text-xs text-gray-600 truncate">{attendee.gucid}</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Registered (Unpaid) */}
                                {w.registered && w.registered.length > 0 && (
                                  <div>
                                    <h5 className="text-sm font-semibold text-[#54C6EB] mb-2 flex items-center gap-1">
                                      <Clock className="w-3.5 h-3.5" />
                                      Registered (Pending Payment) ({w.registered.length})
                                    </h5>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                      {w.registered.map((participant, index) => (
                                        <div key={`registered-${index}`} className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                                          <div className="w-6 h-6 bg-[#54C6EB] rounded-full flex items-center justify-center flex-shrink-0">
                                            <Clock className="w-3.5 h-3.5 text-white" />
                                          </div>
                                          <div className="min-w-0 flex-1">
                                            <p className="text-xs font-medium text-gray-900 truncate">{participant.firstname} {participant.lastname}</p>
                                            <p className="text-xs text-gray-600 truncate">{participant.gucid}</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-center py-6">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                  <Users className="w-6 h-6 text-gray-400" />
                                </div>
                                <p className="text-sm text-gray-500 mb-1">No participants yet</p>
                                <p className="text-xs text-gray-400">Participants will appear here once they register for your workshop</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}