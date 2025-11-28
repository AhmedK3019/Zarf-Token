import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Ban,
  Building,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  Info,
  Loader2,
  MapPin,
  RefreshCcw,
  Search,
  Square,
  Users,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuthUser } from "../../context/UserContext";

const STATUS_TABS = [
  { key: "pending", label: "Pending" },
  { key: "accepted", label: "Accepted" },
  { key: "rejected", label: "Rejected" },
  { key: "cancelled", label: "Cancelled" },
];

const VIEW_FILTERS = [
  { key: "all", label: "All" },
  { key: "bazaar", label: "Bazaars" },
  { key: "platform", label: "Platform" },
];

const toDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const combineDateParts = (dateValue, timeValue) => {
  const base = toDate(dateValue);
  if (!base) return null;
  if (typeof timeValue === "string" && timeValue.includes(":")) {
    const [hours, minutes] = timeValue
      .split(":")
      .map((part) => parseInt(part, 10));
    base.setHours(Number.isFinite(hours) ? hours : 0);
    base.setMinutes(Number.isFinite(minutes) ? minutes : 0, 0, 0);
  } else {
    base.setHours(0, 0, 0, 0);
  }
  return base;
};

const mapStatusToTabKey = (status = "Pending") => {
  const normalized = String(status).toLowerCase();
  if (normalized === "approved") return "accepted";
  if (normalized === "rejected") return "rejected";
  if (normalized === "cancelled") return "cancelled";
  return "pending";
};

const formatDate = (dateStr) => {
  const date = toDate(dateStr);
  if (!date) return dateStr || "-";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatDateTime = (dateStr, timeStr) => {
  const date = combineDateParts(dateStr, timeStr);
  if (!date) return `${formatDate(dateStr)} ${timeStr || ""}`;
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const getEventStartDate = (request) => {
  if (request.bazarId)
    return combineDateParts(
      request.bazarId.startdate,
      request.bazarId.starttime
    );
  return combineDateParts(request.startdate, "00:00");
};

const getPaymentBanner = (request, nowMs) => {
  if (mapStatusToTabKey(request.status) !== "accepted") return null;
  const paymentState = request.paymentStatus || "unpaid";
  if (paymentState !== "unpaid") return null;
  const dueDate = toDate(request.paymentDueAt);
  if (!dueDate) return null;
  const diffMs = dueDate.getTime() - nowMs;
  const absMs = Math.abs(diffMs);
  const days = Math.floor(absMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((absMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((absMs / (1000 * 60)) % 60);
  const countdownText = `${days}d ${hours}h ${minutes}m`;
  if (diffMs <= 0) {
    return {
      message: "Payment Overdue",
      variant: "danger",
      countdownText,
      dueDate,
    };
  }
  if (diffMs <= 24 * 60 * 60 * 1000) {
    return {
      message: "Payment due in 24 hours",
      variant: "danger",
      countdownText,
      dueDate,
    };
  }
  if (diffMs <= 48 * 60 * 60 * 1000) {
    return {
      message: "Payment due in 2 days",
      variant: "warning",
      countdownText,
      dueDate,
    };
  }
  return {
    message: `Payment due in ${days} days`,
    variant: "neutral",
    countdownText,
    dueDate,
  };
};

const getCancellationState = (request, nowMs) => {
  const statusKey = mapStatusToTabKey(request.status);
  if (!["pending", "accepted"].includes(statusKey)) {
    return {
      canCancel: false,
      reason: "Request can only be cancelled while pending or accepted",
    };
  }
  const paymentState = request.paymentStatus || "unpaid";
  if (paymentState !== "unpaid") {
    return {
      canCancel: false,
      reason: "Cannot cancel - payment already processed",
    };
  }
  const startDate = getEventStartDate(request);
  if (startDate && startDate.getTime() <= nowMs) {
    return {
      canCancel: false,
      reason: "Cannot cancel - event has already started",
    };
  }
  return { canCancel: true, reason: "" };
};

function StatusBadge({ status }) {
  const config = {
    Pending: {
      icon: Clock,
      color: "text-amber-700 bg-amber-50 border-amber-200",
      label: "Pending Review",
    },
    Approved: {
      icon: CheckCircle,
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
      label: "Accepted",
    },
    Rejected: {
      icon: AlertCircle,
      color: "text-red-600 bg-red-50 border-red-200",
      label: "Rejected",
    },
    Cancelled: {
      icon: Ban,
      color: "text-gray-600 bg-gray-100 border-gray-200",
      label: "Cancelled",
    },
  };
  const normalized = config[status] || config.Pending;
  const Icon = normalized.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md border ${normalized.color}`}
    >
      <Icon size={12} />
      {normalized.label}
    </span>
  );
}

function PaymentDeadlineBadge({ banner }) {
  if (!banner) return null;
  const palette = {
    neutral: "bg-indigo-50 text-indigo-700 border-indigo-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
  };
  return (
    <div
      className={`mt-3 px-3 py-2 rounded-xl border text-sm font-semibold flex items-center gap-2 ${
        palette[banner.variant]
      }`}
    >
      <Clock size={14} />
      {banner.message}
      <span className="text-xs font-normal opacity-80">
        ({banner.countdownText})
      </span>
    </div>
  );
}

function DetailsModal({ request, onClose, nowMs }) {
  if (!request) return null;
  const paymentBanner = getPaymentBanner(request, nowMs);
  const cancellationDate =
    request.cancelledAt && formatDate(request.cancelledAt);

  const infoBlock = (
    <>
      {request.boothname && (
        <div className="flex items-start gap-3">
          <Building className="mt-1 text-[#736CED]" size={16} />
          <div>
            <span className="font-semibold">Booth Name:</span>{" "}
            {request.boothname}
          </div>
        </div>
      )}
      <div className="flex items-start gap-3">
        <Info className="mt-1 text-[#736CED]" size={16} />
        <div>
          <span className="font-semibold">Booth Size:</span> {request.boothSize}
        </div>
      </div>
      {request.duration && !request.isBazarBooth && (
        <div className="flex items-start gap-3">
          <Clock className="mt-1 text-[#736CED]" size={16} />
          <div>
            <span className="font-semibold">Duration:</span> {request.duration}{" "}
            weeks
          </div>
        </div>
      )}
      {request.location && (
        <div className="flex items-start gap-3">
          <MapPin className="mt-1 text-[#736CED]" size={16} />
          <div>
            <span className="font-semibold">
              {request.isBazarBooth
                ? "Requested Location"
                : "Platform Location"}
              :
            </span>{" "}
            {request.location}
          </div>
        </div>
      )}
      {request.people?.length > 0 && (
        <div className="flex items-start gap-3">
          <Users className="mt-1 text-[#736CED]" size={16} />
          <div>
            <span className="font-semibold">Team Members:</span>
            <ul className="mt-2 space-y-1">
              {request.people.map((person, index) => (
                <li key={index} className="text-sm bg-gray-50 p-2 rounded">
                  <strong>{person.name}</strong> - {person.email}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <div className="flex items-start gap-3">
        <Calendar className="mt-1 text-[#736CED]" size={16} />
        <div>
          <span className="font-semibold">Submitted:</span>{" "}
          {formatDate(request.createdAt)}
        </div>
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-white/90 border-b border-gray-200 p-6 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <span className="font-semibold text-gray-700">Dashboard</span>
              <ChevronRight className="h-3 w-3" />
              <span className="font-semibold text-gray-700">
                My Participations
              </span>
              <ChevronRight className="h-3 w-3" />
              <span>
                {request.boothname || request.bazarId?.bazaarname || "Details"}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-[#4C3BCF]">
              {request.boothname ||
                (request.isBazarBooth
                  ? "Bazaar Booth Request"
                  : "Platform Booth Request")}
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <StatusBadge status={request.status} />
              {request.isBazarBooth && request.bazarId?.bazaarname && (
                <span className="text-sm text-[#736CED]">
                  at {request.bazarId.bazaarname}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
            aria-label="Close details"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <>
              {infoBlock}
              <div className="flex items-start gap-3">
                <Calendar className="mt-1 text-[#736CED]" size={16} />
                <div>
                  <span className="font-semibold">Start Date:</span>{" "}
                  {formatDate(request.startdate)}
                  {request.starttime && (
                    <span className="text-gray-600 ml-2">
                      at {request.starttime}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="mt-1 text-[#736CED]" size={16} />
                <div>
                  <span className="font-semibold">End Date:</span>{" "}
                  {formatDate(request.enddate)}
                  {request.endtime && (
                    <span className="text-gray-600 ml-2">
                      at {request.endtime}
                    </span>
                  )}
                </div>
              </div>
            </>
          </div>
          {paymentBanner && <PaymentDeadlineBadge banner={paymentBanner} />}
          {cancellationDate && (
            <div className="p-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-700">
              <div className="font-semibold flex items-center gap-2">
                <Ban size={14} />
                Cancelled on {cancellationDate}
              </div>
              {request.cancellationReason && (
                <p className="mt-2 text-gray-600 italic">
                  "{request.cancellationReason}"
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// CancellationDialog removed (no longer used)

const StatCard = ({ label, value, accent }) => (
  <div className="rounded-lg border border-gray-100 bg-white/80 p-2.5 shadow-sm">
    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
      {label}
    </p>
    <p className={`text-lg font-bold ${accent || "text-[#001845]"}`}>{value}</p>
  </div>
);

const emptyMessages = {
  all: "No participation requests found.",
  pending: "No pending participation requests right now.",
  accepted: "No accepted requests are awaiting payment.",
  rejected: "You have no rejected requests.",
  cancelled: "No cancelled requests yet.",
};

export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [statusTab, setStatusTab] = useState("all");
  const [viewFilter, setViewFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [nowMs, setNowMs] = useState(Date.now());
  const [cancellingId, setCancellingId] = useState(null);
  const [payingId, setPayingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [successPulse, setSuccessPulse] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuthUser();

  useEffect(() => {
    const tick = setInterval(() => setNowMs(Date.now()), 60000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    if (!user?._id) return;
    let active = true;
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get("/vendorRequests/mine");
        if (!active) return;
        const sorted = [...(response.data || [])].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setRequests(sorted);
      } catch (err) {
        if (!active) return;
        if (err.response?.status === 401) {
          setError("Authentication failed. Please log in again.");
        } else {
          setError(
            err.response?.data?.message ||
              "Failed to fetch your requests. Please try again."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchRequests();
    return () => {
      active = false;
    };
  }, [user?._id, refreshKey]);

  const statusCounts = useMemo(() => {
    return requests.reduce(
      (acc, request) => {
        const key = mapStatusToTabKey(request.status);
        acc[key] = (acc[key] || 0) + 1;
        acc.total += 1;
        return acc;
      },
      { total: 0, pending: 0, accepted: 0, rejected: 0, cancelled: 0 }
    );
  }, [requests]);

  const filteredRequests = useMemo(() => {
    const term = search.trim().toLowerCase();
    return requests.filter((request) => {
      if (
        statusTab !== "all" &&
        mapStatusToTabKey(request.status) !== statusTab
      )
        return false;
      if (viewFilter === "bazaar" && !request.isBazarBooth) return false;
      if (viewFilter === "platform" && request.isBazarBooth) return false;
      if (term) {
        const haystack = [
          request.boothname,
          request.bazarId?.bazaarname,
          request.location,
          request.bazarId?.location,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [requests, statusTab, viewFilter, search]);

  const emitAnalyticsEvent = (payload) => {
    try {
      if (window?.dataLayer) {
        window.dataLayer.push(payload);
      } else {
        window.dispatchEvent(new CustomEvent("analytics", { detail: payload }));
      }
    } catch {
      // analytics errors should never break the UI
    }
  };

  // Direct cancel handler without reason dialog
  const handleDirectCancel = async (target) => {
    if (!target?._id) return;
    setCancellingId(target._id);
    try {
      await api.delete(`/vendorRequests/${target._id}/cancel`);
      setRequests((prev) =>
        prev.map((item) =>
          item._id === target._id
            ? {
                ...item,
                status: "Cancelled",
                paymentStatus: "cancelled",
                cancelledAt: new Date().toISOString(),
                cancellationReason: "Cancelled by vendor",
              }
            : item
        )
      );
      setStatusTab("cancelled");
      setToast({
        type: "success",
        message: "Participation cancelled successfully",
      });
      setSuccessPulse(true);
      setTimeout(() => setSuccessPulse(false), 1600);
      emitAnalyticsEvent({
        event: "vendor_participation_cancelled",
        requestId: target._id,
        eventType: target.isBazarBooth ? "bazaar" : "platform",
      });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Failed to cancel participation. Please try again.";
      setToast({ type: "error", message });
    } finally {
      setCancellingId(null);
    }
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleRefresh = () => setRefreshKey((key) => key + 1);

  const resetFilters = () => {
    setStatusTab("all");
    setViewFilter("all");
    setSearch("");
  };

  return (
    <>
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes pop { 0% { transform: scale(0.8); opacity: 0; } 60% { transform: scale(1.05); opacity: 1; } 100% { transform: scale(1); opacity: 0; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.4s ease-out forwards; }
        .animate-pop { animation: pop 1.2s ease-out forwards; }
      `}</style>
      <div className="min-h-screen w-full bg-gradient-to-br from-[#f5f7ff] via-white to-[#eef2ff] text-[#1F1B3B] font-sans px-4 py-3 lg:px-6 lg:py-4">
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-3">
          <section className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
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
              label="Accepted"
              value={statusCounts.accepted}
              accent="text-emerald-700"
            />
            <StatCard
              label="Rejected"
              value={statusCounts.rejected}
              accent="text-rose-700"
            />
          </section>

          <section className="rounded-xl border border-gray-100 bg-white/80 p-3 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <label className="relative flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by booth name or bazaar"
                      className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-xs font-semibold text-gray-900 shadow-sm transition focus:border-[#4C3BCF] focus:outline-none focus:ring-1 focus:ring-[#d7d1ff]"
                    />
                  </div>
                </label>
                <label className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-700">
                    Status:
                  </span>
                  <select
                    value={statusTab}
                    onChange={(e) => setStatusTab(e.target.value)}
                    className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-900 shadow-sm transition focus:border-[#4C3BCF] focus:outline-none focus:ring-1 focus:ring-[#d7d1ff]"
                  >
                    <option value="all">All</option>
                    {STATUS_TABS.map((tab) => (
                      <option key={tab.key} value={tab.key}>
                        {tab.label}
                        {statusCounts[tab.key]
                          ? ` (${statusCounts[tab.key]})`
                          : ""}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-700">
                    Type:
                  </span>
                  <select
                    value={viewFilter}
                    onChange={(e) => setViewFilter(e.target.value)}
                    className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-900 shadow-sm transition focus:border-[#4C3BCF] focus:outline-none focus:ring-1 focus:ring-[#d7d1ff]"
                  >
                    {VIEW_FILTERS.map((filter) => (
                      <option key={filter.key} value={filter.key}>
                        {filter.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {statusTab !== "all" ||
                viewFilter !== "all" ||
                search.trim().length > 0 ? (
                  <button
                    onClick={resetFilters}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
                  >
                    <RefreshCcw className="h-3 w-3 text-gray-500" />
                    Clear
                  </button>
                ) : null}
                <button
                  onClick={handleRefresh}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#4C3BCF] bg-[#4C3BCF] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#3728a6] hover:border-[#3728a6]"
                >
                  <RefreshCcw className="h-3 w-3" />
                  Refresh
                </button>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            {loading ? (
              <div className="flex flex-col items-center gap-4 rounded-3xl border border-gray-100 bg-white/80 px-6 py-12 text-center shadow-sm">
                <div className="inline-block h-12 w-12 border-4 border-[#736CED] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-gray-600">
                  Loading your requests...
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center gap-3 rounded-3xl border border-rose-200 bg-rose-50 px-6 py-10 text-center text-rose-700">
                <p className="text-lg font-semibold">{error}</p>
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-300 transition hover:bg-rose-700"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Try again
                </button>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-gray-200 bg-white/80 px-8 py-16 text-center shadow-sm">
                <p className="text-lg font-semibold text-[#001845]">
                  {emptyMessages[statusTab] || emptyMessages.all}
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 rounded-full border border-[#4C3BCF] px-4 py-2 text-sm font-semibold text-[#4C3BCF] transition hover:bg-[#4C3BCF] hover:text-white"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredRequests.map((request) => {
                  const statusKey = mapStatusToTabKey(request.status);
                  const cancellationState = getCancellationState(
                    request,
                    nowMs
                  );
                  const isCancelled = statusKey === "cancelled";
                  const paymentBanner =
                    statusKey === "accepted"
                      ? getPaymentBanner(request, nowMs)
                      : null;
                  const isCancelling = cancellingId === request._id;
                  const textMuted = isCancelled
                    ? "text-gray-500"
                    : "text-[#312A68]";

                  return (
                    <div
                      key={request._id}
                      className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white/95 p-6 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#4C3BCF] via-[#E11D48] to-[#001845]" />
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            {request.isBazarBooth
                              ? "Bazaar participation"
                              : "Platform booth"}
                          </p>
                          <h3 className="text-xl font-bold text-[#001845]">
                            {request.boothname ||
                              (request.isBazarBooth
                                ? "Bazaar Booth Request"
                                : "Platform Booth Request")}
                          </h3>
                          {request.isBazarBooth &&
                            request.bazarId?.bazaarname && (
                              <p className="text-sm font-semibold text-[#736CED]">
                                at {request.bazarId.bazaarname}
                              </p>
                            )}
                        </div>
                        <StatusBadge status={request.status} />
                      </div>

                      <div
                        className={`mt-4 flex flex-wrap gap-3 text-sm ${textMuted}`}
                      >
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-3 py-1 font-semibold">
                          <Square size={14} />
                          {request.boothSize}
                        </span>
                        {request.duration && !request.isBazarBooth && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-3 py-1 font-semibold">
                            <Clock size={14} />
                            {request.duration} weeks
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-3 py-1 font-semibold">
                          <Users size={14} />
                          {request.people?.length || 0}
                        </span>
                      </div>

                      {request.bazarId?.location && (
                        <div
                          className={`mt-3 flex items-center gap-2 text-sm ${textMuted}`}
                        >
                          <MapPin size={14} />
                          {request.bazarId.location}
                        </div>
                      )}
                      {request.location && !request.isBazarBooth && (
                        <div
                          className={`mt-3 flex items-center gap-2 text-sm ${textMuted}`}
                        >
                          <MapPin size={14} />
                          {request.location}
                        </div>
                      )}

                      <div
                        className={`mt-3 flex items-center gap-2 text-sm ${textMuted}`}
                      >
                        <Calendar size={14} />
                        {formatDate(request.startdate)}
                        {request.enddate && (
                          <> - {formatDate(request.enddate)}</>
                        )}
                      </div>

                      <div
                        className={`mt-3 flex items-center gap-2 text-sm ${textMuted}`}
                      >
                        <Calendar size={14} />
                        Submitted {formatDate(request.createdAt)}
                      </div>

                      {paymentBanner && (
                        <PaymentDeadlineBadge banner={paymentBanner} />
                      )}

                      {isCancelled && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-sm text-gray-600">
                          <div className="font-semibold flex items-center gap-2 text-gray-700">
                            <Ban size={14} />
                            Cancelled on {formatDate(request.cancelledAt)}
                          </div>
                          {request.cancellationReason && (
                            <p className="mt-2 italic">
                              "{request.cancellationReason}"
                            </p>
                          )}
                          <button
                            onClick={() =>
                              navigate("/dashboard/vendor/apply-booth")
                            }
                            className="mt-4 text-sm font-semibold text-[#736CED] hover:text-[#4C3BCF]"
                          >
                            Apply Again
                          </button>
                        </div>
                      )}

                      {!isCancelled && (
                        <div className="mt-auto pt-4 flex items-center justify-between gap-3">
                          {statusKey === "accepted" &&
                            request.paymentStatus === "unpaid" &&
                            request.paymentDueAt &&
                            new Date(request.paymentDueAt).getTime() >
                              nowMs && (
                              <button
                                onClick={async () => {
                                  setPayingId(request._id);
                                  try {
                                    const resp = await api.post(
                                      `/vendorRequests/${request._id}/pay`,
                                      { method: "stripe" }
                                    );
                                    if (resp.data?.url) {
                                      window.location.href = resp.data.url;
                                    }
                                  } catch (e) {
                                    setToast({
                                      type: "error",
                                      message:
                                        e.response?.data?.message ||
                                        "Failed to start payment",
                                    });
                                  } finally {
                                    setPayingId(null);
                                  }
                                }}
                                disabled={Boolean(payingId) || isCancelling}
                                className="px-4 py-2 rounded-full text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-all inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                              >
                                {payingId === request._id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <span>Pay {request.price} EGP</span>
                                )}
                              </button>
                            )}
                          <button
                            onClick={() => setSelectedRequest(request)}
                            className="px-4 py-2 rounded-full text-sm font-semibold bg-[#736CED] text-white hover:bg-[#5A4BBA] transition-all inline-flex items-center gap-2"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleDirectCancel(request)}
                            disabled={
                              !cancellationState.canCancel || isCancelling
                            }
                            title={
                              cancellationState.canCancel
                                ? "Cancel request"
                                : cancellationState.reason
                            }
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition inline-flex items-center gap-2 ${
                              cancellationState.canCancel
                                ? "bg-red-600 text-white hover:bg-red-700"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                          >
                            {isCancelling && (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            )}
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      </div>

      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border ${
            toast.type === "error"
              ? "bg-rose-50 text-rose-700 border-rose-200"
              : "bg-emerald-50 text-emerald-700 border-emerald-200"
          }`}
        >
          <div className="flex items-center gap-3">
            {toast.type === "error" ? (
              <AlertCircle size={18} />
            ) : (
              <CheckCircle size={18} />
            )}
            <p className="text-sm font-semibold">{toast.message}</p>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-current hover:opacity-70"
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {successPulse && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-40">
          <div className="bg-white/80 rounded-full p-6 shadow-xl animate-pop">
            <CheckCircle className="h-10 w-10 text-emerald-500" />
          </div>
        </div>
      )}

      <DetailsModal
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
        nowMs={nowMs}
      />
    </>
  );
}
