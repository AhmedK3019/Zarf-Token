import { useState } from "react";
import api from "../../services/api";

export default function AddAdminOrEventsOffice() {
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    role: "Admin",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const validate = () => {
    if (!form.firstname || form.firstname.length < 3)
      return "First name must be at least 3 characters";
    if (!form.lastname || form.lastname.length < 3)
      return "Last name must be at least 3 characters";
    if (!form.email) return "Email is required";
    if (!form.password || form.password.length < 6)
      return "Password must be at least 6 characters";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setLoading(true);
    try {
      const payload = {
        firstname: form.firstname,
        lastname: form.lastname,
        email: form.email,
        password: form.password,
        role: form.role,
      };

      let res;
      if (form.role === "Admin") {
        res = await api.post("/admin/createAdmin", payload);
      } else {
        // role contains display value like "Event office" or similar
        res = await api.post("/eventsOffice/createEventOffice", payload);
      }

      setMessage("Account created successfully.");
      setForm({
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        role: form.role,
      });
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to create account"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">
        Create Admin / Events Office
      </h2>

      {message && (
        <div className="mb-3 p-2 bg-green-100 text-green-800 rounded">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-3 p-2 bg-red-100 text-red-800 rounded">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="block text-sm font-medium">First name</label>
          <input
            name="firstname"
            value={form.firstname}
            onChange={handleChange}
            className="mt-1 block w-full border rounded p-2"
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium">Last name</label>
          <input
            name="lastname"
            value={form.lastname}
            onChange={handleChange}
            className="mt-1 block w-full border rounded p-2"
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium">
            Email (must be GUC email)
          </label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            type="email"
            className="mt-1 block w-full border rounded p-2"
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium">Password</label>
          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            type="password"
            className="mt-1 block w-full border rounded p-2"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">Role</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="mt-1 block w-full border rounded p-2"
          >
            <option>Admin</option>
            <option>Event office</option>
          </select>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </div>
      </form>
    </div>
  );
}
