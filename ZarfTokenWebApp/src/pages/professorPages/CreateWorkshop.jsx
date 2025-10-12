import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuthUser } from "../../hooks/auth";

export default function CreateWorkshop() {
  const { user } = useAuthUser();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    workshopname: "",
    startdate: "",
    starttime: "",
    enddate: "",
    endtime: "",
    location: "GUC Cairo",
    shortdescription: "",
    fullagenda: "",
    facultyresponsibilty: user
      ? user.firstName
        ? `${user.firstName} ${user.lastName || ""}`
        : user.name || user.email
      : "",
    professorsparticipating: [],
    fundingsource: "GUC",
    extrarequiredfunding: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        ...form,
        extrarequiredfunding: Number(form.extrarequiredfunding),
      };
      await api.post("/workshop/createWorkshop", payload);
      setLoading(false);
      navigate("/dashboard/user/my-workshops");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to create workshop");
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Create Workshop</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl">
        <div>
          <label className="block text-sm font-medium">Workshop Title</label>
          <input
            name="workshopname"
            value={form.workshopname}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border px-3 py-2"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Start Date</label>
            <input
              type="date"
              name="startdate"
              value={form.startdate}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Start Time</label>
            <input
              type="time"
              name="starttime"
              value={form.starttime}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border px-3 py-2"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">End Date</label>
            <input
              type="date"
              name="enddate"
              value={form.enddate}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">End Time</label>
            <input
              type="time"
              name="endtime"
              value={form.endtime}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border px-3 py-2"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Location</label>
          <select
            name="location"
            value={form.location}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border px-3 py-2"
          >
            <option>GUC Cairo</option>
            <option>GUC Berlin</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Short Description</label>
          <textarea
            name="shortdescription"
            value={form.shortdescription}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border px-3 py-2"
            rows={3}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Full Agenda</label>
          <textarea
            name="fullagenda"
            value={form.fullagenda}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border px-3 py-2"
            rows={5}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Faculty Responsibility
          </label>
          <input
            name="facultyresponsibilty"
            value={form.facultyresponsibilty}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border px-3 py-2"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Funding Source</label>
            <select
              name="fundingsource"
              value={form.fundingsource}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border px-3 py-2"
            >
              <option>GUC</option>
              <option>External</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">
              Extra Funding Required (EGP)
            </label>
            <input
              type="number"
              name="extrarequiredfunding"
              value={form.extrarequiredfunding}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border px-3 py-2"
              min={0}
            />
          </div>
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}

        <div className="flex items-center gap-3">
          <button
            disabled={loading}
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-white"
          >
            {loading ? "Creating..." : "Create Workshop"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-md border px-3 py-2"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}