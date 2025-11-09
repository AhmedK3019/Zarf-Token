import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  Percent,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Tag,
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
};

const STATUS_TONE = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-50 text-rose-700 border-rose-200",
  cancelled: "bg-gray-50 text-gray-600 border-gray-200",
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

  const activeApplication = useMemo(
    () => applications.find((app) => ["pending", "approved"].includes(app.status)),
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

  const heroApplication = activeApplication || latestApplication;
  const heroStatus = heroApplication?.status || "not_applied";
  const statusCopy = STATUS_INFO[heroStatus] || STATUS_INFO.not_applied;
  const hasHistory = applications.length > 0;
  const canApply = !activeApplication;

  const primaryCta = useMemo(() => {
    if (!vendorId) return null;
    if (canApply) {
      return {
        label: hasHistory ? "Apply Again" : "Apply Now",
        to: "/dashboard/vendor/apply-loyalty",
        variant: "primary",
      };
    }
    if (activeApplication?.status === "pending") {
      return {
        label: "View Submission",
        to: "/dashboard/vendor/apply-loyalty",
        variant: "secondary",
      };
    }
    if (activeApplication?.status === "approved") {
      return {
        label: "Manage Partnership",
        to: vendor?.loyal
          ? "/dashboard/vendor/cancel-loyalty"
          : "/dashboard/vendor/apply-loyalty",
        variant: "secondary",
      };
    }
    if (latestApplication?.status === "rejected") {
      return {
        label: "Apply Again",
        to: "/dashboard/vendor/apply-loyalty",
        variant: "primary",
      };
    }
    return null;
  }, [
    vendorId,
    canApply,
    hasHistory,
    activeApplication,
    vendor?.loyal,
    latestApplication,
  ]);

  const secondaryCta =
    approvedApplication && vendor?.loyal
      ? {
          label: "Cancel Partnership",
          to: "/dashboard/vendor/cancel-loyalty",
        }
      : null;

  const handleNavigate = (to) => navigate(to);

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <section className="space-y-5 rounded-3xl border border-gray-100 bg-white/80 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-gray-500">
              GUC Loyalty Program
            </p>
            <h1 className="text-3xl font-bold text-[#18122B]">
              {statusCopy.title}
            </h1>
            <p className="text-sm text-gray-600">{statusCopy.message}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setRefreshKey((key) => key + 1)}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              <RefreshCcw size={16} />
              Refresh
            </button>
            {primaryCta && (
              <button
                onClick={() => handleNavigate(primaryCta.to)}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold shadow ${
                  primaryCta.variant === "primary"
                    ? "bg-[#4C3BCF] text-white hover:bg-[#3728a6]"
                    : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Sparkles size={16} />
                {primaryCta.label}
              </button>
            )}
            {secondaryCta && (
              <button
                onClick={() => handleNavigate(secondaryCta.to)}
                className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50"
              >
                <ShieldCheck size={16} />
                {secondaryCta.label}
              </button>
            )}
          </div>
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
                <Sparkles size={16} />
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

      <section className="rounded-3xl border border-gray-100 bg-white/80 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-[#18122B]">
              Application History
            </h2>
            <p className="text-sm text-gray-500">
              Track every submission and its outcome.
            </p>
          </div>
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            {applications.length} total
          </span>
        </div>

        {loading ? (
          <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading history...
          </div>
        ) : error ? (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        ) : !applications.length ? (
          <div className="mt-6 rounded-2xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
            No submissions yet. Your history will show up here after your first
            application.
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {applications.map((app) => (
              <div
                key={app._id}
                className="rounded-2xl border border-gray-100 p-4 shadow-sm transition hover:border-[#736CED]/40"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-bold text-[#18122B]">
                      {app.promoCode}
                    </p>
                    <p className="text-xs text-gray-500">
                      Submitted {formatDate(app.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
                <div className="mt-3 grid gap-3 text-sm text-gray-600 sm:grid-cols-3">
                  <div className="flex items-center gap-2">
                    <Percent size={14} className="text-gray-400" />
                    <span>{app.discountRate}% discount</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag size={14} className="text-gray-400" />
                    <span>Promo {app.promoCode}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-gray-400" />
                    <span>Updated {formatDate(app.updatedAt || app.createdAt)}</span>
                  </div>
                </div>
                {(app.rejectionReason || app.reviewerNotes) && (
                  <div
                    className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs ${
                      app.status === "rejected"
                        ? "bg-rose-50 text-rose-700"
                        : "bg-gray-50 text-gray-600"
                    }`}
                  >
                    <FileText size={12} />
                    <span>
                      {(app.rejectionReason || app.reviewerNotes || "").trim()}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {canApply && hasHistory && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/80 p-4 text-sm text-indigo-900">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 size={16} />
            Ready to try again?
          </div>
          <p className="mt-1">
            Update your promo details and submit a new application whenever
            you’re ready.
          </p>
          <button
            onClick={() => handleNavigate("/dashboard/vendor/apply-loyalty")}
            className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#4C3BCF] hover:text-[#3728a6]"
          >
            Apply Again
          </button>
        </div>
      )}
    </div>
  );
};

export default LoyaltyProgram;
