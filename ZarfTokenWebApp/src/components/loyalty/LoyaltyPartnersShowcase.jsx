import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Percent,
  RefreshCcw,
  Search,
  ShieldCheck,
  Tag,
} from "lucide-react";
import api from "../../services/api";
import CopyButton from "../CopyButton.jsx";
import { useAuthUser } from "../../hooks/auth";
import NotFound from "../../pages/NotFoundPage.jsx";

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "active", label: "Active" },
  { key: "rejected", label: "Rejected" },
  { key: "inactive", label: "Inactive" },
  { key: "cancelled", label: "Cancelled" },
];

const STATUS_STYLES = {
  active: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  approved: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  pending: {
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  rejected: {
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
  },
  inactive: {
    badge: "bg-gray-50 text-gray-600 border-gray-200",
    dot: "bg-gray-400",
  },
  cancelled: {
    badge: "bg-gray-50 text-gray-600 border-gray-200",
    dot: "bg-gray-400",
  },
};

const formatDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const SkeletonCard = () => (
  <div className="rounded-3xl border border-white/50 bg-white/40 p-6 shadow-xl shadow-[#4C3BCF]/5 animate-pulse">
    <div className="h-5 w-24 rounded-full bg-[#D8D3FF]/70" />
    <div className="mt-4 h-8 w-3/5 rounded-full bg-[#E7E4FF]" />
    <div className="mt-6 space-y-3">
      <div className="h-4 w-full rounded-full bg-[#ECEBFF]" />
      <div className="h-4 w-11/12 rounded-full bg-[#ECEBFF]" />
      <div className="h-4 w-4/5 rounded-full bg-[#ECEBFF]" />
    </div>
    <div className="mt-6 flex gap-3">
      <div className="h-10 flex-1 rounded-2xl bg-[#E7E4FF]" />
      <div className="h-10 w-24 rounded-2xl bg-[#D8D3FF]" />
    </div>
  </div>
);

const normalizeRole = (value = "") =>
  value.trim().toLowerCase().replace(/\s+/g, " ");

const ALLOWED_ROLES = new Set([
  "student",
  "staff",
  "ta",
  "professor",
  "event office",
  "events office",
  "eventsoffice",
  "admin",
]);

const StatusChip = ({ status }) => {
  const key = String(status || "active").toLowerCase();
  const styles = STATUS_STYLES[key] || STATUS_STYLES.active;
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide shadow-sm ${styles.badge}`}
    >
      <span className={`h-2 w-2 rounded-full ${styles.dot}`} />
      {key.charAt(0).toUpperCase() + key.slice(1)}
    </span>
  );
};

export default function LoyaltyPartnersShowcase({
  title = "GUC Loyalty Program Partners",
  description = "Explore every active vendor in the GUC loyalty program.",
} = {}) {
  const { user } = useAuthUser();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expanded, setExpanded] = useState(() => new Set());
  const hasToken =
    typeof window !== "undefined"
      ? Boolean(localStorage.getItem("token"))
      : false;
  const normalizedRole = normalizeRole(user?.role || "");
  const canView = normalizedRole ? ALLOWED_ROLES.has(normalizedRole) : false;
  const hasActiveFilters = search.trim().length > 0 || statusFilter !== "all";

  const fetchPartners = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/loyalty");
      const rows = Array.isArray(res.data) ? res.data : [];
      // Build partner objects synchronously; logo served inline by backend.
      // Ensure we use the API base (including `/api`) so route `/api/uploads/fileId/:id` resolves.
      const apiBase = (
        (api && api.defaults && api.defaults.baseURL) ||
        import.meta.env.VITE_API_URL ||
        "http://localhost:3000/api"
      ).replace(/\/$/, "");
      const normalized = rows
        .map((row) => {
          const vendor = row?.vendorId || {};
          const vendorLabel =
            vendor.companyname ||
            vendor.name ||
            vendor.legalname ||
            vendor.email ||
            "Partner";
          const referenceDate =
            new Date(
              row.reviewedAt || row.updatedAt || row.createdAt
            ).getTime() || null;
          const logoFileId = vendor.logo;
          const logoUrl = logoFileId
            ? `${apiBase}/uploads/fileId/${logoFileId}`
            : "";
          return {
            id: row._id,
            vendorLabel,
            vendorEmail: vendor.email || "",
            vendorStatus: vendor.status || row.status || "active",
            logo: logoUrl,
            promoCode: row.promoCode,
            discountRate: Number(row.discountRate) || 0,
            termsAndConditions: row.termsAndConditions || "",
            reviewedAt: row.reviewedAt || null,
            referenceDate,
            createdAt: row.createdAt || null,
          };
        })
        .filter((partner) => partner.vendorStatus !== "Blocked")
        .sort((a, b) => (b.referenceDate || 0) - (a.referenceDate || 0));
      setPartners(normalized);
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Unable to load loyalty partners.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
  };

  const searchTerm = search.trim().toLowerCase();

  const filteredPartners = useMemo(() => {
    return partners.filter((partner) => {
      const statusKey = String(partner.vendorStatus || "active").toLowerCase();
      const statusMatch = statusFilter === "all" || statusKey === statusFilter;
      if (!statusMatch) return false;
      if (!searchTerm) return true;
      return (
        partner.vendorLabel.toLowerCase().includes(searchTerm) ||
        partner.promoCode?.toLowerCase().includes(searchTerm)
      );
    });
  }, [partners, searchTerm, statusFilter]);

  const statusCounts = useMemo(() => {
    return partners.reduce(
      (acc, partner) => {
        const key = String(partner.vendorStatus || "active").toLowerCase();
        acc[key] = (acc[key] || 0) + 1;
        acc.total += 1;
        return acc;
      },
      {
        total: 0,
        pending: 0,
        approved: 0,
        active: 0,
        rejected: 0,
        inactive: 0,
        cancelled: 0,
      }
    );
  }, [partners]);

  if (!user && !hasToken) {
    return <NotFound />;
  }

  if (user && !canView) {
    return <NotFound />;
  }

  const toggleExpanded = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="w-full text-[#1F1B3B]">
      <section className="space-y-3">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total"
            value={statusCounts.total}
            accent="text-[#001845]"
          />
          <StatCard
            label="Pending"
            value={statusCounts.pending}
            accent="text-amber-700"
          />
          <StatCard
            label="Approved"
            value={statusCounts.approved || statusCounts.active}
            accent="text-emerald-700"
          />
          <StatCard
            label="Rejected"
            value={statusCounts.rejected}
            accent="text-rose-700"
          />
        </div>

        <div className="rounded-xl border border-gray-100 bg-white/80 p-3 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <label className="relative flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by vendor or promo code"
                    className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-xs font-semibold text-gray-900 shadow-sm transition focus:border-[#4C3BCF] focus:outline-none focus:ring-1 focus:ring-[#d7d1ff]"
                  />
                </div>
              </label>
              <label className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-700">
                  Status:
                </span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-900 shadow-sm transition focus:border-[#4C3BCF] focus:outline-none focus:ring-1 focus:ring-[#d7d1ff]"
                >
                  {STATUS_FILTERS.map((filter) => (
                    <option key={filter.key} value={filter.key}>
                      {filter.label}
                      {filter.key !== "all" && statusCounts[filter.key]
                        ? ` (${statusCounts[filter.key]})`
                        : ""}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {hasActiveFilters ? (
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
                >
                  <RefreshCcw className="h-3 w-3 text-gray-500" />
                  Clear
                </button>
              ) : null}
              <button
                onClick={fetchPartners}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#4C3BCF] bg-[#4C3BCF] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#3728a6] hover:border-[#3728a6]"
              >
                <RefreshCcw className="h-3 w-3" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {loading && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, idx) => (
                <SkeletonCard key={idx} />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center gap-4 rounded-3xl border border-rose-200 bg-rose-50 px-6 py-10 text-center text-rose-600">
              <p className="text-lg font-semibold">{error}</p>
              <button
                type="button"
                onClick={fetchPartners}
                className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-300 transition hover:bg-rose-700"
              >
                <RefreshCcw className="h-4 w-4" />
                Try again
              </button>
            </div>
          )}

          {!loading && !error && filteredPartners.length === 0 && (
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-[#D8D3FF] bg-white px-6 py-12 text-center">
              <h3 className="text-xl font-semibold text-[#251E53]">
                No partners match your filters
              </h3>
              <p className="text-sm text-[#4B4470]">
                Try resetting the filters or searching for another partner or
                promo code.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
                className="inline-flex items-center gap-2 rounded-full border border-[#4C3BCF] px-4 py-2 text-sm font-semibold text-[#4C3BCF] transition hover:bg-[#4C3BCF] hover:text-white"
              >
                Reset filters
              </button>
            </div>
          )}

          {!loading && !error && filteredPartners.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2">
              {filteredPartners.map((partner) => {
                const isExpanded = expanded.has(partner.id);
                const readableDate = formatDate(
                  partner.reviewedAt || partner.referenceDate
                );
                const logoSrc = partner.logo
                  ? partner.logo
                  : "/unknownicon.png";
                const statusKey = partner.vendorStatus || "Active";
                return (
                  <article
                    key={partner.id}
                    className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white/95 p-6 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#4C3BCF] via-[#E11D48] to-[#001845]" />
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-4">
                        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-[#E4E0FF] bg-white p-1">
                          <img
                            src={logoSrc}
                            alt={`${partner.vendorLabel} logo`}
                            className="max-h-full max-w-full object-contain"
                            loading="lazy"
                            onError={(e) => {
                              if (
                                e.currentTarget.src.endsWith("/unknownicon.png")
                              )
                                return;
                              e.currentTarget.src = "/unknownicon.png";
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Loyalty partner
                          </p>
                          <h3 className="text-2xl font-bold text-[#001845]">
                            {partner.vendorLabel}
                          </h3>
                          {partner.vendorEmail && (
                            <p className="text-sm text-gray-500">
                              {partner.vendorEmail}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                            <span className="inline-flex items-center gap-2 rounded-full bg-[#4C3BCF]/10 px-3 py-1 text-[#2c1f74]">
                              <Tag size={14} className="text-[#4C3BCF]" />
                              Promo {partner.promoCode}
                            </span>
                            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                              <Percent size={14} className="text-emerald-600" />
                              {partner.discountRate}% OFF
                            </span>
                          </div>
                          {readableDate && (
                            <p className="text-xs text-gray-500">
                              Updated {readableDate}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 text-right">
                        <StatusChip status={statusKey} />
                        <CopyButton
                          value={partner.promoCode}
                          className="mt-1"
                          ariaLabel={`Copy promo code ${partner.promoCode}`}
                        />
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 text-sm text-gray-700 sm:grid-cols-3">
                      <div className="flex items-center gap-2 rounded-2xl bg-gray-50 px-3 py-2 font-semibold text-gray-700">
                        <Calendar size={16} className="text-[#4C3BCF]" />
                        {readableDate
                          ? `Reviewed ${readableDate}`
                          : "Awaiting review"}
                      </div>
                      <div className="flex items-center gap-2 rounded-2xl bg-gray-50 px-3 py-2 font-semibold text-gray-700">
                        <Percent size={16} className="text-[#4C3BCF]" />
                        Discount {partner.discountRate}%
                      </div>
                      <div className="flex items-center gap-2 rounded-2xl bg-gray-50 px-3 py-2 font-semibold text-gray-700">
                        <ShieldCheck size={16} className="text-[#4C3BCF]" />
                        Status {String(statusKey).toUpperCase()}
                      </div>
                    </div>

                    {partner.termsAndConditions && (
                      <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
                        <div className="flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          <span>Terms &amp; conditions</span>
                          {partner.termsAndConditions?.length > 180 && (
                            <button
                              type="button"
                              onClick={() => toggleExpanded(partner.id)}
                              className="text-[#4C3BCF] hover:text-[#3728a6]"
                            >
                              {isExpanded ? "Show less" : "Read more"}
                            </button>
                          )}
                        </div>
                        <p
                          className={`mt-2 text-sm leading-relaxed text-gray-700 ${
                            isExpanded ? "" : "line-clamp-3"
                          }`}
                        >
                          {partner.termsAndConditions}
                        </p>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

const StatCard = ({ label, value, accent }) => (
  <div className="rounded-lg border border-gray-100 bg-white/80 p-2.5 shadow-sm">
    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
      {label}
    </p>
    <p className={`text-lg font-bold ${accent || "text-[#001845]"}`}>{value}</p>
  </div>
);
