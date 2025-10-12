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
  // Comments are loaded directly from each workshop object if present

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
        const items = res.data.workshops || res.data || [];
        const myId = user?._id || user?.id;

        const filtered = items.filter((w) => {
          if (!myId) return false;
          // Show workshops created by the user OR where the user participates
          const isOwner = String(w.createdBy) === String(myId);
          const isParticipant = Array.isArray(w.professorsparticipating)
            ? w.professorsparticipating.some(
                (pid) => String(pid) === String(myId)
              )
            : false;
          return isOwner || isParticipant;
        });

        setWorkshops(filtered);
      } catch (err) {
        setError("Failed to load workshops");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const startEdit = (workshop) => {
    setEditing(workshop._id);
    setForm({ ...workshop });
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm({});
  };

  const saveEdit = async () => {
    try {
      await api.put(`/workshops/updateWorkshop/${editing}`, {
        ...form,
        extrarequiredfunding: Number(form.extrarequiredfunding),
      });
      setWorkshops((prev) =>
        prev.map((w) => (w._id === editing ? { ...w, ...form } : w))
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

  if (loading) return <div className="p-6">Loading...</div>;
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
              {error ? (
                <p className="max-w-2xl mx-auto text-[#9F2D20] bg-[#FEE2E2] border border-[#FCA5A5] rounded-lg px-4 py-2">
                  {error}
                </p>
              ) : (
                <p className="text-[#312A68] opacity-80">
                  Here are the workshops created by you.
                </p>
              )}
            </div>

            {workshops.length === 0 ? (
              <div className="text-center text-[#312A68]/70 py-16 bg-white/50 rounded-3xl">
                You have not created any workshops yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {workshops.map((w) => {
                  const workshopId = w._id || w.id;
                  // Normalize comments: can be array of {message,date,author} or a single string
                  const normalizedComments = Array.isArray(w.comments)
                    ? w.comments
                    : typeof w.comments === "string" && w.comments.trim()
                    ? [{ message: w.comments }]
                    : [];

                  return editing === w._id ? (
                    // edit mode
                    <div
                      key={w._id}
                      className="rounded-xl border p-4 bg-white/5"
                    >
                      <h3 className="text-lg font-semibold mb-2">
                        Edit {w.workshopname}
                      </h3>
                      <div className="space-y-2">
                        <input
                          name="workshopname"
                          value={form.workshopname || ""}
                          onChange={handleChange}
                          className="w-full border rounded px-2 py-1"
                        />
                        <textarea
                          name="shortdescription"
                          value={form.shortdescription || ""}
                          onChange={handleChange}
                          className="w-full border rounded px-2 py-1"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={saveEdit}
                            className="bg-primary text-white px-3 py-1 rounded"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="border px-3 py-1 rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={workshopId}
                      className="rounded-xl border p-4 bg-white/5 flex flex-col gap-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {w.workshopname}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {w.shortdescription}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(w)}
                            className="border px-3 py-1 rounded"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(w._id)}
                            className="border px-3 py-1 rounded"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
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
