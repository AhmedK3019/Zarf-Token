import React, { useEffect, useMemo, useState } from "react";
import { RefreshCcw } from "lucide-react";
import api from "../../services/api";

const DISCOUNT_FILTERS = [
  { key: "all", label: "All discounts", hint: "Full partner list" },
  { key: "starter", label: "Up to 10%", hint: "Quick treats", match: (rate) => rate <= 10 },
  {
    key: "core",
    label: "11% - 20%",
    hint: "Everyday savings",
    match: (rate) => rate >= 11 && rate <= 20,
  },
  {
    key: "premium",
    label: "21% - 35%",
    hint: "Premium perks",
    match: (rate) => rate >= 21 && rate <= 35,
  },
  { key: "elite", label: "36%+", hint: "Hero boosts", match: (rate) => rate >= 36 },
];

const SORTING = {
  recent: {
    label: "Recently updated",
    sorter: (a, b) => (b.referenceDate || 0) - (a.referenceDate || 0),
  },
  discount: {
    label: "Highest discount",
    sorter: (a, b) => b.discountRate - a.discountRate,
  },
  name: {
    label: "A → Z",
    sorter: (a, b) => a.vendorLabel.localeCompare(b.vendorLabel),
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

export default function LoyaltyPartnersShowcase({
  title = "GUC Loyalty Program Partners",
  eyebrow = "Verified perks · On-campus favorites",
  description = "Explore every active vendor in the GUC loyalty program. Each partner is reviewed by Events Office and Admin teams so that Students, Staff, TAs, Professors, Events Office, and Admins unlock trusted discounts.",
  audienceLabel = "Students · Staff · TAs · Professors · Events Office · Admin",
} = {}) {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [discountFilter, setDiscountFilter] = useState("all");
  const [sortKey, setSortKey] = useState("recent");
  const [expanded, setExpanded] = useState(() => new Set());
  const [copiedCode, setCopiedCode] = useState(null);
  const [lastLoadedAt, setLastLoadedAt] = useState(null);

  const fetchPartners = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/loyalty", { params: { status: "approved" } });
      const rows = Array.isArray(res.data) ? res.data : [];
      const normalized = rows
        .filter((row) => String(row?.status || "").toLowerCase() === "approved")
        .map((row) => {
          const vendor = row?.vendorId || {};
          const vendorLabel =
            vendor.companyname || vendor.name || vendor.legalname || vendor.email || "Partner";
          const referenceDate =
            new Date(row.reviewedAt || row.updatedAt || row.createdAt).getTime() || null;
          return {
            id: row._id,
            vendorLabel,
            vendorEmail: vendor.email || "",
            vendorStatus: vendor.status || "Active",
            logo: vendor.logo,
            promoCode: row.promoCode,
            discountRate: Number(row.discountRate) || 0,
            termsAndConditions: row.termsAndConditions || "",
            reviewedAt: row.reviewedAt,
            referenceDate,
          };
        })
        .filter((partner) => partner.vendorStatus !== "Blocked");
      setPartners(normalized);
      setLastLoadedAt(Date.now());
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

  useEffect(() => {
    if (!copiedCode) return undefined;
    const timer = setTimeout(() => setCopiedCode(null), 2500);
    return () => clearTimeout(timer);
  }, [copiedCode]);

  const searchTerm = search.trim().toLowerCase();

  const filteredPartners = useMemo(() => {
    const range = DISCOUNT_FILTERS.find((filter) => filter.key === discountFilter);
    return partners
      .filter((partner) => {
        if (!searchTerm) return true;
        return (
          partner.vendorLabel.toLowerCase().includes(searchTerm) ||
          partner.promoCode?.toLowerCase().includes(searchTerm)
        );
      })
      .filter((partner) => {
        if (!range || range.key === "all" || !range.match) return true;
        return range.match(partner.discountRate);
      })
      .sort(SORTING[sortKey]?.sorter || SORTING.recent.sorter);
  }, [partners, searchTerm, discountFilter, sortKey]);

  const stats = useMemo(() => {
    if (!partners.length) {
      return {
        total: 0,
        average: 0,
        top: 0,
        newThisMonth: 0,
      };
    }
    const total = partners.length;
    const average = partners.reduce((sum, partner) => sum + partner.discountRate, 0) / total;
    const top = partners.reduce(
      (max, partner) => (partner.discountRate > max ? partner.discountRate : max),
      0
    );
    const now = new Date();
    const newThisMonth = partners.filter((partner) => {
      if (!partner.referenceDate) return false;
      const date = new Date(partner.referenceDate);
      return (
        date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
      );
    }).length;
    return { total, average, top, newThisMonth };
  }, [partners]);

  const handleCopyPromo = async (code) => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
    } catch (err) {
      console.error("Failed to copy promo code:", err);
      if (typeof window !== "undefined" && typeof window.alert === "function") {
        window.alert(
          err?.message || "Unable to copy promo code automatically. Please copy it manually."
        );
      }
    }
  };

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
    <div className="w-full bg-gradient-to-b from-[#FDFBFF] via-white to-[#F2F0FF] text-[#1F1B3B]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-[32px] border border-white/60 bg-gradient-to-br from-white/90 via-white to-[#F4F1FF] p-8 shadow-2xl shadow-[#4C3BCF]/10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#978FE0]">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-bold text-[#251E53] sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-3xl text-base text-[#4B4470] sm:text-lg">
            {description}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm font-medium text-[#4B4470]">
            <span className="inline-flex rounded-full bg-[#F2EDFF] px-4 py-2 text-[#4C3BCF]">
              Verified for {audienceLabel}
            </span>
            {lastLoadedAt && (
              <span className="inline-flex rounded-full border border-[#E4E0FF] px-4 py-2 text-[#6B64A8]">
                Updated {formatDate(lastLoadedAt)}
              </span>
            )}
            <button
              onClick={fetchPartners}
              className="inline-flex items-center gap-2 rounded-full border border-[#D4CEFF] px-4 py-2 text-[#4C3BCF] transition hover:bg-[#4C3BCF] hover:text-white"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <StatBadge label="Active partners" value={stats.total} accent="text-[#4C3BCF]" />
            <StatBadge
              label="Average discount"
              value={stats.average ? `${stats.average.toFixed(1)}%` : "—"}
              accent="text-[#E85CFF]"
            />
            <StatBadge
              label="Top savings"
              value={stats.top ? `${stats.top}%` : "—"}
              accent="text-[#1CB5E0]"
            />
            <StatBadge
              label="New this month"
              value={stats.newThisMonth}
              accent="text-[#FF8A65]"
            />
          </div>
        </section>

        <section className="space-y-5 rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-xl shadow-[#4C3BCF]/10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-wrap gap-3">
              <div className="flex-1 min-w-[220px]">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by vendor or promo code"
                  className="w-full rounded-2xl border border-[#E4E0FF] bg-white py-3 px-4 text-sm text-[#312A68] placeholder:text-[#B3AEDE] focus:border-[#736CED] focus:outline-none"
                />
              </div>
              <div className="rounded-2xl border border-dashed border-[#E4E0FF] px-4 py-3 text-sm text-[#4B4470]">
                {filteredPartners.length} partners visible
              </div>
            </div>
            <div className="flex items-center gap-2">
              {Object.entries(SORTING).map(([key, option]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSortKey(key)}
                  className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                    sortKey === key
                      ? "bg-[#4C3BCF] text-white shadow-lg shadow-[#4C3BCF]/30"
                      : "bg-[#F4F1FF] text-[#4C3BCF] hover:bg-[#E4DEFF]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {DISCOUNT_FILTERS.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setDiscountFilter(filter.key)}
                className={`flex flex-col rounded-2xl border px-4 py-3 text-left text-sm transition ${
                  discountFilter === filter.key
                    ? "border-[#4C3BCF] bg-[#F6F4FF] text-[#251E53]"
                    : "border-[#E4E0FF] bg-white text-[#514A7E] hover:border-[#D4CEFF]"
                }`}
              >
                <span className="font-semibold">{filter.label}</span>
                <span className="text-xs text-[#867FB8]">{filter.hint}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-6">
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
                Try resetting the discount filter or searching for another partner or promo code.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setDiscountFilter("all");
                  setSortKey("recent");
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
                const readableDate = formatDate(partner.reviewedAt || partner.referenceDate);
                return (
                  <article
                    key={partner.id}
                    className="flex h-full flex-col rounded-[30px] border border-white/70 bg-white/95 p-6 shadow-xl shadow-[#4C3BCF]/10"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#B0AADF]">
                          Approved partner
                        </p>
                        <h3 className="mt-1 text-2xl font-bold text-[#251E53]">
                          {partner.vendorLabel}
                        </h3>
                        {partner.vendorEmail && (
                          <p className="text-sm text-[#6B64A8]">{partner.vendorEmail}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2 text-right">
                        <span className="inline-flex rounded-full bg-[#F2EDFF] px-3 py-1 text-xs font-semibold text-[#4C3BCF]">
                          {partner.discountRate}% OFF
                        </span>
                        <span className="text-xs text-[#8F88BF]">
                          {readableDate ? `Updated ${readableDate}` : "Awaiting review date"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <div className="inline-flex rounded-2xl border border-[#E4E0FF] bg-[#F7F5FF] px-4 py-2 text-sm font-semibold text-[#4C3BCF]">
                        Promo: {partner.promoCode}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyPromo(partner.promoCode)}
                        className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                          copiedCode === partner.promoCode
                            ? "bg-emerald-100 text-emerald-700"
                            : "border border-[#D8D3FF] text-[#4C3BCF] hover:bg-[#EFEAFF]"
                        }`}
                      >
                        {copiedCode === partner.promoCode ? "Copied" : "Copy code"}
                      </button>
                    </div>

                    <div className="mt-5 rounded-2xl bg-[#F7F5FF] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#8F88BF]">
                        Terms &amp; conditions
                      </p>
                      <p
                        className={`mt-2 text-sm text-[#312A68] ${
                          isExpanded ? "" : "line-clamp-3"
                        }`}
                      >
                        {partner.termsAndConditions}
                      </p>
                      {partner.termsAndConditions?.length > 180 && (
                        <button
                          type="button"
                          onClick={() => toggleExpanded(partner.id)}
                          className="mt-3 inline-flex text-sm font-semibold text-[#4C3BCF] transition hover:text-[#2E1CFF]"
                        >
                          {isExpanded ? "Show less" : "Read full terms"}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

const StatBadge = ({ label, value, accent }) => (
  <div className="rounded-2xl border border-white/60 bg-white/80 p-4">
    <p className="text-xs font-semibold uppercase tracking-wide text-[#A199D8]">
      {label}
    </p>
    <p className={`text-2xl font-bold ${accent || "text-[#251E53]"}`}>{value}</p>
  </div>
);
