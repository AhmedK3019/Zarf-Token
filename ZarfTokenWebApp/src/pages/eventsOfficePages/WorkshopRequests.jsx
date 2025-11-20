import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import {
  CheckCircle,
  XCircle,
  Flag,
  Clock,
  FileText,
  Users,
  Calendar,
  X,
  RefreshCw,
  MapPin,
  HandCoins,
} from "lucide-react";

const COLORS = {
  primary: "#3B82F6",
  secondary: "#0EA5E9",
  accent: "#C14953",
  muted: "#f5f5f7",
  info: "#64748B",
};

const statusConfig = {
  Pending: {
    color: COLORS.info,
    icon: Clock,
    badge: "bg-gray-100 text-gray-700 border border-gray-200",
  },
  Approved: {
    color: COLORS.secondary,
    icon: CheckCircle,
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  Rejected: {
    color: COLORS.accent,
    icon: XCircle,
    badge: "bg-rose-50 text-rose-700 border border-rose-200",
  },
  // Added this for the toast message on request edits
  Flagged: {
    color: COLORS.info,
    icon: Flag,
  },
};

const statusButtonConfig = [
  {
    status: "Approved",
    label: "Accept & Publish",
    icon: CheckCircle,
    variant: "primary",
  },
  {
    status: "Rejected",
    label: "Reject Workshop",
    icon: XCircle,
    variant: "danger",
  },
];

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-base font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

const BUTTON_VARIANTS = {
  primary:
    "border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 focus-visible:ring-sky-200",
  secondary:
    "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-200",
  info: "border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 focus-visible:ring-sky-200",
  danger:
    "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 focus-visible:ring-rose-200",
};

function formatDateRange(dateISO, durationDays) {
  const date = new Date(dateISO);
  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
  const durationLabel = `${durationDays} ${
    durationDays === 1 ? "day" : "days"
  }`;
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

  return {
    id: doc._id,
    _id: doc._id,
    professorName:
      doc.createdBy.firstname + " " + doc.createdBy.lastname || "Events Office",
    department: doc.facultyresponsibilty || "GUC",
    title: doc.workshopname || "Untitled Workshop",
    description: doc.shortdescription || "No short description provided.",
    category: doc.shortdescription || "Uncategorized",
    status: doc.status || "Pending",
    location: doc.location || "TBD",
    dateISO: startDateValue ? startDateValue.toISOString() : doc.createdAt,
    durationDays:
      endDateValue && startDateValue
        ? Math.max(
            1,
            Math.round((endDateValue - startDateValue) / (1000 * 60 * 60 * 24))
          )
        : 0,
    submittedAt: doc.createdAt || doc.startdate || new Date().toISOString(),
    overview: doc.shortdescription || "No overview provided.",
    professors: doc.professorsparticipating || [],
    lastActionComment:
      Array.isArray(doc.comments) && doc.comments.length
        ? doc.comments[doc.comments.length - 1]?.message
        : doc.comments || "",
    raw: doc,
    createdBy: doc.createdBy,
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
  return (
    <article
      className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md animate-fade-in"
      style={{ animationDelay: `${Math.random() * 200}ms` }}
    >
      <div className="px-6 py-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
            <span className="h-2 w-2 rounded-full bg-sky-500" />
            Workshop
          </div>
          <StatusBadge status={workshop.status} />
        </div>

        <div className="flex items-start justify-between gap-3">
          <h4 className="text-xl font-bold text-gray-900 flex-1 leading-tight">
            {workshop.title}
          </h4>
          <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-sky-50 text-sky-700 border border-sky-100">
            {workshop.location}
          </span>
        </div>

        <p className="text-sm leading-relaxed text-gray-700 line-clamp-2">
          {workshop.description}
        </p>

        {workshop.raw.currentMessage.awaitingResponseFrom === "Professor" && (
          <p className="text-xs text-gray-500 italic">
            Awaiting response from Professor On requested edits
          </p>
        )}

        {workshop.raw.currentMessage.awaitingResponseFrom ===
          "Event office" && (
          <p className="text-xs text-gray-500 italic">
            {workshop.raw.currentMessage.message}
          </p>
        )}

        <div className="flex items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
            <Calendar className="w-4 h-4 text-sky-600" />
            <span>
              {formatDateRange(workshop.dateISO, workshop.durationDays)}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onView(workshop)}
            className={classNames(
              BUTTON_BASE,
              BUTTON_VARIANTS.primary,
              "px-5 py-2.5"
            )}
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
  // MODIFIED: Split props for clarity
  onApprove,
  onReject,
  onRequestEditsSuccess,
}) {
  const [animateIn, setAnimateIn] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [requestError, setRequestError] = useState("");
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  // --- NEW STATE for the approval process ---
  const [isApproving, setIsApproving] = useState(false);
  const [allowedUsers, setAllowedUsers] = useState([]);
  const [approvalError, setApprovalError] = useState("");
  // Define your user groups here
  const USER_GROUPS = ["Student", "Professor", "TA", "Staff"];
  // --- END OF NEW STATE ---

  const workshopId = workshop._id || workshop.id;

  useEffect(() => {
    setAnimateIn(true);
  }, []);

  useEffect(() => {
    // Reset all local forms when workshop changes
    setShowRequestForm(false);
    setRequestMessage("");
    setRequestError("");
    setIsSubmittingRequest(false);
    setIsApproving(false);
    setAllowedUsers([]);
    setApprovalError("");
  }, [workshopId]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // --- NEW HANDLER for user group checkboxes ---
  const handleAllowedUsersChange = (e) => {
    const { value, checked } = e.target;
    let updatedUsers = [...allowedUsers];

    if (checked) {
      updatedUsers.push(value);
    } else {
      updatedUsers = updatedUsers.filter((user) => user !== value);
    }

    setAllowedUsers(updatedUsers);
    setApprovalError(""); // Clear error on change
  };
  // --- END OF NEW HANDLER ---

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
      setRequestError(
        "Unable to determine workshop identifier. Please contact support."
      );
      return;
    }

    if (!requestMessage.trim()) {
      setRequestError("Please enter the requested edits before submitting.");
      return;
    }

    try {
      setIsSubmittingRequest(true);
      setRequestError("");

      await api.patch(`/workshops/requestEdits/${workshopId}`, {
        comments: requestMessage.trim(),
      });

      setRequestMessage("");
      setShowRequestForm(false);
      if (onRequestEditsSuccess) {
        onRequestEditsSuccess("Edit request sent.");
      }
    } catch (error) {
      console.error("Failed to submit edit request:", error);
      const message =
        error?.response?.data?.message ||
        "Failed to send edit request. Please try again.";
      setRequestError(message);
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const statusColor = statusConfig[workshop.status]?.color || COLORS.primary;
  const requestButtonText = showRequestForm
    ? "Close Request Edits"
    : "Request Edits";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300"
        style={{ opacity: animateIn ? 1 : 0 }}
      ></div>

      <div
        className="relative z-10 w-full max-w-4xl my-8 transition-all duration-500"
        style={{
          opacity: animateIn ? 1 : 0,
          transform: animateIn
            ? "translateY(0) scale(1)"
            : "translateY(20px) scale(0.95)",
        }}
      >
        <div className="overflow-hidden rounded-3xl bg-white/95 backdrop-blur-xl shadow-2xl border border-white/50">
          {/* Progress bar */}
          <div className="h-1.5 w-full bg-gray-100">
            <div
              className="h-full transition-all duration-500"
              style={{
                width: "100%",
                background: `linear-gradient(90deg, ${statusColor}, ${statusColor}cc)`,
              }}
            ></div>
          </div>

          {/* Header */}
          <div className="relative bg-[#001233] px-8 py-6 text-white">
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
            {/* ... (Overview, Agenda, Location, Capacity, Funding, Info Grid sections are all unchanged) ... */}
            {/* Overview Section */}
            <section
              className="space-y-3 animate-fade-in"
              style={{ animationDelay: "100ms" }}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-600" />
                <h3 className="text-lg font-bold text-gray-900">
                  Workshop Overview
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-gray-700 pl-7">
                {workshop.overview}
              </p>
            </section>

            {/* Objectives Section */}
            <section
              className="space-y-3 animate-fade-in"
              style={{ animationDelay: "200ms" }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-sky-600" />
                <h3 className="text-lg font-bold text-gray-900">
                  Full Agenda
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-gray-700 pl-7 whitespace-pre-line">
                {workshop.raw.fullagenda ||
                  "No detailed agenda provided by the professor."}
              </p>
            </section>

            {/* Location Section */}
            <section
              className="space-y-3 animate-fade-in"
              style={{ animationDelay: "250ms" }}
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-sky-600" />
                <h3 className="text-lg font-bold text-gray-900">Location</h3>
              </div>
              <p className="text-sm leading-relaxed text-gray-700 pl-7">
                {workshop.location || "No location provided by the professor."}
              </p>
            </section>
            {/* Capacity Section */}
            <section
              className="space-y-3 animate-fade-in"
              style={{ animationDelay: "250ms" }}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-600" />
                <h3 className="text-lg font-bold text-gray-900">Capacity</h3>
              </div>
              <p className="text-sm leading-relaxed text-gray-700 pl-7">
                {workshop.raw.capacity ||
                  "No capacity provided by the professor."}
              </p>
            </section>

            {/* Funding Section */}
            <section
              className="space-y-3 animate-fade-in"
              style={{ animationDelay: "250ms" }}
            >
              <div className="flex items-center gap-2">
                <HandCoins className="w-4 h-4 text-sky-600" />
                <h3 className="text-lg font-bold text-gray-900">Funding</h3>
              </div>
              <p className="text-sm leading-relaxed text-gray-700 pl-7">
                {workshop.raw.fundingsource === "GUC"
                  ? "Funded By GUC"
                  : "External Funding"}
              </p>
              <p className="text-sm leading-relaxed text-gray-700 pl-7">
                {workshop.raw.requiredFunding
                  ? `Required Budget: $${workshop.raw.requiredFunding}`
                  : "No required budget provided by the professor."}
              </p>
              <p className="text-sm leading-relaxed text-gray-700 pl-7">
                {workshop.raw.extrafundingrequired
                  ? `Extra Required Resources: $${workshop.raw.extrafundingrequired}`
                  : "No extra required resources."}
              </p>
            </section>

            {/* Info Grid */}
            <div
              className="grid gap-4 sm:grid-cols-3 animate-fade-in"
              style={{ animationDelay: "300ms" }}
            >
              <div className="rounded-2xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-sky-600" />
                  <p className="font-bold text-gray-900 text-sm">
                    Professors Participating
                  </p>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {workshop.professors.map((professor) => (
                    <span key={professor._id}>
                      {professor.firstname} {professor.lastname}
                    </span>
                  ))}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-sky-600" />
                  <p className="font-bold text-gray-900 text-sm">
                    Proposed Schedule
                  </p>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  From: {new Date(workshop.raw.startdate).toLocaleDateString()}{" "}
                  {workshop.raw.starttime &&
                    ` - ${new Date(
                      `1970-01-01T${workshop.raw.starttime}`
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`}
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  To: {new Date(workshop.raw.enddate).toLocaleDateString()}{" "}
                  {workshop.raw.endtime &&
                    ` - ${new Date(
                      `1970-01-01T${workshop.raw.endtime}`
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`}
                </p>
                {/*Registration Deadline*/}
                <p className="text-sm text-red-700 leading-relaxed">
                  Registration Deadline:{" "}
                  {workshop.raw.registrationDeadline
                    ? new Date(
                        workshop.raw.registrationDeadline
                      ).toLocaleDateString()
                    : "No registration deadline provided by the professor."}
                </p>
              </div>
            </div>

            {/* --- THIS IS THE MODIFIED STATUS UPDATE SECTION --- */}
            <section
              className="space-y-4 pt-4 border-t border-gray-200 animate-fade-in"
              style={{ animationDelay: "500ms" }}
            >
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-sky-600" />
                <h3 className="text-lg font-bold text-gray-900">
                  Update Status
                </h3>
              </div>

              {/* Show default buttons ONLY if status is Pending and we are NOT approving */}
              {!isApproving && workshop.status === "Pending" && (
                <div className="grid gap-3 sm:grid-cols-3">
                  {statusButtonConfig.map((config) => {
                    const Icon = config.icon;

                    // This handler now routes the click
                    const handleClick = () => {
                      if (config.status === "Approved") {
                        // Don't submit yet, show the user selection form
                        setIsApproving(true);
                        setApprovalError("");
                      } else if (config.status === "Rejected") {
                        // Reject immediately
                        onReject(config.status);
                      }
                    };

                    return (
                      <button
                        key={config.status}
                        type="button"
                        onClick={handleClick} // Use the new local handler
                        className={classNames(
                          BUTTON_BASE,
                          BUTTON_VARIANTS[config.variant] ??
                            BUTTON_VARIANTS.primary
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        {config.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* --- NEW: Show this form when 'isApproving' is true --- */}
              {isApproving && (
                <div className="rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-sm space-y-4">
                  <p className="text-base font-bold text-gray-900">
                    Who can view this workshop?
                  </p>
                  <p className="text-sm text-gray-600">
                    Select all user groups that should be able to see and
                    register for this workshop.
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    {USER_GROUPS.map((group) => (
                      <label
                        key={group}
                        className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        <input
                          type="checkbox"
                          value={group}
                          onChange={handleAllowedUsersChange}
                          checked={allowedUsers.includes(group)}
                        className="rounded text-sky-600 focus:ring-sky-500"
                        />
                        <span className="text-sm font-semibold text-gray-700">
                          {group}
                        </span>
                      </label>
                    ))}
                  </div>

                  {approvalError && (
                    <p className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" />
                      {approvalError}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (allowedUsers.length === 0) {
                          setApprovalError(
                            "Please select at least one user group."
                          );
                          return;
                        }
                        // Now call the onApprove prop with the new data
                        onApprove("Approved", allowedUsers);
                      }}
                      className={classNames(
                        BUTTON_BASE,
                        BUTTON_VARIANTS.primary,
                        "w-full sm:w-auto"
                      )}
                    >
                      Confirm & Publish
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsApproving(false)} // Go back
                      className={classNames(
                        BUTTON_BASE,
                        BUTTON_VARIANTS.secondary,
                        "w-full sm:w-auto"
                      )}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Show Request Edits button ONLY if Pending and NOT approving */}
              {workshop.status === "Pending" &&
                !isApproving &&
                workshop.raw.currentMessage.awaitingResponseFrom !==
                  "Professor" && (
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
                )}

              {/* Show this if workshop is already decided */}
              {workshop.status !== "Pending" && (
                <p className="text-sm text-gray-700">
                  This workshop has been{" "}
                  <span className="font-semibold">{workshop.status}</span>.
                </p>
              )}

              {/* Show this if awaiting professor */}
              {workshop.raw.currentMessage.awaitingResponseFrom ===
                "Professor" && (
                <p className="text-xs text-gray-500 italic">
                  Awaiting response from Professor On requested edits
                </p>
              )}

              {/* The "Request Edits" form itself */}
              {showRequestForm && (
                <div className="rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-sm space-y-4">
                  <label className="block">
                    <span className="text-sm font-semibold text-gray-900">
                      Share the edits you'd like the professor to make
                    </span>
                    <textarea
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                      rows={4}
                      placeholder="Highlight what needs to change before approval..."
                      className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#001233]/40"
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
        transform: isVisible ? "translateY(0)" : "translateY(20px)",
      }}
    >
      <div
        className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/95 backdrop-blur-xl shadow-2xl border border-white/50 max-w-sm"
        style={{
          background: `linear-gradient(135deg, ${config?.color}15, white)`,
        }}
      >
        <Icon
          className="w-5 h-5 flex-shrink-0"
          style={{ color: config?.color }}
        />
        <span className="text-sm font-semibold text-gray-800">
          {feedback.message}
        </span>
      </div>
    </div>
  );
}

// Main Component
export default function WorkshopRequests() {
  const [statusFilter, setStatusFilter] = useState("All");
  const [workshops, setWorkshops] = useState([]);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [modalComment, setModalComment] = useState("");
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
      return;
    }
    const current = workshops.find((item) => item.id === selectedWorkshop.id);
    setModalComment(current?.lastActionComment ?? "");
  }, [selectedWorkshop, workshops]);

  const filteredWorkshops = useMemo(() => {
    return workshops.filter((workshop) => {
      const matchStatus =
        statusFilter === "All" || workshop.status === statusFilter;
      return matchStatus;
    });
  }, [workshops, statusFilter]);

  const hasActivefilters = statusFilter !== "All";

  const resetFilters = () => {
    setStatusFilter("All");
  };

  // --- MODIFIED: Split handleStatusUpdate into two functions ---

  // Handles the "Approve" flow, now including allowedUsers
  const handleApproveWorkshop = async (nextStatus, allowedUsers) => {
    if (!selectedWorkshop) return;

    try {
      // Send the new allowedUsers data to the backend
      await api.patch(
        `/workshops/updateWorkshopStatus/${selectedWorkshop.id}`,
        {
          status: nextStatus,
          allowedUsers: allowedUsers, // <-- HERE is the new data
        }
      );

      // Optimistic update in local state
      setWorkshops((prev) =>
        prev.map((item) =>
          item.id === selectedWorkshop.id
            ? {
                ...item,
                status: nextStatus,
                // Also update the 'raw' data if you use it
                raw: { ...item.raw, allowedUsers: allowedUsers },
                lastUpdatedAt: new Date().toISOString(),
              }
            : item
        )
      );

      setFeedback({
        tone: "Approved",
        message: "Workshop accepted and published successfully!",
      });
      setSelectedWorkshop(null); // Close modal
    } catch (err) {
      console.error("Error approving workshop:", err);
      setFeedback({
        tone: "Rejected",
        message: "Failed to approve workshop. Please try again.",
      });
    }
  };

  // Handles the "Reject" flow (and any other simple status change)
  const handleRejectWorkshop = async (nextStatus) => {
    if (!selectedWorkshop) return;

    try {
      await api.patch(
        `/workshops/updateWorkshopStatus/${selectedWorkshop.id}`,
        { status: nextStatus }
      );

      // Optimistic update
      setWorkshops((prev) =>
        prev.map((item) =>
          item.id === selectedWorkshop.id
            ? {
                ...item,
                status: nextStatus,
                lastActionComment: modalComment.trim(),
                lastUpdatedAt: new Date().toISOString(),
              }
            : item
        )
      );

      setFeedback({
        tone: "Rejected",
        message: "Workshop rejected.",
      });
      setSelectedWorkshop(null); // Close modal
    } catch (err) {
      console.error("Error rejecting workshop:", err);
      setFeedback({
        tone: "Rejected",
        message: "Failed to reject workshop. Please try again.",
      });
    }
  };

  // --- END OF MODIFIED FUNCTIONS ---

  // This function was removed from here, as it now lives inside the WorkshopModal
  // const handleAllowedUsersChange = (e) => { ... }

  const handleRequestEditsSuccess = (message = "Edit request sent.") => {
    // We need to refetch or update the workshop state to show the new "awaiting" message
    // For simplicity, just show the toast. A full solution might refetch.
    setFeedback({ tone: "Flagged", message });
    setSelectedWorkshop(null); // Close modal to see changes (or refetch data)
  };

  return (
    <div
      className="min-h-screen w-full px-6 py-10"
      style={{ backgroundColor: COLORS.muted }}
    >
      <div className="w-full">

        {/* Filters */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-bold text-gray-900">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 shadow-sm transition-all focus:border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-200 hover:border-sky-200"
            >
              {["All", "Pending", "Approved", "Rejected"].map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          {hasActivefilters && (
            <button
              onClick={resetFilters}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-sky-200 bg-white text-sm font-bold text-gray-900 transition-all hover:bg-sky-50 hover:border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-200 animate-fade-in"
            >
              <RefreshCw className="w-4 h-4" />
              Reset Filters
            </button>
          )}
        </section>

        {/* Workshop Cards */}
        <section className="grid gap-6 lg:grid-cols-3">
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
            <div className="col-span-full rounded-3xl border-2 border-dashed border-[#001233]/30 bg-white px-8 py-16 text-center shadow-sm">
              <div className="flex flex-col items-center gap-3">
                <FileText className="w-16 h-16 text-sky-600/30" />
                <p className="text-lg font-semibold text-sky-700/70">
                  No workshops match the current filters
                </p>
                <p className="text-sm text-gray-500">
                  Try adjusting your search criteria
                </p>
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
          // --- PASS THE NEW HANDLERS ---
          onApprove={handleApproveWorkshop}
          onReject={handleRejectWorkshop}
          // ---
          onRequestEditsSuccess={handleRequestEditsSuccess}
        />
      )}

      {/* Toast */}
      {feedback && (
        <Toast feedback={feedback} onDismiss={() => setFeedback(null)} />
      )}

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
