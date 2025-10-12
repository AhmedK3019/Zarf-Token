import React, { useEffect, useState } from "react";
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
    facultyresponsibilty: "IET",
    professorsparticipating: [],
    fundingsource: "GUC",
    extrarequiredfunding: 0,
    capacity: 20,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Professors fetch state
  const [professors, setProfessors] = useState([]);
  const [profLoading, setProfLoading] = useState(false);
  const [profError, setProfError] = useState("");
  const [profSearch, setProfSearch] = useState("");

  useEffect(() => {
    const loadProfs = async () => {
      setProfLoading(true);
      setProfError("");
      try {
        const res = await api.get("/user/getProfessors");
        // Controller returns an array directly
        const data = Array.isArray(res?.data) ? res.data : [];
        setProfessors(data);
      } catch (e) {
        setProfError(
          e?.response?.data?.message || "Failed to load professors list"
        );
      } finally {
        setProfLoading(false);
      }
    };
    loadProfs();
  }, []);

  const toggleProfessor = (id) => {
    setForm((prev) => {
      const set = new Set(prev.professorsparticipating);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      return { ...prev, professorsparticipating: Array.from(set) };
    });
  };

  const filteredProfessors = professors.filter((p) => {
    const name = `${p.firstname || ""} ${p.lastname || ""}`
      .trim()
      .toLowerCase();
    return name.includes(profSearch.trim().toLowerCase());
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Ensure at least one professor selected (backend also validates)
      if (
        !form.professorsparticipating ||
        form.professorsparticipating.length === 0
      ) {
        setLoading(false);
        setError("Please select at least one participating professor.");
        return;
      }
      const payload = {
        ...form,
        extrarequiredfunding: Number(form.extrarequiredfunding),
        capacity: Number(form.capacity),
      };
      await api.post("/workshops/createWorkshop", payload);
      setLoading(false);
      navigate("/dashboard/user/my-workshops");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to create workshop");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full overflow-hidden bg-[#D5CFE1] text-[#1F1B3B]">
      <div className="relative flex min-h-screen w-full flex-col items-center">
        <main className="relative z-10 flex w-full flex-1 flex-col items-center px-6 py-8">
          <div className="w-full max-w-6xl">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-[#736CED] sm:text-4xl mb-2">
                Create Workshop
              </h2>
              {error ? (
                <p className="max-w-2xl mx-auto text-[#9F2D20] bg-[#FEE2E2] border border-[#FCA5A5] rounded-lg px-4 py-2">
                  {error}
                </p>
              ) : (
                <p className="text-[#312A68] opacity-80">
                  Here you can create a workshop.
                </p>
              )}
            </div>
            <form
              onSubmit={handleSubmit}
              className="space-y-4 max-w-3xl bg-white/70 rounded-xl p-6 shadow mx-auto"
            >
              <div>
                <label className="block text-sm font-medium">
                  Workshop Title
                </label>
                <input
                  name="workshopname"
                  value={form.workshopname}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-[#736CED] px-3 py-2 bg-white/70"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startdate"
                    value={form.startdate}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-[#736CED] px-3 py-2 bg-white/70"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Start Time
                  </label>
                  <input
                    type="time"
                    name="starttime"
                    value={form.starttime}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-[#736CED] px-3 py-2 bg-white/70"
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
                    className="mt-1 block w-full rounded-md border border-[#736CED] px-3 py-2 bg-white/70"
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
                    className="mt-1 block w-full rounded-md border border-[#736CED] px-3 py-2 bg-white/70"
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
                  className="mt-1 block w-full rounded-md border border-[#736CED] px-3 py-2 bg-white/70"
                >
                  <option>GUC Cairo</option>
                  <option>GUC Berlin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Short Description
                </label>
                <textarea
                  name="shortdescription"
                  value={form.shortdescription}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-[#736CED] px-3 py-2 bg-white/70"
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
                  className="mt-1 block w-full rounded-md border border-[#736CED] px-3 py-2 bg-white/70"
                  rows={5}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Faculty Responsible
                </label>
                <select
                  name="facultyresponsibilty"
                  value={form.facultyresponsibilty}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-[#736CED] px-3 py-2 bg-white/70"
                  required
                >
                  {[
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
                  ].map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Select Participating Professors
                </label>
                <div className="mb-2">
                  <input
                    type="text"
                    placeholder="Search professors by name..."
                    value={profSearch}
                    onChange={(e) => setProfSearch(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-[#736CED] px-3 py-2 bg-white/70"
                  />
                </div>
                {profLoading && (
                  <div className="text-sm text-[#312A68]">
                    Loading professors…
                  </div>
                )}
                {profError && (
                  <div className="text-sm text-red-600">{profError}</div>
                )}
                {!profLoading && !profError && (
                  <div className="max-h-56 overflow-auto rounded-md border border-[#736CED]/50 bg-white/60 px-3 py-2">
                    {filteredProfessors.length === 0 ? (
                      <div className="text-sm text-[#312A68]/70">
                        No matches
                      </div>
                    ) : (
                      filteredProfessors.map((p) => {
                        const id = p._id || p.id;
                        const checked =
                          form.professorsparticipating.includes(id);
                        const label = `${p.firstname || ""} ${
                          p.lastname || ""
                        }`.trim();
                        return (
                          <label
                            key={id}
                            className="flex items-center gap-2 py-1"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleProfessor(id)}
                              className="accent-[#736CED]"
                            />
                            <span className="text-sm text-[#1F1B3B]">
                              {label || id}
                            </span>
                          </label>
                        );
                      })
                    )}
                  </div>
                )}
                <p className="text-xs text-[#312A68]/70 mt-1">
                  Select at least one professor.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">
                    Funding Source
                  </label>
                  <select
                    name="fundingsource"
                    value={form.fundingsource}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-[#736CED] px-3 py-2 bg-white/70"
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
                    className="mt-1 block w-full rounded-md border border-[#736CED] px-3 py-2 bg-white/70"
                    min={0}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Capacity</label>
                  <input
                    type="number"
                    name="capacity"
                    value={form.capacity}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-[#736CED] px-3 py-2 bg-white/70"
                    min={1}
                    required
                  />
                </div>
              </div>

              {error && <div className="text-sm text-red-600">{error}</div>}

              <div className="flex items-center gap-3">
                <button
                  disabled={loading}
                  type="submit"
                  className="rounded-md bg-[#736CED] hover:bg-[#5A4BBA] px-4 py-2 text-white shadow"
                >
                  {loading ? "Creating..." : "Create Workshop"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="rounded-md border border-[#736CED] px-3 py-2 bg-white/70"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
