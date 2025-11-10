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

const tone = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-50 text-rose-700 border-rose-200",
  cancelled: "bg-gray-50 text-gray-600 border-gray-200",
  inactive: "bg-gray-50 text-gray-600 border-gray-200",
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

  useEffect(() => {
    if (!actionFeedback) return;
    const timer = setTimeout(() => setActionFeedback(null), 5000);
    return () => clearTimeout(timer);
  }, [actionFeedback]);

  const setFeedback = (type, message) =>
    setActionFeedback({ type, message });

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
        const key = String(app.status).toLowerCase();
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      { total: applications.length }
    );
  }, [applications]);

  return (
    <>
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
                    {reviewedLabel && (
                      <p className="mt-1 text-xs text-gray-500">
                        {reviewedLabel}
                      </p>
                    )}
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
                    <span>Terms length {termsLength} chars</span>
                  </div>
                </div>
                {snippet && (
                  <p className="mt-3 text-sm text-gray-500">
                    {snippet}
                    {termsLength > snippet.length ? "..." : ""}
                  </p>
                )}
                {rejectionReason && (
                  <div className="mt-3 flex items-start gap-2 rounded-2xl border border-rose-100 bg-rose-50 p-3 text-sm text-rose-700">
                    <MessageSquareWarning className="mt-0.5 h-4 w-4" />
                    <div>
                      <p className="font-semibold">Rejection reason</p>
                      <p className="leading-relaxed">{rejectionReason}</p>
                    </div>
                  </div>
                )}
                {!rejectionReason && reviewerNotes && (
                  <div className="mt-3 flex items-start gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-800">
                    <FileText className="mt-0.5 h-4 w-4" />
                    <div>
                      <p className="font-semibold">Reviewer notes</p>
                      <p className="leading-relaxed">{reviewerNotes}</p>
                    </div>
                  </div>
                )}
                {showActions && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleApprove(app._id)}
                      disabled={cardBusy}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white transition ${
                        cardBusy
                          ? "cursor-not-allowed bg-emerald-400/70"
                          : "bg-emerald-600 hover:bg-emerald-700"
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
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {actionFeedback && (
        <div
          className={`mt-5 flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-sm font-semibold ${
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
