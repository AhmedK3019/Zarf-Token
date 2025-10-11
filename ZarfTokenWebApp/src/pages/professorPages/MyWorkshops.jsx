import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuthUser } from "../../hooks/auth";

export default function MyWorkshops() {
  const { user } = useAuthUser();
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState("");

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
          {workshops.map((w) =>
            editing === w._id ? (
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
                key={w._id}
                className="rounded-xl border p-4 bg-white/5 flex justify-between items-start"
              >
                <div>
                  <h3 className="text-lg font-semibold">{w.workshopname}</h3>
                  <p className="text-sm text-gray-400">{w.shortdescription}</p>
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
            )
          )}
        </div>
      )}
    </div>
  );
}
