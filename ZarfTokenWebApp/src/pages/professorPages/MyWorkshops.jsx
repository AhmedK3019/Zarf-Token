import React, { useEffect, useState, useCallback, useRef } from "react";
import api from "../../services/api";
import { useAuthUser } from "../../hooks/auth";

export default function MyWorkshops() {
  const { user } = useAuthUser();
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const [commentsState, setCommentsState] = useState({});
  const fetchedCommentsRef = useRef(new Set());

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

  const fetchCommentsForWorkshop = useCallback(async (workshopId) => {
    if (!workshopId) return;

    setCommentsState((prev) => ({
      ...prev,
      [workshopId]: {
        data: prev[workshopId]?.data ?? [],
        loading: true,
        error: null,
      },
    }));

    try {
      const res = await api.get(`/workshops/${workshopId}/comments`);
      const comments = Array.isArray(res.data?.comments)
        ? res.data.comments
        : [];

      setCommentsState((prev) => ({
        ...prev,
        [workshopId]: {
          data: comments,
          loading: false,
          error: null,
        },
      }));
    } catch (err) {
      console.error("Failed to fetch comments:", err);
      setCommentsState((prev) => ({
        ...prev,
        [workshopId]: {
          data: [],
          loading: false,
          error: "Failed to load reviewer comments.",
        },
      }));
    }
  }, []);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/workshop/getAllWorkshops");
        const items = res.data.workshops || res.data || [];

        const myName = user
          ? user.firstName
            ? `${user.firstName} ${user.lastName || ""}`
            : user.name || user.email
          : "";
        const myId = user?._id || user?.id;

        const filtered = items.filter((w) => {
          if (
            w.facultyresponsibilty &&
            myName &&
            String(w.facultyresponsibilty).includes(myName)
          )
            return true;
          if (w.professorsparticipating && myId) {
            return w.professorsparticipating.some(
              (pid) => String(pid) === String(myId)
            );
          }
          return false;
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

  useEffect(() => {
    workshops.forEach((workshop) => {
      const id = workshop?._id || workshop?.id;
      if (!id || fetchedCommentsRef.current.has(id)) return;
      fetchedCommentsRef.current.add(id);
      fetchCommentsForWorkshop(id);
    });
  }, [workshops, fetchCommentsForWorkshop]);

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
      await api.put(`/workshop/updateWorkshop/${editing}`, {
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
      await api.delete(`/workshop/deleteWorkshop/${id}`);
      setWorkshops((prev) => prev.filter((w) => w._id !== id));
    } catch (err) {
      alert("Failed to delete");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">My Workshops</h2>

      {workshops.length === 0 ? (
        <div className="text-gray-600">
          You have not created any workshops yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {workshops.map((w) => {
            const workshopId = w._id || w.id;
            const commentInfo = commentsState[workshopId];

            return editing === w._id ? (
              // edit mode
              <div key={w._id} className="rounded-xl border p-4 bg-white/5">
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
                    <h3 className="text-lg font-semibold">{w.workshopname}</h3>
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
                <div className="w-full">
                  <div className="rounded-2xl border border-slate-200/70 bg-white/60 backdrop-blur-sm p-4 shadow-sm">
                    <h4 className="text-base font-semibold text-slate-800 mb-3">
                      Reviewer Comments
                    </h4>
                    {commentInfo?.loading ? (
                      <p className="text-sm text-slate-500">Loading comments...</p>
                    ) : commentInfo?.error ? (
                      <p className="text-sm text-rose-600">{commentInfo.error}</p>
                    ) : commentInfo?.data?.length ? (
                      <ul className="space-y-3">
                        {commentInfo.data.map((comment, index) => (
                          <li
                            key={`${workshopId}-comment-${index}`}
                            className="rounded-xl bg-white border border-slate-200 px-4 py-3 shadow-[0_2px_6px_rgba(15,23,42,0.05)]"
                          >
                            <p className="text-sm text-slate-700 leading-relaxed">
                              {comment.message}
                            </p>
                            <div className="mt-2 text-xs text-slate-500 flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-[#736CED]">
                                {comment.author || "Events Office"}
                              </span>
                              <span aria-hidden="true" className="text-slate-300">
                                |
                              </span>
                              <span>{formatCommentDate(comment.date)}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-500">
                        No reviewer comments yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
