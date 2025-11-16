import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCcw,
  ShieldCheck,
  X,
} from "lucide-react";
import api from "../../services/api";
import { useAuthUser } from "../../context/UserContext";

const STATUS_INFO = {
  not_applied: {
    title: "Join the GUC Loyalty Program",
    message: "Apply now to offer exclusive discounts to the GUC community.",
  },
  pending: {
    title: "Application Pending Review",
    message:
      "Our Events Office is reviewing your submission. We’ll notify you once a decision is made.",
  },
  approved: {
    title: "You’re an Official Loyalty Partner",
    message:
      "Your promo details are live. Share them with students and keep an eye on your inbox for engagement tips.",
  },
  rejected: {
    title: "Application Rejected",
    message:
      "You can update your offer and apply again at any time. Review the requirements before resubmitting.",
  },
  cancelled: {
    title: "Partnership Cancelled",
    message:
      "If you’d like to rejoin the program, you can apply again with updated details.",
  },
  inactive: {
    title: "Participation Cancelled",
    message:
      "You left the program. Submit a new application whenever you’re ready to return.",
  },
};

const STATUS_TONE = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-50 text-rose-700 border-rose-200",
  cancelled: "bg-gray-50 text-gray-600 border-gray-200",
  inactive: "bg-gray-50 text-gray-600 border-gray-200",
};

const StatusBadge = ({ status }) => {
  if (!status || status === "not_applied") return null;
  const key = String(status).toLowerCase();
  const tone = STATUS_TONE[key] || STATUS_TONE.pending;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${tone}`}
    >
      {key.charAt(0).toUpperCase() + key.slice(1)}
    </span>
  );
};

const formatDate = (value) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const summarizeTerms = (terms = "", limit = 180) => {
  const trimmed = terms.trim();
  if (!trimmed) return "No terms provided.";
  if (trimmed.length <= limit) return trimmed;
  return `${trimmed.slice(0, limit)}...`;
};

const LoyaltyProgram = ({ vendor }) => {
  const { user } = useAuthUser();
  const vendorId = vendor?._id || user?._id;
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);
  const [applyAgainModalOpen, setApplyAgainModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!vendorId) return;
    let cancelled = false;
    const fetchApplications = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/loyalty", { params: { vendorId } });
        if (cancelled) return;
        const rows = Array.isArray(res.data) ? res.data : [];
        rows.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setApplications(rows);
      } catch (err) {
        if (cancelled) return;
        const message =
          err?.response?.data?.error ||
          err?.message ||
          "Unable to load loyalty applications.";
        setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchApplications();
    return () => {
      cancelled = true;
    };
  }, [vendorId, refreshKey]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const pendingApplication = useMemo(
    () => applications.find((app) => app.status === "pending"),
    [applications]
  );
  const latestApplication = useMemo(
    () => (applications.length ? applications[0] : null),
    [applications]
  );
  const approvedApplication = useMemo(
    () => applications.find((app) => app.status === "approved"),
    [applications]
  );

  const heroApplication = pendingApplication || latestApplication;
  const heroStatus = heroApplication?.status || "not_applied";
  const statusCopy = STATUS_INFO[heroStatus] || STATUS_INFO.not_applied;
  const hasHistory = applications.length > 0;
  const canApply = !pendingApplication;

  const primaryCta = useMemo(() => {
    if (!vendorId) return null;
    if (!canApply) {
      return {
        label: "View Submission",
        to: "/dashboard/vendor/apply-loyalty",
        variant: "secondary",
      };
    }
    return {
      label: hasHistory ? "Apply Again" : "Apply Now",
      to: "/dashboard/vendor/apply-loyalty",
      variant: "primary",
      requiresReminder: hasHistory,
    };
  }, [
    vendorId,
    canApply,
    hasHistory,
  ]);

  const handleNavigate = (to) => navigate(to);
  const handleApplyAgainProceed = () => {
    setApplyAgainModalOpen(false);
    if (primaryCta?.to) {
      handleNavigate(primaryCta.to);
    }
  };
  const canCancelParticipation = Boolean(approvedApplication);

  const openCancelModal = () => {
    setCancelError(null);
    setCancelReason("");
    setCancelModalOpen(true);
  };

  const closeCancelModal = () => {
    if (cancelling) return;
    setCancelModalOpen(false);
    setCancelReason("");
    setCancelError(null);
  };

  const handleCancelParticipation = async () => {
    if (!vendorId || !approvedApplication) return;
    setCancelling(true);
    setCancelError(null);
    try {
      await api.delete("/loyalty/vendor", {
        data: { reason: cancelReason.trim() },
      });
      setApplications((prev) =>
        prev.filter((app) => app._id !== approvedApplication._id)
      );
      setCancelModalOpen(false);
      setCancelReason("");
      setToast({
        type: "success",
        message: "Loyalty program removed from the directory.",
      });
      setRefreshKey((key) => key + 1);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("notifications:refresh"));
      }
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        err?.message ||
        "Failed to cancel participation. Please try again.";
      setCancelError(message);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-[#18122B]">{statusCopy.title}</h1>
        <p className="text-sm text-gray-600">{statusCopy.message}</p>
      </div>
      <section className="space-y-5 rounded-3xl border border-gray-100 bg-white/80 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-end gap-3">
          <button
            onClick={() => setRefreshKey((key) => key + 1)}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
          {primaryCta && (
            <button
              onClick={() => {
                if (primaryCta.requiresReminder) {
                  setApplyAgainModalOpen(true);
                  return;
                }
                handleNavigate(primaryCta.to);
              }}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold shadow ${
                primaryCta.variant === "primary"
                  ? "bg-[#4C3BCF] text-white hover:bg-[#3728a6]"
                  : "border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {primaryCta.label}
            </button>
          )}
          {canCancelParticipation && (
            <button
              onClick={openCancelModal}
              className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
            >
              <ShieldCheck size={16} />
              Cancel Participation
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading application data...
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-100 bg-white/70 p-5 shadow-inner">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#4C3BCF]">
                Program Status
              </div>
              <StatusBadge status={heroStatus} />
            </div>
            {heroApplication ? (
              <>
                <p className="mt-2 text-sm text-gray-600">
                  Submitted {formatDate(heroApplication.createdAt)} • Promo{" "}
                  {heroApplication.promoCode || "—"}
                </p>
                <dl className="mt-4 grid gap-4 text-sm text-gray-700 sm:grid-cols-2">
                  <div>
                    <dt className="font-semibold text-gray-500">Discount</dt>
                    <dd className="text-xl font-bold text-[#18122B]">
                      {heroApplication.discountRate}% off
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-gray-500">Promo Code</dt>
                    <dd className="text-xl font-semibold tracking-wide text-[#4C3BCF]">
                      {heroApplication.promoCode}
                    </dd>
                  </div>
                </dl>
                {heroApplication.termsAndConditions && (
                  <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Terms snapshot
                    </p>
                    <p className="mt-2 text-sm text-gray-600">
                      {summarizeTerms(heroApplication.termsAndConditions)}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className="mt-2 text-sm text-gray-600">
                You haven’t submitted a loyalty application yet. Use the button
                above to get started.
              </p>
            )}
          </div>
        )}

        {approvedApplication && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 text-emerald-900">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide">
              <ShieldCheck size={16} />
              Active Partnership Details
            </div>
            <div className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
              <div>
                <p className="text-emerald-600">Promo Code</p>
                <p className="text-2xl font-bold">{approvedApplication.promoCode}</p>
              </div>
              <div>
                <p className="text-emerald-600">Discount Rate</p>
                <p className="text-2xl font-bold">
                  {approvedApplication.discountRate}% OFF
                </p>
              </div>
              <div>
                <p className="text-emerald-600">Approved On</p>
                <p className="text-lg font-semibold">
                  {formatDate(approvedApplication.reviewedAt || approvedApplication.updatedAt)}
                </p>
              </div>
            </div>
            {approvedApplication.termsAndConditions && (
              <div className="mt-4 rounded-2xl bg-white/80 p-4 text-sm text-emerald-800">
                <p className="font-semibold">Key Terms</p>
                <p className="mt-1">
                  {summarizeTerms(approvedApplication.termsAndConditions, 260)}
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {cancelModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">
                  Cancel participation
                </p>
                <h3 className="text-2xl font-bold text-[#18122B]">Are you sure?</h3>
                <p className="text-sm text-gray-600">
                  Cancelling removes your promo from the loyalty directory immediately.
                  Students will no longer see your offer until you submit a new application.
                </p>
              </div>
              <button
                type="button"
                onClick={closeCancelModal}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4">
              <label className="text-sm font-semibold text-gray-700">
                Optional note for the Events Office
              </label>
              <textarea
                rows={4}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Briefly explain why you’re leaving the program."
                className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm focus:border-[#4C3BCF] focus:bg-white focus:outline-none"
              />
            </div>
            {cancelError && (
              <p className="mt-2 text-sm text-rose-600">{cancelError}</p>
            )}

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={closeCancelModal}
                disabled={cancelling}
                className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed"
              >
                Keep participation
              </button>
              <button
                type="button"
                onClick={handleCancelParticipation}
                disabled={cancelling}
                className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {cancelling ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                Confirm cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {applyAgainModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-[#18122B]">Before you proceed</h3>
              <p className="text-sm text-gray-600">
                Please make sure you do not have any ongoing Loyalty Program partnerships before submitting a new application.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setApplyAgainModalOpen(false)}
                className="rounded-full bg-rose-600 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-500"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleApplyAgainProceed}
                className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-lg ${
            toast.type === "error"
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {toast.type === "error" ? (
            <AlertTriangle className="h-4 w-4" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-2 rounded-full p-1 text-current/70 hover:bg-black/5"
            aria-label="Dismiss notification"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
};

export default LoyaltyProgram;
