import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { CheckCircle, XCircle, Flag, Clock, FileText, Users, Calendar, X, RefreshCw } from "lucide-react";

const COLORS = {
  primary: "#736CED",
  secondary: "#6DD3CE",
  accent: "#C14953",
  muted: "#D5CFE1",
  info: "#54C6EB"
};

const categoryColors = {
  Technical: COLORS.primary,
  Career: "#F97316",
  "Soft Skills": COLORS.accent,
};

const categoryChipStyles = {
  Technical: "bg-[#736CED] text-white",
  Career: "bg-[#F97316] text-white",
  "Soft Skills": "bg-[#C14953] text-white",
  default: "bg-[#736CED] text-white",
};

const statusConfig = {
  Pending: {
    color: COLORS.info,
    icon: Clock,
    badge: "bg-[#54C6EB] text-white border border-[#2f9ec8]/60 shadow-[0_2px_6px_rgba(84,198,235,0.35)]",
  },
  Accepted: {
    color: COLORS.secondary,
    icon: CheckCircle,
    badge: "bg-[#6DD3CE] text-slate-900 border border-[#36a69f]/50 shadow-[0_2px_6px_rgba(109,211,206,0.35)]",
  },
  Rejected: {
    color: COLORS.accent,
    icon: XCircle,
    badge: "bg-[#C14953] text-white border border-[#a63e47]/60 shadow-[0_2px_6px_rgba(193,73,83,0.35)]",
  },
  Flagged: {
    color: "#facc15",
    icon: Flag,
    badge: "bg-[#facc15] text-slate-900 border border-[#f59e0b]/50 shadow-[0_2px_6px_rgba(250,204,21,0.35)]",
  },
};

const statusButtonConfig = [
  { status: "Accepted", label: "Accept & Publish", icon: CheckCircle, variant: "primary" },
  { status: "Rejected", label: "Reject Workshop", icon: XCircle, variant: "danger" },
];

const requiresComment = new Set(["Flagged", "Rejected"]);

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-base font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

const BUTTON_VARIANTS = {
  primary:
    "bg-gradient-to-r from-[#736CED] to-[#6DD3CE] text-white shadow-[0_6px_15px_rgba(115,108,237,0.35)] hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(115,108,237,0.4)] hover:brightness-110 focus-visible:ring-[#736CED]/40",
  secondary:
    "bg-white text-[#736CED] border-2 border-[#736CED]/40 shadow-sm hover:-translate-y-0.5 hover:bg-[#736CED]/10 hover:text-[#4f4ac1] focus-visible:ring-[#736CED]/30",
  info:
    "bg-white text-[#54C6EB] border-2 border-[#54C6EB]/40 shadow-sm hover:-translate-y-0.5 hover:bg-[#54C6EB]/10 hover:text-[#2a8db0] focus-visible:ring-[#54C6EB]/30",
  danger:
    "bg-[#C14953] text-white shadow-[0_6px_15px_rgba(193,73,83,0.35)] hover:-translate-y-0.5 hover:bg-[#a63e47] focus-visible:ring-[#C14953]/40",
};

function formatDateRange(dateISO, durationHours) {
  const date = new Date(dateISO);
  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
  const durationLabel = `${durationHours} ${durationHours === 1 ? "hour" : "hours"}`;
  return `${formattedDate} • ${durationLabel}`;
}

function formatSubmittedAt(dateISO) {
  const submitted = new Date(dateISO);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(submitted);
}

function classNames(...values) {
  return values.filter(Boolean).join(" ");
}

function normalizeWorkshop(doc) {
  if (!doc) return null;

  const startDateValue = doc.startdate ? new Date(doc.startdate) : null;
  const endDateValue = doc.enddate ? new Date(doc.enddate) : null;

  let durationHours = 1;
  if (doc.startdate && doc.starttime && doc.enddate && doc.endtime) {
    const start = new Date(`${doc.startdate}T${doc.starttime}`);
    const end = new Date(`${doc.enddate}T${doc.endtime}`);
    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end > start) {
      durationHours = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60)));
    }
  } else if (startDateValue && endDateValue && endDateValue > startDateValue) {
    durationHours = Math.max(1, Math.round((endDateValue - startDateValue) / (1000 * 60 * 60)));
  }

  const agendaText = doc.fullagenda || "";
  const objectives =
    Array.isArray(doc.objectives) && doc.objectives.length
      ? doc.objectives
      : agendaText
          .split(/\r?\n+/)
          .map((line) => line.trim())
          .filter(Boolean)
          .slice(0, 5);

  return {
    id: doc._id,
    _id: doc._id,
    professorName: doc.facultyresponsibilty || "Events Office",
    department: doc.location || "Location TBA",
    title: doc.workshopname || "Untitled Workshop",
    description: doc.shortdescription || "No short description provided.",
    category:
      doc.type && doc.type !== "workshop"
        ? doc.type.charAt(0).toUpperCase() + doc.type.slice(1)
        : "Workshop",
    status: doc.status || "Pending",
    dateISO: startDateValue ? startDateValue.toISOString() : doc.createdAt,
    durationHours,
    submittedAt: doc.createdAt || doc.startdate || new Date().toISOString(),
    overview: agendaText || doc.shortdescription || "No overview provided.",
    objectives: objectives.length ? objectives : ["No detailed objectives provided."],
    audience: doc.audience || "General audience",
    attachments: [],
    lastActionComment:
      Array.isArray(doc.comments) && doc.comments.length
        ? doc.comments[doc.comments.length - 1]?.message
        : "",
    raw: doc,
  };
}

// Status Badge Component
function StatusBadge({ status }) {
  const config = statusConfig[status] ?? statusConfig.Pending;
  const Icon = config.icon;

  return (
    <span
      className={classNames(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide shadow-[0_2px_6px_rgba(0,0,0,0.15)]",
        config.badge
      )}
    >
      {Icon ? <Icon className="w-3.5 h-3.5" /> : null}
      {status}
    </span>
  );
}

// Skeleton Card Component (Missing Component)
function SkeletonCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#FDFBFF] backdrop-blur-sm border border-white/40 shadow-lg animate-pulse">
      <div className="bg-gray-300 px-6 py-5 overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-400 rounded w-1/4"></div>
            <div className="h-6 bg-gray-400 rounded w-3/4"></div>
            <div className="h-4 bg-gray-400 rounded w-1/2"></div>
          </div>
          <div className="h-6 bg-gray-400 rounded-full w-20"></div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="h-7 bg-gray-300 rounded w-3/4"></div>
          <div className="h-6 bg-gray-300 rounded-full w-16"></div>
        </div>

        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>

        <div className="flex items-center justify-between gap-4 pt-2">
          <div className="h-4 bg-gray-300 rounded w-1/3"></div>
          <div className="h-10 bg-gray-300 rounded-full w-28"></div>
        </div>
      </div>
    </div>
  );
}

// Workshop Card Component
function WorkshopCard({ workshop, onView }) {
  const [isHovered, setIsHovered] = useState(false);
  const accentColor = categoryColors[workshop.category] || COLORS.primary;
  const categoryChipClass = categoryChipStyles[workshop.category] ?? categoryChipStyles.default;

  return (
    <article
      className="relative overflow-hidden rounded-2xl bg-[#FDFBFF] backdrop-blur-sm border border-white/40 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl animate-fade-in"
      style={{
        animationDelay: `${Math.random() * 200}ms`,
        borderLeftWidth: "4px",
        borderLeftColor: accentColor
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative bg-gradient-to-r from-[#736CED] via-[#736CED]/90 to-[#6DD3CE] px-6 py-5 text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 transition-opacity duration-300"
          style={{ opacity: isHovered ? 1 : 0 }}
        ></div>
        <div className="relative flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wider text-white/70 font-semibold">Professor</p>
            <h3 className="text-lg font-bold mt-1">{workshop.professorName}</h3>
            <p className="text-sm text-white/80 mt-0.5">{workshop.department}</p>
          </div>
          <StatusBadge status={workshop.status} />
        </div>
      </div>

      <div className="px-6 py-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <h4 className="text-xl font-bold text-[#736CED] flex-1 leading-tight">{workshop.title}</h4>
          <span
            className={classNames(
              "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-[0_2px_6px_rgba(0,0,0,0.15)] whitespace-nowrap",
              categoryChipClass
            )}
          >
            {workshop.category}
          </span>
        </div>

        <p className="text-sm leading-relaxed text-gray-700 line-clamp-2">{workshop.description}</p>

        <div className="flex items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
            <Calendar className="w-4 h-4 text-[#736CED]" />
            <span>{formatDateRange(workshop.dateISO, workshop.durationHours)}</span>
          </div>
          <button
            type="button"
            onClick={() => onView(workshop)}
            className={classNames(BUTTON_BASE, BUTTON_VARIANTS.primary, "px-5 py-2.5")}
          >
            <FileText className="w-4 h-4" />
            View Details
          </button>
        </div>
      </div>
    </article>
  );
}

// Workshop Modal Component
function WorkshopModal({
  workshop,
  onClose,
  onStatusUpdate,
  comment,
  setComment,
  commentError,
  onRequestEditsSuccess,
}) {
  const [animateIn, setAnimateIn] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [requestError, setRequestError] = useState("");
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  const workshopId = workshop._id || workshop.id;

  useEffect(() => {
    setAnimateIn(true);
  }, []);

  useEffect(() => {
    setShowRequestForm(false);
    setRequestMessage("");
    setRequestError("");
    setIsSubmittingRequest(false);
  }, [workshopId]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") onClose();
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleToggleRequestForm = () => {
    setShowRequestForm((prev) => !prev);
    setRequestError("");
  };

  const handleCancelRequest = () => {
    setShowRequestForm(false);
    setRequestMessage("");
    setRequestError("");
  };

  const handleSubmitRequest = async () => {
    if (!workshopId) {
      setRequestError("Unable to determine workshop identifier. Please contact support.");
      return;
    }

    if (!requestMessage.trim()) {
      setRequestError("Please enter the requested edits before submitting.");
      return;
    }

    try {
      setIsSubmittingRequest(true);
      setRequestError("");

      await api.post(`/workshops/${workshopId}/request-edits`, {
        message: requestMessage.trim(),
      });

      setRequestMessage("");
      setShowRequestForm(false);
      if (onRequestEditsSuccess) {
        onRequestEditsSuccess("Edit request sent.");
      }
    } catch (error) {
      console.error("Failed to submit edit request:", error);
      const message =
        error?.response?.data?.message || "Failed to send edit request. Please try again.";
      setRequestError(message);
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const statusColor = statusConfig[workshop.status]?.color || COLORS.primary;
  const requestButtonText = showRequestForm ? "Close Request Edits" : "Request Edits";

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300" style={{ opacity: animateIn ? 1 : 0 }}></div>
      
      <div 
        className="relative z-10 w-full max-w-4xl my-8 transition-all duration-500"
        style={{
          opacity: animateIn ? 1 : 0,
          transform: animateIn ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)"
        }}
      >
        <div className="overflow-hidden rounded-3xl bg-white/95 backdrop-blur-xl shadow-2xl border border-white/50">
          {/* Progress bar */}
          <div className="h-1.5 w-full bg-gray-100">
            <div 
              className="h-full transition-all duration-500"
              style={{ 
                width: "100%", 
                background: `linear-gradient(90deg, ${statusColor}, ${statusColor}cc)`
              }}
            ></div>
          </div>

          {/* Header */}
          <div className="relative bg-gradient-to-r from-[#736CED] via-[#736CED]/90 to-[#6DD3CE] px-8 py-6 text-white">
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="pr-12">
              <h2 className="text-3xl font-bold mb-2">{workshop.title}</h2>
              <p className="text-sm text-white/90 flex items-center gap-2">
                <Users className="w-4 h-4" />
                {`${workshop.professorName} • ${workshop.department}`}
              </p>
              <p className="text-xs text-white/70 mt-2 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                Submitted on {formatSubmittedAt(workshop.submittedAt)}
              </p>
            </div>
          </div>

          <div className="px-8 py-8 space-y-8 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Overview Section */}
            <section className="space-y-3 animate-fade-in" style={{ animationDelay: "100ms" }}>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#736CED]" />
                <h3 className="text-lg font-bold text-[#736CED]">Workshop Overview</h3>
              </div>
              <p className="text-sm leading-relaxed text-gray-700 pl-7">
                {workshop.overview}
              </p>
            </section>

            {/* Objectives Section */}
            <section className="space-y-3 animate-fade-in" style={{ animationDelay: "200ms" }}>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[#736CED]" />
                <h3 className="text-lg font-bold text-[#736CED]">Learning Objectives</h3>
              </div>
              <ul className="space-y-2 pl-7">
                {workshop.objectives.map((objective, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-gray-700">
                    <span 
                      className="mt-1.5 h-2 w-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS.secondary }}
                    ></span>
                    <span className="leading-relaxed">{objective}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Info Grid */}
            <div className="grid gap-4 sm:grid-cols-2 animate-fade-in" style={{ animationDelay: "300ms" }}>
              <div className="rounded-2xl border border-[#736CED]/20 bg-gradient-to-br from-[#736CED]/5 to-[#6DD3CE]/5 backdrop-blur-sm px-6 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-[#736CED]" />
                  <p className="font-bold text-[#736CED] text-sm">Target Audience</p>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{workshop.audience}</p>
              </div>
              <div className="rounded-2xl border border-[#736CED]/20 bg-gradient-to-br from-[#6DD3CE]/5 to-[#736CED]/5 backdrop-blur-sm px-6 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-[#736CED]" />
                  <p className="font-bold text-[#736CED] text-sm">Proposed Schedule</p>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {formatDateRange(workshop.dateISO, workshop.durationHours)}
                </p>
              </div>
            </div>

            {/* Attachments */}
            {workshop.attachments?.length > 0 && (
              <section className="space-y-3 animate-fade-in" style={{ animationDelay: "400ms" }}>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#736CED]" />
                  <h3 className="text-lg font-bold text-[#736CED]">Attached Materials</h3>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {workshop.attachments.map((attachment) => (
                    <a
                      key={attachment.id}
                      href={attachment.url}
                      className="flex flex-col gap-2 rounded-2xl border border-[#736CED]/20 bg-white/80 backdrop-blur-sm px-5 py-4 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-[#736CED]/40 focus:outline-none focus:ring-2 focus:ring-[#736CED]/40"
                    >
                      <span className="font-semibold text-[#736CED]">{attachment.label}</span>
                      <span className="text-xs text-gray-500">{attachment.type}</span>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Status Update Section */}
            <section className="space-y-4 pt-4 border-t border-gray-200 animate-fade-in" style={{ animationDelay: "500ms" }}>
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-[#736CED]" />
                <h3 className="text-lg font-bold text-[#736CED]">Update Status</h3>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {statusButtonConfig.map((config) => {
                  const Icon = config.icon;
                  return (
                    <button
                      key={config.status}
                      type="button"
                      onClick={() => onStatusUpdate(config.status)}
                      className={classNames(
                        BUTTON_BASE,
                        BUTTON_VARIANTS[config.variant] ?? BUTTON_VARIANTS.primary
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {config.label}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleToggleRequestForm}
                className={classNames(
                  BUTTON_BASE,
                  BUTTON_VARIANTS.info,
                  "w-full sm:w-auto"
                )}
              >
                <Flag className="w-4 h-4" />
                {requestButtonText}
              </button>

              {showRequestForm && (
                <div className="rounded-2xl border border-[#54C6EB]/30 bg-gradient-to-br from-white via-white to-[#54C6EB]/10 px-6 py-5 shadow-[0_4px_12px_rgba(84,198,235,0.15)] space-y-4">
                  <label className="block">
                    <span className="text-sm font-semibold text-[#2a8db0]">
                      Share the edits you'd like the professor to make
                    </span>
                    <textarea
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                      rows={4}
                      placeholder="Highlight what needs to change before approval..."
                      className="mt-2 w-full rounded-2xl border border-[#54C6EB]/40 bg-white/90 px-4 py-3 text-sm text-gray-700 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#54C6EB]/40"
                    />
                  </label>
                  {requestError && (
                    <p className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" />
                      {requestError}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleSubmitRequest}
                      disabled={isSubmittingRequest}
                      className={classNames(
                        BUTTON_BASE,
                        BUTTON_VARIANTS.primary,
                        "w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
                      )}
                    >
                      {isSubmittingRequest ? "Sending..." : "Submit Request"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelRequest}
                      disabled={isSubmittingRequest}
                      className={classNames(
                        BUTTON_BASE,
                        BUTTON_VARIANTS.secondary,
                        "w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
                      )}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <label className="block">
                <span className="text-sm font-semibold text-gray-700">Comment {requiresComment.has(workshop.status) ? "(required)" : "(optional)"}</span>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  placeholder="Add context for the professor or future reviewers..."
                  className={classNames(
                    "mt-2 w-full rounded-2xl border bg-white/80 backdrop-blur-sm px-4 py-3 text-sm text-gray-700 transition-all focus:outline-none focus:ring-2",
                    commentError 
                      ? "border-rose-300 focus:ring-rose-300" 
                      : "border-gray-300 focus:ring-[#736CED]/40 focus:border-[#736CED]/40"
                  )}
                />
                {commentError && (
                  <p className="mt-2 text-xs font-semibold text-rose-600 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" />
                    {commentError}
                  </p>
                )}
              </label>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

// Toast Component
function Toast({ feedback, onDismiss }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDismiss, 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const config = statusConfig[feedback.tone];
  const Icon = config?.icon || CheckCircle;

  return (
    <div 
      className="fixed bottom-6 right-6 z-[60] transition-all duration-300"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(20px)"
      }}
    >
      <div 
        className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/95 backdrop-blur-xl shadow-2xl border border-white/50 max-w-sm"
        style={{
          background: `linear-gradient(135deg, ${config?.color}15, white)`
        }}
      >
        <Icon className="w-5 h-5 flex-shrink-0" style={{ color: config?.color }} />
        <span className="text-sm font-semibold text-gray-800">{feedback.message}</span>
      </div>
    </div>
  );
}

// Main Component
export default function WorkshopRequests() {
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All");
  const [workshops, setWorkshops] = useState([]);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [modalComment, setModalComment] = useState("");
  const [commentError, setCommentError] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch workshops from backend
  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        setIsLoading(true);
        const res = await api.get("/workshops/getAllWorkshops");
        const payload = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.workshops)
          ? res.data.workshops
          : [];
        const normalized = payload
          .map((item) => normalizeWorkshop(item))
          .filter(Boolean);

        setWorkshops(normalized);
      } catch (err) {
        console.error("Error fetching workshops:", err);
        setWorkshops([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkshops();
  }, []);

  useEffect(() => {
    if (!selectedWorkshop) {
      setModalComment("");
      setCommentError("");
      return;
    }
    const current = workshops.find((item) => item.id === selectedWorkshop.id);
    setModalComment(current?.lastActionComment ?? "");
    setCommentError("");
  }, [selectedWorkshop, workshops]);

  const categories = useMemo(() => {
    const unique = new Set(workshops.map((item) => item.category));
    return ["All Categories", ...Array.from(unique)];
  }, [workshops]);

  const filteredWorkshops = useMemo(() => {
    return workshops.filter((workshop) => {
      const matchCategory = categoryFilter === "All Categories" || workshop.category === categoryFilter;
      const matchStatus = statusFilter === "All" || workshop.status === statusFilter;
      return matchCategory && matchStatus;
    });
  }, [workshops, categoryFilter, statusFilter]);

  const hasActiveFilters = categoryFilter !== "All Categories" || statusFilter !== "All";

  const resetFilters = () => {
    setCategoryFilter("All Categories");
    setStatusFilter("All");
  };

  const handleStatusUpdate = async (nextStatus) => {
    if (!selectedWorkshop) return;

    if (requiresComment.has(nextStatus) && !modalComment.trim()) {
      setCommentError("Please add a comment before completing this action.");
      return;
    }

    try {
      // Backend integration: PATCH request
      // await fetch(`/api/workshops/${selectedWorkshop.id}`, {
      //   method: "PATCH",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     status: nextStatus,
      //     comment: modalComment.trim(),
      //   }),
      // });

      // Optimistic update
      setWorkshops((prev) =>
        prev.map((item) =>
          item.id === selectedWorkshop.id
            ? {
                ...item,
                status: nextStatus,
                lastActionComment: modalComment.trim(),
                lastUpdatedAt: new Date().toISOString()
              }
            : item
        )
      );

      const messages = {
        Accepted: "Workshop accepted and published successfully!",
        Flagged: "Workshop flagged for review with comments.",
        Rejected: "Workshop rejected with feedback.",
        Pending: "Workshop status set to pending."
      };

      setFeedback({ tone: nextStatus, message: messages[nextStatus] });
      setSelectedWorkshop(null);
    } catch (err) {
      console.error("Error updating workshop:", err);
      setFeedback({ tone: "Rejected", message: "Failed to update workshop. Please try again." });
    }
  };

  const handleRequestEditsSuccess = (message = "Edit request sent.") => {
    setFeedback({ tone: "Flagged", message });
  };

  return (
    <div className="min-h-screen w-full px-6 py-10" style={{ backgroundColor: COLORS.muted }}>
      <div className="mx-auto w-full max-w-7xl">
        {/* Hero Header */}
        <header className="text-center space-y-3 mb-12 animate-fade-in">
          <h1 className="text-5xl sm:text-6xl font-black leading-tight">
            <span className="text-[#736CED]">Workshops & Approvals.</span>
            <br />
            <span 
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`
              }}
            >
              Streamlined.
            </span>
          </h1>
          <div 
            className="h-1 w-32 mx-auto rounded-full animate-pulse"
            style={{
              background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.secondary})`
            }}
          ></div>
          <p className="text-base text-gray-600 max-w-2xl mx-auto leading-relaxed pt-2">
            <span className="font-semibold text-[#736CED]">Review, approve, or reject workshops in one place.
              <br />
                          Fast. Organized. Effortless.
            </span>
          </p>
        </header>

        {/* Filters */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-bold text-[#736CED] flex items-center gap-2">
              Category
            </span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded-xl border-2 border-[#736CED]/20 bg-white/80 backdrop-blur-sm px-4 py-3 text-sm font-semibold text-[#736CED] shadow-sm transition-all focus:border-[#736CED]/50 focus:outline-none focus:ring-2 focus:ring-[#736CED]/30 hover:border-[#736CED]/40"
            >
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-bold text-[#736CED]">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border-2 border-[#736CED]/20 bg-white/80 backdrop-blur-sm px-4 py-3 text-sm font-semibold text-[#736CED] shadow-sm transition-all focus:border-[#736CED]/50 focus:outline-none focus:ring-2 focus:ring-[#736CED]/30 hover:border-[#736CED]/40"
            >
              {["All", "Pending", "Accepted", "Rejected", "Flagged"].map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </label>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-[#C14953]/30 bg-white/80 backdrop-blur-sm text-sm font-bold text-[#C14953] transition-all hover:bg-[#C14953]/10 hover:border-[#C14953]/50 focus:outline-none focus:ring-2 focus:ring-[#C14953]/40 animate-fade-in"
            >
              <RefreshCw className="w-4 h-4" />
              Reset Filters
            </button>
          )}
        </section>

        {/* Workshop Cards */}
        <section className="grid gap-6 lg:grid-cols-2">
          {isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : filteredWorkshops.length ? (
            filteredWorkshops.map((workshop) => (
              <WorkshopCard 
                key={workshop.id} 
                workshop={workshop} 
                onView={setSelectedWorkshop}
              />
            ))
          ) : (
            <div className="col-span-full rounded-3xl border-2 border-dashed border-[#736CED]/30 bg-[#FDFBFF] backdrop-blur-sm px-8 py-16 text-center">
              <div className="flex flex-col items-center gap-3">
                <FileText className="w-16 h-16 text-[#736CED]/30" />
                <p className="text-lg font-semibold text-[#736CED]/70">No workshops match the current filters</p>
                <p className="text-sm text-gray-500">Try adjusting your search criteria</p>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Modal */}
      {selectedWorkshop && (
        <WorkshopModal
          workshop={selectedWorkshop}
          onClose={() => setSelectedWorkshop(null)}
          onStatusUpdate={handleStatusUpdate}
          comment={modalComment}
          setComment={setModalComment}
          commentError={commentError}
          onRequestEditsSuccess={handleRequestEditsSuccess}
        />
      )}

      {/* Toast */}
      {feedback && <Toast feedback={feedback} onDismiss={() => setFeedback(null)} />}

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
