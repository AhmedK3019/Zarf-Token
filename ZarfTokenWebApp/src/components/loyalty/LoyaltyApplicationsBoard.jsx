import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  FileText,
  Loader2,
  MessageSquareWarning,
  Percent,
  RefreshCcw,
  Search,
  Tag,
  XCircle,
} from "lucide-react";
import api from "../../services/api";
import { useAuthUser } from "../../context/UserContext";

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "cancelled", label: "Cancelled" },
  { key: "inactive", label: "Inactive" },
];

const STATUS_STYLES = {
  pending: {
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  approved: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  rejected: {
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
  },
  cancelled: {
    badge: "bg-gray-50 text-gray-600 border-gray-200",
    dot: "bg-gray-400",
  },
  inactive: {
    badge: "bg-gray-50 text-gray-600 border-gray-200",
    dot: "bg-gray-400",
  },
};

const StatusChip = ({ status }) => {
  const key = String(status || "pending").toLowerCase();
  const styles = STATUS_STYLES[key] || STATUS_STYLES.pending;
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide shadow-sm ${styles.badge}`}
    >
      <span className={`h-2 w-2 rounded-full ${styles.dot}`} />
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

export default function LoyaltyApplicationsBoard() {
  const { user } = useAuthUser();
  const normalizedRole = String(user?.role || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
  const canReview =
    normalizedRole.includes("admin") || normalizedRole.includes("eventoffice");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [actionFeedback, setActionFeedback] = useState(null);
  const [actionState, setActionState] = useState({ id: null, type: null });
  const [expandedTerms, setExpandedTerms] = useState({});
  const [rejectionModal, setRejectionModal] = useState({
    open: false,
    form: null,
    reason: "",
    error: null,
    submitting: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/loyalty");
        const rows = Array.isArray(res.data) ? res.data : [];
        rows.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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

  useEffect(() => {
    if (!actionFeedback) return;
    const timer = setTimeout(() => setActionFeedback(null), 5000);
    return () => clearTimeout(timer);
  }, [actionFeedback]);

  const setFeedback = (type, message) => setActionFeedback({ type, message });

  const handleApprove = async (formId) => {
    if (!canReview || !formId) return;
    setActionState({ id: formId, type: "approve" });
    try {
      await api.post(`/loyalty/${formId}/approve`);
      setFeedback("success", "Application approved successfully.");
      setRefreshKey((key) => key + 1);
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        err?.message ||
        "Failed to approve application.";
      setFeedback("error", message);
    } finally {
      setActionState({ id: null, type: null });
    }
  };

  const openRejectModal = (form) => {
    if (!canReview) return;
    setRejectionModal({
      open: true,
      form,
      reason: "",
      error: null,
      submitting: false,
    });
  };

  const closeRejectModal = () =>
    setRejectionModal({
      open: false,
      form: null,
      reason: "",
      error: null,
      submitting: false,
    });

  const submitRejection = async () => {
    if (!rejectionModal.form?._id || !canReview) return;
    const reason = rejectionModal.reason.trim();
    if (reason.length < 10) {
      setRejectionModal((prev) => ({
        ...prev,
        error: "Please include at least 10 characters explaining the decision.",
      }));
      return;
    }
    setRejectionModal((prev) => ({ ...prev, submitting: true, error: null }));
    try {
      await api.post(`/loyalty/${rejectionModal.form._id}/reject`, {
        reason,
      });
      setFeedback("success", "Application rejected and vendor notified.");
      closeRejectModal();
      setRefreshKey((key) => key + 1);
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        err?.message ||
        "Failed to reject application.";
      setRejectionModal((prev) => ({
        ...prev,
        submitting: false,
        error: message,
      }));
    }
  };

  const isActionPending = (formId, type) =>
    actionState.id === formId && actionState.type === type;

  const isFormBusy = (formId) =>
    actionState.id === formId ||
    (rejectionModal.submitting && rejectionModal.form?._id === formId);

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
        const key = String(app.status || "pending").toLowerCase();
        acc[key] = (acc[key] || 0) + 1;
        acc.total += 1;
        return acc;
      },
      {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        cancelled: 0,
        inactive: 0,
      }
    );
  }, [applications]);

  const hasActiveFilters = statusFilter !== "all" || search.trim().length > 0;
  const handleResetFilters = () => {
    setStatusFilter("all");
    setSearch("");
  };
  const handleRefresh = () => setRefreshKey((key) => key + 1);
  const toggleTerms = (id) =>
    setExpandedTerms((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <>
      <section className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Total
            </p>
            <p className="text-2xl font-bold text-[#001845]">
              {statusCounts.total}
            </p>
            <p className="text-xs text-gray-500">Applications received</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Pending
            </p>
            <p className="text-2xl font-bold text-amber-700">
              {statusCounts.pending}
            </p>
            <p className="text-xs text-gray-500">Awaiting review</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Approved
            </p>
            <p className="text-2xl font-bold text-emerald-700">
              {statusCounts.approved}
            </p>
            <p className="text-xs text-gray-500">Live partner offers</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Rejected
            </p>
            <p className="text-2xl font-bold text-rose-700">
              {statusCounts.rejected}
            </p>
            <p className="text-xs text-gray-500">Declined submissions</p>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white/80 p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Filters
              </p>
              <p className="text-sm text-gray-600">
                Cohesive controls for quick vendor reviews.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {hasActiveFilters ? (
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
                >
                  <RefreshCcw size={16} className="text-gray-500" />
                  Clear filters
                </button>
              ) : null}
              <button
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 rounded-full border border-[#4C3BCF] bg-[#4C3BCF] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3728a6] hover:border-[#3728a6]"
              >
                <RefreshCcw size={16} />
                Refresh
              </button>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white/70 p-4 shadow-inner">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
              <label className="relative flex-1 min-w-[220px]">
                <span className="mb-2 block text-sm font-semibold text-gray-800">
                  Search
                </span>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="search"
                    placeholder="Search by vendor or promo code"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-12 w-full rounded-2xl border border-gray-200 bg-white pl-10 pr-4 text-sm font-semibold text-gray-900 shadow-sm transition focus:border-[#4C3BCF] focus:outline-none focus:ring-2 focus:ring-[#d7d1ff]"
                  />
                </div>
              </label>
              <label className="w-full lg:w-64">
                <span className="mb-2 block text-sm font-semibold text-gray-800">
                  Status
                </span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-900 shadow-sm transition focus:border-[#4C3BCF] focus:outline-none focus:ring-2 focus:ring-[#d7d1ff]"
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
          <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
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
              const snippet = (app.termsAndConditions || "").slice(0, 220);
              const reviewedLabel =
                app.status !== "pending" && app.reviewedAt
                  ? `Reviewed ${formatDateTime(app.reviewedAt)}${
                      app.reviewerModel
                        ? ` - ${
                            app.reviewerModel === "Admin"
                              ? "Admin Team"
                              : "Events Office"
                          }`
                        : ""
                    }`
                  : null;
              const rejectionReason = (app.rejectionReason || "").trim();
              const reviewerNotes = (app.reviewerNotes || "").trim();
              const isPending = String(app.status).toLowerCase() === "pending";
              const showActions = canReview && isPending;
              const cardBusy = isFormBusy(app._id);
              const termsLength = (app.termsAndConditions || "").length;
              const isExpanded = Boolean(expandedTerms[app._id]);
              const termsCopy = isExpanded
                ? app.termsAndConditions || ""
                : snippet;
              return (
                <div
                  key={app._id}
                  className="relative w-full overflow-hidden rounded-3xl border border-gray-100 bg-white/95 p-6 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#4C3BCF] via-[#E11D48] to-[#001845]" />
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Loyalty Application
                      </p>
                      <p className="text-2xl font-bold text-[#001845]">
                        {vendorName}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#4C3BCF]/10 px-3 py-1 text-[#2c1f74]">
                          <Tag size={14} className="text-[#4C3BCF]" />
                          Promo {app.promoCode}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                          <Percent size={14} className="text-emerald-600" />
                          {app.discountRate}% OFF
                        </span>
                      </div>
                      {reviewedLabel && (
                        <p className="text-xs text-gray-500">{reviewedLabel}</p>
                      )}
                    </div>
                    <StatusChip status={app.status} />
                  </div>

                  <div className="mt-5 grid gap-3 text-sm text-gray-700 sm:grid-cols-3">
                    <div className="flex items-center gap-2 rounded-2xl bg-gray-50 px-3 py-2 font-semibold text-gray-700">
                      <Calendar size={16} className="text-[#4C3BCF]" />
                      Submitted {formatDateTime(app.createdAt)}
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl bg-gray-50 px-3 py-2 font-semibold text-gray-700">
                      <FileText size={16} className="text-[#4C3BCF]" />
                      Terms length {termsLength} chars
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl bg-gray-50 px-3 py-2 font-semibold text-gray-700">
                      <Percent size={16} className="text-[#4C3BCF]" />
                      Discount {app.discountRate}%
                    </div>
                  </div>

                  {termsCopy && (
                    <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
                      <div className="flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        <span>Terms & conditions</span>
                        {termsLength > snippet.length && (
                          <button
                            type="button"
                            onClick={() => toggleTerms(app._id)}
                            className="text-[#4C3BCF] hover:text-[#3728a6]"
                          >
                            {isExpanded ? "Show less" : "Read more"}
                          </button>
                        )}
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-gray-700">
                        {termsCopy}
                        {!isExpanded && termsLength > snippet.length
                          ? "..."
                          : ""}
                      </p>
                    </div>
                  )}

                  {rejectionReason && (
                    <div className="mt-4 flex items-start gap-2 rounded-2xl border border-rose-100 bg-rose-50 p-3 text-sm text-rose-700">
                      <MessageSquareWarning className="mt-0.5 h-4 w-4" />
                      <div>
                        <p className="font-semibold">Rejection reason</p>
                        <p className="leading-relaxed">{rejectionReason}</p>
                      </div>
                    </div>
                  )}
                  {!rejectionReason && reviewerNotes && (
                    <div className="mt-4 flex items-start gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-800">
                      <FileText className="mt-0.5 h-4 w-4" />
                      <div>
                        <p className="font-semibold">Reviewer notes</p>
                        <p className="leading-relaxed">{reviewerNotes}</p>
                      </div>
                    </div>
                  )}

                  {(showActions || termsCopy) && (
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      {showActions && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleApprove(app._id)}
                            disabled={cardBusy}
                            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white transition ${
                              cardBusy
                                ? "cursor-not-allowed bg-[#4C3BCF]/60"
                                : "bg-[#4C3BCF] hover:bg-[#3728a6]"
                            }`}
                          >
                            {isActionPending(app._id, "approve") ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4" />
                            )}
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => openRejectModal(app)}
                            disabled={cardBusy}
                            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white transition ${
                              cardBusy
                                ? "cursor-not-allowed bg-rose-400/70"
                                : "bg-rose-600 hover:bg-rose-700"
                            }`}
                          >
                            <XCircle className="h-4 w-4" />
                            Reject
                          </button>
                        </>
                      )}
                      {!showActions && (
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Status: {String(app.status).toUpperCase()}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {actionFeedback && (
          <div
            className={`flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-sm font-semibold ${
              actionFeedback.type === "error"
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            <span>{actionFeedback.message}</span>
            <button
              type="button"
              onClick={() => setActionFeedback(null)}
              className="text-xs font-bold uppercase tracking-wide text-current/80"
            >
              Dismiss
            </button>
          </div>
        )}
      </section>

      {rejectionModal.open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">
                  Reject application
                </p>
                <h3 className="text-xl font-bold text-[#18122B]">
                  {rejectionModal.form?.promoCode}
                </h3>
                <p className="text-sm text-gray-500">
                  {rejectionModal.form?.vendorId?.companyname ||
                    rejectionModal.form?.vendorId?.name ||
                    rejectionModal.form?.vendorId?.email ||
                    "Vendor"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => !rejectionModal.submitting && closeRejectModal()}
                className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
                disabled={rejectionModal.submitting}
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-5 space-y-2 text-sm text-gray-600">
              <label className="font-semibold text-gray-800">
                Rejection reason
              </label>
              <textarea
                rows={4}
                maxLength={600}
                value={rejectionModal.reason}
                onChange={(e) =>
                  setRejectionModal((prev) => ({
                    ...prev,
                    reason: e.target.value,
                    error: null,
                  }))
                }
                placeholder="Explain why this offer cannot be approved. Vendors will see this message."
                className="w-full rounded-2xl border border-gray-200 bg-gray-50/60 p-3 text-sm focus:border-[#4C3BCF] focus:bg-white focus:outline-none"
              />
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Minimum 10 characters</span>
                <span>{rejectionModal.reason.length}/600</span>
              </div>
              {rejectionModal.error && (
                <p className="text-sm text-rose-600">{rejectionModal.error}</p>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeRejectModal}
                disabled={rejectionModal.submitting}
                className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitRejection}
                disabled={rejectionModal.submitting}
                className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-400"
              >
                {rejectionModal.submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MessageSquareWarning className="h-4 w-4" />
                )}
                Submit Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
