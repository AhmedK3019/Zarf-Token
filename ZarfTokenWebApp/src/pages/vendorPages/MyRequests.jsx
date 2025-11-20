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
    const [hours, minutes] = timeValue.split(":").map((part) => parseInt(part, 10));
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
  if (request?.eventStartAt) return toDate(request.eventStartAt);
  if (request?.isBazarBooth && request?.bazarId?.startdate) {
    return combineDateParts(
      request.bazarId.startdate,
      request.bazarId.starttime || request.bazarId.startTime
    );
  }
  return null;
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
      className={`mt-3 px-3 py-2 rounded-xl border text-sm font-semibold flex items-center gap-2 ${palette[banner.variant]}`}
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
  const cancellationDate = request.cancelledAt && formatDate(request.cancelledAt);

  const infoBlock = (
    <>
      {request.boothname && (
        <div className="flex items-start gap-3">
          <Building className="mt-1 text-[#736CED]" size={16} />
          <div>
            <span className="font-semibold">Booth Name:</span> {request.boothname}
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
            <span className="font-semibold">Duration:</span> {request.duration} weeks
          </div>
        </div>
      )}
      {request.location && (
        <div className="flex items-start gap-3">
          <MapPin className="mt-1 text-[#736CED]" size={16} />
          <div>
            <span className="font-semibold">
              {request.isBazarBooth ? "Requested Location" : "Platform Location"}:
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
              <span className="font-semibold text-gray-700">My Participations</span>
              <ChevronRight className="h-3 w-3" />
              <span>{request.boothname || request.bazarId?.bazaarname || "Details"}</span>
            </div>
            <h2 className="text-2xl font-bold text-[#4C3BCF]">
              {request.boothname || (request.isBazarBooth ? "Bazaar Booth Request" : "Platform Booth Request")}
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
            {request.isBazarBooth && request.bazarId?.startdate ? (
              <>
                {infoBlock}
                <div className="flex items-start gap-3">
                  <Calendar className="mt-1 text-[#736CED]" size={16} />
                  <div>
                    <span className="font-semibold">Event Starts:</span>{" "}
                    {formatDateTime(
                      request.bazarId.startdate,
                      request.bazarId.starttime
                    )}
                  </div>
                </div>
                {request.bazarId.enddate && (
                  <div className="flex items-start gap-3">
                    <Clock className="mt-1 text-[#736CED]" size={16} />
                    <div>
                      <span className="font-semibold">Event Ends:</span>{" "}
                      {formatDateTime(
                        request.bazarId.enddate,
                        request.bazarId.endtime
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              infoBlock
            )}
          </div>
          {paymentBanner && (
            <PaymentDeadlineBadge banner={paymentBanner} />
          )}
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

function CancellationDialog({
  open,
  request,
  reason,
  onReasonChange,
  onClose,
  onConfirm,
  loading,
}) {
  if (!open || !request) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4 animate-slide-up">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-rose-500 mt-1" />
          <div>
            <h3 className="text-xl font-semibold text-[#4C3BCF]">
              Cancel participation?
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Once cancelled, this request will move to the Cancelled tab. You can apply again at any time.
            </p>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cancellation reason (optional)
          </label>
          <textarea
            className="w-full rounded-lg border-2 border-gray-200 focus:border-[#736CED] focus:ring-[#736CED] text-sm p-3"
            rows={3}
            placeholder="Helps us understand why you're cancelling..."
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            Keep request
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-rose-500 text-white font-semibold hover:bg-rose-600 inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Cancel participation
          </button>
        </div>
      </div>
    </div>
  );
}

const emptyMessages = {
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
  const [statusTab, setStatusTab] = useState("pending");
  const [viewFilter, setViewFilter] = useState("all");
  const [nowMs, setNowMs] = useState(Date.now());
  const [cancelDialog, setCancelDialog] = useState({
    open: false,
    request: null,
    reason: "",
  });
  const [cancellingId, setCancellingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [successPulse, setSuccessPulse] = useState(false);
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
  }, [user]);

  const statusCounts = useMemo(() => {
    return requests.reduce(
      (acc, request) => {
        const key = mapStatusToTabKey(request.status);
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      { pending: 0, accepted: 0, rejected: 0, cancelled: 0 }
    );
  }, [requests]);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      if (mapStatusToTabKey(request.status) !== statusTab) return false;
      if (viewFilter === "bazaar" && !request.isBazarBooth) return false;
      if (viewFilter === "platform" && request.isBazarBooth) return false;
      return true;
    });
  }, [requests, statusTab, viewFilter]);

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

  const handleOpenCancel = (request) => {
    setCancelDialog({ open: true, request, reason: "" });
  };

  const closeCancelDialog = () => {
    setCancelDialog({ open: false, request: null, reason: "" });
    setCancellingId(null);
  };

  const handleConfirmCancel = async () => {
    if (!cancelDialog.request) return;
    const target = cancelDialog.request;
    setCancellingId(target._id);
    try {
      await api.delete(`/vendorRequests/${target._id}/cancel`, {
        data: cancelDialog.reason
          ? { reason: cancelDialog.reason.trim() }
          : {},
      });
      setRequests((prev) =>
        prev.map((item) =>
          item._id === target._id
            ? {
                ...item,
                status: "Cancelled",
                paymentStatus: "cancelled",
                cancelledAt: new Date().toISOString(),
                cancellationReason: cancelDialog.reason.trim() || "Cancelled by vendor",
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
      closeCancelDialog();
    }
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

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
      <div className="min-h-screen w-full bg-muted text-[#1F1B3B] font-sans">
        <main className="flex w-full flex-1 flex-col items-center px-4 sm:px-6 py-8">
          <div className="w-full max-w-6xl">
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setStatusTab(tab.key)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all border ${
                    statusTab === tab.key
                      ? "bg-[#736CED] text-white border-transparent shadow"
                      : "bg-white text-[#312A68] border-gray-200 hover:border-[#736CED]/40"
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 text-xs opacity-80">
                    ({statusCounts[tab.key] || 0})
                  </span>
                </button>
              ))}
            </div>

            <div className="mb-8 flex justify-center flex-wrap gap-3 bg-white/70 p-2 rounded-full shadow-inner">
              {VIEW_FILTERS.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setViewFilter(filter.key)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                    viewFilter === filter.key
                      ? "bg-[#4C3BCF] text-white shadow"
                      : "text-[#312A68] hover:bg-white"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block h-12 w-12 border-4 border-[#736CED] border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-[#312A68]">Loading your requests...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-500 bg-white rounded-2xl border border-red-100">
                <p>{error}</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-16 bg-white/70 rounded-2xl border border-dashed border-gray-200">
                <p className="text-lg text-[#312A68]">
                  {emptyMessages[statusTab]}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredRequests.map((request) => {
                  const statusKey = mapStatusToTabKey(request.status);
                  const cancellationState = getCancellationState(request, nowMs);
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
                      className={`bg-white rounded-2xl p-6 flex flex-col min-h-[280px] border transition hover:shadow-lg ${
                        isCancelled
                          ? "border-dashed border-gray-200 opacity-80"
                          : cancellationState.canCancel
                          ? "border-emerald-200 shadow-emerald-100"
                          : "border-gray-100"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-[#4C3BCF]">
                            {request.boothname ||
                              (request.isBazarBooth
                                ? "Bazaar Booth Request"
                                : "Platform Booth Request")}
                          </h3>
                          {request.isBazarBooth && request.bazarId?.bazaarname && (
                            <p className="text-sm font-semibold text-[#736CED]">
                              at {request.bazarId.bazaarname}
                            </p>
                          )}
                        </div>
                        <StatusBadge status={request.status} />
                      </div>

                      <div className={`flex flex-wrap gap-4 text-sm ${textMuted}`}>
                        <span className="flex items-center gap-1">
                          <Square size={14} />
                          {request.boothSize}
                        </span>
                        {request.duration && !request.isBazarBooth && (
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {request.duration} weeks
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users size={14} />
                          {request.people?.length || 0}
                        </span>
                      </div>

                      {request.bazarId?.location && (
                        <div className={`flex items-center gap-2 mt-2 text-sm ${textMuted}`}>
                          <MapPin size={14} />
                          {request.bazarId.location}
                        </div>
                      )}
                      {request.location && !request.isBazarBooth && (
                        <div className={`flex items-center gap-2 mt-2 text-sm ${textMuted}`}>
                          <MapPin size={14} />
                          {request.location}
                        </div>
                      )}
                      <div className={`flex items-center gap-2 mt-2 text-sm ${textMuted}`}>
                        <Calendar size={14} />
                        Submitted {formatDate(request.createdAt)}
                      </div>

                      {paymentBanner && <PaymentDeadlineBadge banner={paymentBanner} />}

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
                          <button
                            onClick={() => setSelectedRequest(request)}
                            className="px-4 py-2 rounded-full text-sm font-semibold bg-[#736CED] text-white hover:bg-[#5A4BBA] transition-all inline-flex items-center gap-2"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleOpenCancel(request)}
                            disabled={!cancellationState.canCancel || isCancelling}
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
          </div>
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

      <CancellationDialog
        open={cancelDialog.open}
        request={cancelDialog.request}
        reason={cancelDialog.reason}
        onReasonChange={(value) =>
          setCancelDialog((prev) => ({ ...prev, reason: value }))
        }
        onClose={closeCancelDialog}
        onConfirm={handleConfirmCancel}
        loading={Boolean(cancellingId)}
      />

      <DetailsModal
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
        nowMs={nowMs}
      />
    </>
  );
}
