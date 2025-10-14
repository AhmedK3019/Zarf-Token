import React, { useEffect, useState, useCallback } from "react";
import api from "../../services/api";
import { useAuthUser } from "../../hooks/auth";

export default function MyWorkshops() {
  const { user } = useAuthUser();
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const [professors, setProfessors] = useState([]);
  const [profSearch, setProfSearch] = useState("");

  const COLORS = {
    primary: "#736CED",
    secondary: "#6DD3CE",
    accent: "#C14953",
    muted: "#D5CFE1",
    info: "#54C6EB",
  };
  const categoryChipStyles = {
    default:
      "bg-[#736CED] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-[0_2px_6px_rgba(0,0,0,0.15)]",
  };
  const BUTTON_BASE =
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-base font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
  const BUTTON_VARIANTS = {
    primary:
      "bg-gradient-to-r from-[#736CED] to-[#6DD3CE] text-white shadow-[0_6px_15px_rgba(115,108,237,0.35)] hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(115,108,237,0.4)] hover:brightness-110 focus-visible:ring-[#736CED]/40",
    secondary:
      "bg-white text-[#736CED] border-2 border-[#736CED]/40 shadow-sm hover:-translate-y-0.5 hover:bg-[#736CED]/10 hover:text-[#4f4ac1] focus-visible:ring-[#736CED]/30",
    danger:
      "bg-[#C14953] text-white shadow-[0_6px_15px_rgba(193,73,83,0.35)] hover:-translate-y-0.5 hover:bg-[#a63e47] focus-visible:ring-[#C14953]/40",
  };
  const classNames = (...values) => values.filter(Boolean).join(" ");

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
        const res = await api.get("/workshops/getAllWorkshops");
        const items = res.data.myworkshops || res.data || [];
        const myId = user?._id || user?.id;

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
    // Normalize professors participating into an array of ids for the edit form
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
      // Prepare payload: normalize professors to ids and numeric fields
      const payload = { ...form };
      if (Array.isArray(payload.professorsparticipating)) {
        payload.professorsparticipating = payload.professorsparticipating.map(
          (p) => (p && (p._id || p.id) ? p._id || p.id : String(p))
        );
      } else {
        payload.professorsparticipating = [];
      }
      if (payload.extrarequiredfunding !== undefined)
        payload.extrarequiredfunding =
          Number(payload.extrarequiredfunding) || 0;
      if (payload.capacity !== undefined)
        payload.capacity = Number(payload.capacity) || 0;

      delete payload._id;
      delete payload.type;
      delete payload.createdBy;
      delete payload.createdAt;
      delete payload.attendees;
      delete payload.comments;
      const res = await api.put(
        `/workshops/updateWorkshop/${editing}`,
        payload
      );
      // prefer server's returned workshop if present
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
      <div className="min-h-screen w-full overflow-hidden bg-[#D5CFE1] text-[#1F1B3B] p-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen w-full overflow-hidden bg-[#D5CFE1] text-[#1F1B3B]">
      <div className="relative flex min-h-screen w-full flex-col items-center">
        <main className="relative z-10 flex w-full flex-1 flex-col items-center px-6 py-8">
          <div className="w-full max-w-6xl">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-[#736CED] sm:text-4xl mb-2">
                My Workshops
              </h2>
              <p className="text-[#312A68] opacity-80">
                Here are the workshops created by you.
              </p>
            </div>

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
                      style={{
                        borderLeftWidth: "4px",
                        borderLeftColor: COLORS.primary,
                      }}
                    >
                      <div className="relative bg-gradient-to-r from-[#736CED] via-[#736CED]/90 to-[#6DD3CE] px-6 py-5 text-white overflow-hidden">
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
                          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide bg-white/20 text-white border border-white/30">
                            {w.status || "Pending"}
                          </span>
                        </div>
                      </div>

                      <div className="px-6 py-6 space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="text-xl font-bold text-slate-800">
                            {w.workshopname}
                          </h4>
                          <div className="flex gap-2">
                            {editing === w._id ? (
                              <>
                                <button
                                  onClick={saveEdit}
                                  className={classNames(
                                    BUTTON_BASE,
                                    BUTTON_VARIANTS.primary,
                                    "px-5 py-2.5"
                                  )}
                                >
                                  Save
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className={classNames(
                                    BUTTON_BASE,
                                    BUTTON_VARIANTS.secondary,
                                    "px-5 py-2.5"
                                  )}
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEdit(w)}
                                  className={classNames(
                                    BUTTON_BASE,
                                    BUTTON_VARIANTS.secondary,
                                    "px-5 py-2.5"
                                  )}
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(w._id)}
                                  className={classNames(
                                    BUTTON_BASE,
                                    BUTTON_VARIANTS.danger,
                                    "px-5 py-2.5"
                                  )}
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        <div>
                          <span className={categoryChipStyles.default}>
                            Workshop
                          </span>
                        </div>

                        <p className="text-sm leading-relaxed text-gray-700">
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

                        {editing === w._id && (
                          <div className="mt-4 p-4 rounded-xl border border-[#736CED]/30 bg-white/70 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs text-[#312A68]">
                                  Workshop Title
                                </label>
                                <input
                                  name="workshopname"
                                  value={form.workshopname || ""}
                                  onChange={handleChange}
                                  className="w-full border rounded px-3 py-2"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-[#312A68]">
                                  Location
                                </label>
                                <select
                                  name="location"
                                  value={form.location || "GUC Cairo"}
                                  onChange={handleChange}
                                  className="w-full border rounded px-3 py-2"
                                >
                                  <option>GUC Cairo</option>
                                  <option>GUC Berlin</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-xs text-[#312A68]">
                                  Start Date
                                </label>
                                <input
                                  type="date"
                                  name="startdate"
                                  value={
                                    form.startdate
                                      ? String(form.startdate).substring(0, 10)
                                      : ""
                                  }
                                  onChange={handleChange}
                                  className="w-full border rounded px-3 py-2"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-[#312A68]">
                                  Start Time
                                </label>
                                <input
                                  type="time"
                                  name="starttime"
                                  value={form.starttime || ""}
                                  onChange={handleChange}
                                  className="w-full border rounded px-3 py-2"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-[#312A68]">
                                  End Date
                                </label>
                                <input
                                  type="date"
                                  name="enddate"
                                  value={
                                    form.enddate
                                      ? String(form.enddate).substring(0, 10)
                                      : ""
                                  }
                                  onChange={handleChange}
                                  className="w-full border rounded px-3 py-2"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-[#312A68]">
                                  End Time
                                </label>
                                <input
                                  type="time"
                                  name="endtime"
                                  value={form.endtime || ""}
                                  onChange={handleChange}
                                  className="w-full border rounded px-3 py-2"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-[#312A68]">
                                  Faculty Responsible
                                </label>
                                <select
                                  name="facultyresponsibilty"
                                  value={
                                    form.facultyresponsibilty || FACULTIES[0]
                                  }
                                  onChange={handleChange}
                                  className="w-full border rounded px-3 py-2"
                                >
                                  {FACULTIES.map((f) => (
                                    <option key={f} value={f}>
                                      {f}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="text-xs text-[#312A68]">
                                  Funding Source
                                </label>
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
                                <label className="text-xs text-[#312A68]">
                                  Extra Funding (EGP)
                                </label>
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
                                <label className="text-xs text-[#312A68]">
                                  Capacity
                                </label>
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
                            <div>
                              <label className="text-xs text-[#312A68]">
                                Short Description
                              </label>
                              <textarea
                                name="shortdescription"
                                value={form.shortdescription || ""}
                                onChange={handleChange}
                                className="w-full border rounded px-3 py-2"
                                rows={3}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-[#312A68]">
                                Full Agenda
                              </label>
                              <textarea
                                name="fullagenda"
                                value={form.fullagenda || ""}
                                onChange={handleChange}
                                className="w-full border rounded px-3 py-2"
                                rows={5}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-[#312A68]">
                                Professors Participating
                              </label>
                              <div className="mb-2">
                                <input
                                  type="text"
                                  placeholder="Search professors by name..."
                                  value={profSearch}
                                  onChange={(e) =>
                                    setProfSearch(e.target.value)
                                  }
                                  className="w-full border rounded px-3 py-2"
                                />
                              </div>
                              <div className="max-h-44 overflow-auto rounded border px-3 py-2 bg-white/70">
                                {(Array.isArray(professors) ? professors : [])
                                  .filter((p) => {
                                    const name = `${p.firstname || ""} ${
                                      p.lastname || ""
                                    }`
                                      .trim()
                                      .toLowerCase();
                                    return name.includes(
                                      profSearch.trim().toLowerCase()
                                    );
                                  })
                                  .map((p) => {
                                    const id = p._id || p.id;
                                    const selected =
                                      Array.isArray(
                                        form.professorsparticipating
                                      ) &&
                                      form.professorsparticipating.some(
                                        (pid) => String(pid) === String(id)
                                      );
                                    return (
                                      <label
                                        key={id}
                                        className="flex items-center gap-2 py-1"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={!!selected}
                                          onChange={() => {
                                            setForm((prev) => {
                                              const current = Array.isArray(
                                                prev.professorsparticipating
                                              )
                                                ? [
                                                    ...prev.professorsparticipating,
                                                  ]
                                                : [];
                                              if (selected) {
                                                return {
                                                  ...prev,
                                                  professorsparticipating:
                                                    current.filter(
                                                      (pid) =>
                                                        String(pid) !==
                                                        String(id)
                                                    ),
                                                };
                                              }
                                              return {
                                                ...prev,
                                                professorsparticipating: [
                                                  ...current,
                                                  id,
                                                ],
                                              };
                                            });
                                          }}
                                          className="accent-[#736CED]"
                                        />
                                        <span className="text-sm">
                                          {`${p.firstname || ""} ${
                                            p.lastname || ""
                                          }`.trim() || id}
                                        </span>
                                      </label>
                                    );
                                  })}
                              </div>
                              <p className="text-xs text-[#312A68]/70 mt-1">
                                Select at least one professor.
                              </p>
                            </div>
                          </div>
                        )}

                        {normalizedComments.length > 0 && (
                          <div className="w-full">
                            <div className="rounded-2xl border border-slate-200/70 bg-white/60 backdrop-blur-sm p-4 shadow-sm">
                              <h4 className="text-base font-semibold text-slate-800 mb-3">
                                Reviewer Comments
                              </h4>
                              <ul className="space-y-3">
                                {normalizedComments.map((comment, index) => (
                                  <li
                                    key={`${workshopId}-comment-${index}`}
                                    className="rounded-xl bg-white border border-slate-200 px-4 py-3 shadow-[0_2px_6px_rgba(15,23,42,0.05)]"
                                  >
                                    <p className="text-sm text-slate-700 leading-relaxed">
                                      {comment.message || String(comment)}
                                    </p>
                                    {(comment.author || comment.date) && (
                                      <div className="mt-2 text-xs text-slate-500 flex flex-wrap items-center gap-2">
                                        {comment.author && (
                                          <span className="font-semibold text-[#736CED]">
                                            {comment.author}
                                          </span>
                                        )}
                                        {comment.author && comment.date && (
                                          <span
                                            aria-hidden="true"
                                            className="text-slate-300"
                                          >
                                            |
                                          </span>
                                        )}
                                        {comment.date && (
                                          <span>
                                            {formatCommentDate(comment.date)}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
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
