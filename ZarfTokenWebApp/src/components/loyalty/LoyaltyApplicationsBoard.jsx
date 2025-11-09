import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  Loader2,
  Percent,
  RefreshCcw,
  Search,
  Tag,
} from "lucide-react";
import api from "../../services/api";

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "cancelled", label: "Cancelled" },
];

const tone = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-50 text-rose-700 border-rose-200",
  cancelled: "bg-gray-50 text-gray-600 border-gray-200",
};

const StatusChip = ({ status }) => {
  const key = String(status || "pending").toLowerCase();
  const classes = tone[key] || tone.pending;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${classes}`}
    >
      {key.charAt(0).toUpperCase() + key.slice(1)}
    </span>
  );
};

const formatDateTime = (date) => {
  if (!date) return "-";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const normalizeText = (value = "") => value.toLowerCase();

export default function LoyaltyApplicationsBoard({
  title = "Loyalty Applications",
  subtitle = "Monitor every submission and review status in one place.",
}) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/loyalty");
        const rows = Array.isArray(res.data) ? res.data : [];
        rows.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setApplications(rows);
      } catch (err) {
        const message =
          err?.response?.data?.error ||
          err?.message ||
          "Unable to load loyalty applications";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refreshKey]);

  const filteredApps = useMemo(() => {
    const query = normalizeText(search);
    return applications.filter((app) => {
      const statusMatch =
        statusFilter === "all" ||
        String(app.status).toLowerCase() === statusFilter;
      if (!statusMatch) return false;
      if (!query) return true;
      const vendorName =
        app.vendorId?.companyname ||
        app.vendorId?.name ||
        app.vendorId?.email ||
        "";
      const haystack = `${vendorName} ${app.promoCode || ""}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [applications, statusFilter, search]);

  const statusCounts = useMemo(() => {
    return applications.reduce(
      (acc, app) => {
        const key = String(app.status).toLowerCase();
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      { total: applications.length }
    );
  }, [applications]);

  return (
    <section className="space-y-5 rounded-3xl border border-gray-100 bg-white/80 p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-gray-500">
            Loyalty Program
          </p>
          <h1 className="text-2xl font-bold text-[#18122B]">{title}</h1>
          <p className="text-sm text-gray-600">{subtitle}</p>
        </div>
        <button
          onClick={() => setRefreshKey((key) => key + 1)}
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
        >
          <RefreshCcw size={16} />
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search by vendor or promo code"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white px-10 py-2 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setStatusFilter(filter.key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                statusFilter === filter.key
                  ? "bg-[#4C3BCF] text-white shadow"
                  : "border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {filter.label}
              {filter.key !== "all" && statusCounts[filter.key]
                ? ` (${statusCounts[filter.key]})`
                : ""}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading applications...
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
          No applications match the current filters.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => {
            const vendorName =
              app.vendorId?.companyname ||
              app.vendorId?.name ||
              app.vendorId?.email ||
              "Unknown vendor";
            const snippet = (app.termsAndConditions || "").slice(0, 180);
            return (
              <div
                key={app._id}
                className="rounded-2xl border border-gray-100 p-5 shadow-sm transition hover:border-[#736CED]/50"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-bold text-[#18122B]">
                      {app.promoCode}
                    </p>
                    <p className="text-sm text-gray-500">{vendorName}</p>
                  </div>
                  <StatusChip status={app.status} />
                </div>
                <div className="mt-4 grid gap-3 text-sm text-gray-600 sm:grid-cols-3">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" />
                    <span>Submitted {formatDateTime(app.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Percent size={14} className="text-gray-400" />
                    <span>{app.discountRate}% discount</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag size={14} className="text-gray-400" />
                    <span>
                      Terms length {(app.termsAndConditions || "").length} chars
                    </span>
                  </div>
                </div>
                {snippet && (
                  <p className="mt-3 text-sm text-gray-500">
                    {snippet}
                    {app.termsAndConditions.length > snippet.length ? "..." : ""}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
