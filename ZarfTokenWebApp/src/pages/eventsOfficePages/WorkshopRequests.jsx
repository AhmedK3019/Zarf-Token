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
  primary: "#4C3BCF",
  secondary: "#001233",
  accent: "#E11D48",
  muted: "#f6f7ff",
  info: "#475569",
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
    "border border-[#4C3BCF] bg-[#4C3BCF] text-white hover:bg-[#3728a6] hover:border-[#3728a6] focus-visible:ring-[#d7d1ff]",
  secondary:
    "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-200",
  info: "border border-[#4C3BCF]/20 bg-[#4C3BCF]/10 text-[#2c1f74] hover:bg-[#4C3BCF]/15 focus-visible:ring-[#d7d1ff]",
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
  return `${formattedDate} - ${durationLabel}`;
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
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide shadow-sm",
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
    <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white/80 shadow-sm ring-1 ring-black/5 animate-pulse">
      <div className="overflow-hidden bg-gray-200 px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/4 rounded bg-gray-300"></div>
            <div className="h-6 w-3/4 rounded bg-gray-300"></div>
            <div className="h-4 w-1/2 rounded bg-gray-300"></div>
          </div>
          <div className="h-6 w-20 rounded-full bg-gray-300"></div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="h-7 w-3/4 rounded bg-gray-200"></div>
          <div className="h-6 w-16 rounded-full bg-gray-200"></div>
        </div>

        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-gray-100"></div>
          <div className="h-4 w-5/6 rounded bg-gray-100"></div>
        </div>

        <div className="flex items-center justify-between gap-4 pt-2">
          <div className="h-4 w-1/3 rounded bg-gray-200"></div>
          <div className="h-10 w-28 rounded-full bg-gray-200"></div>
        </div>
      </div>
    </div>
  );
}

// Workshop Card Component
function WorkshopCard({ workshop, onView }) {
  const awaitingFrom = workshop?.raw?.currentMessage?.awaitingResponseFrom;
  const awaitingCopy = workshop?.raw?.currentMessage?.message;

  return (
    <article
      className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white/90 shadow-sm ring-1 ring-black/5 transition-all duration-200 hover:-translate-y-1 hover:shadow-md animate-fade-in"
      style={{ animationDelay: `${Math.random() * 200}ms` }}
    >
      <div className="px-6 py-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#dfe5ff] bg-[#E6ECFF] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#001845]">
            <span className="h-2 w-2 rounded-full bg-[#4C3BCF]" />
            Workshop
          </div>
          <StatusBadge status={workshop.status} />
        </div>

        <div className="flex items-start justify-between gap-3">
          <h4 className="flex-1 text-xl font-bold leading-tight text-[#001845]">
            {workshop.title}
          </h4>
          <span className="rounded-full border border-[#dfe5ff] bg-[#E6ECFF] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#001845]">
            {workshop.location}
          </span>
        </div>

        <p className="text-sm leading-relaxed text-gray-600 line-clamp-2">
          {workshop.description}
        </p>

        {awaitingFrom === "Professor" && (
          <p className="text-xs font-semibold text-amber-700">
            Awaiting professor response on requested edits
          </p>
        )}

        {awaitingFrom === "Event office" && awaitingCopy && (
          <p className="text-xs text-gray-500 italic">{awaitingCopy}</p>
        )}

        <div className="flex items-center justify-between gap-4 pt-2">
          <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-gray-600">
            <span className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700">
              <Calendar className="h-4 w-4 text-[#4C3BCF]" />
              {formatDateRange(workshop.dateISO, workshop.durationDays)}
            </span>
            <span className="text-xs text-gray-500">
              Submitted {formatSubmittedAt(workshop.submittedAt)}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onView(workshop)}
            className={classNames(
              BUTTON_BASE,
              BUTTON_VARIANTS.primary,
              "px-5 py-2.5 whitespace-nowrap"
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
  const awaitingResponse = workshop.raw?.currentMessage?.awaitingResponseFrom;

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
          <div className="relative bg-[#001845] px-8 py-6 text-white">
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
                <FileText className="w-5 h-5 text-[#4C3BCF]" />
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
                <CheckCircle className="w-5 h-5 text-[#4C3BCF]" />
                <h3 className="text-lg font-bold text-gray-900">Full Agenda</h3>
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
                <MapPin className="w-5 h-5 text-[#4C3BCF]" />
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
                <Users className="w-4 h-4 text-[#4C3BCF]" />
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
                <HandCoins className="w-4 h-4 text-[#4C3BCF]" />
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
                  <Users className="w-4 h-4 text-[#4C3BCF]" />
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
                  <Calendar className="w-4 h-4 text-[#4C3BCF]" />
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
                <RefreshCw className="w-5 h-5 text-[#4C3BCF]" />
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
                  {/* Request Edits button next to Accept and Reject */}
                  {awaitingResponse !== "Professor" && (
                    <button
                      type="button"
                      onClick={handleToggleRequestForm}
                      className={classNames(
                        BUTTON_BASE,
                        BUTTON_VARIANTS.info,
                        "w-full"
                      )}
                    >
                      <Flag className="w-4 h-4" />
                      {requestButtonText}
                    </button>
                  )}
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
                          className="rounded text-[#4C3BCF] focus:ring-[#4C3BCF]"
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

              {/* Show this if workshop is already decided */}
              {workshop.status !== "Pending" && (
                <p className="text-sm text-gray-700">
                  This workshop has been{" "}
                  <span className="font-semibold">{workshop.status}</span>.
                </p>
              )}

              {/* Show this if awaiting professor */}
              {awaitingResponse === "Professor" && (
                <p className="text-xs text-gray-500 italic">
                  Awaiting response from Professor on requested edits
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
                      className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#001845]/40"
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
  const [refreshKey, setRefreshKey] = useState(0);

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
  }, [refreshKey]);

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

  const hasActiveFilters = statusFilter !== "All";

  const statusCounts = useMemo(() => {
    return workshops.reduce(
      (acc, item) => {
        const key = String(item.status || "pending");
        const normalized = key.charAt(0).toUpperCase() + key.slice(1);
        acc[normalized] = (acc[normalized] || 0) + 1;
        acc.total += 1;
        return acc;
      },
      { Pending: 0, Approved: 0, Rejected: 0, total: 0 }
    );
  }, [workshops]);

  const resetFilters = () => {
    setStatusFilter("All");
  };

  const handleRefresh = () => setRefreshKey((key) => key + 1);

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
    <div className="min-h-screen w-full bg-gradient-to-br from-[#f5f7ff] via-white to-[#eef2ff] px-4 py-6 lg:px-6 lg:py-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Total
            </p>
            <p className="text-2xl font-bold text-[#001845]">
              {statusCounts.total}
            </p>
            <p className="text-xs text-gray-500">Workshops in the queue</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Pending
            </p>
            <p className="text-2xl font-bold text-amber-700">
              {statusCounts.Pending}
            </p>
            <p className="text-xs text-gray-500">Awaiting review</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Approved
            </p>
            <p className="text-2xl font-bold text-emerald-700">
              {statusCounts.Approved}
            </p>
            <p className="text-xs text-gray-500">Published to viewers</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Rejected
            </p>
            <p className="text-2xl font-bold text-rose-700">
              {statusCounts.Rejected}
            </p>
            <p className="text-xs text-gray-500">Sent back to requesters</p>
          </div>
        </section>

        <section className="rounded-3xl border border-gray-100 bg-white/80 p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Filters
              </p>
              <p className="text-sm text-gray-600">
                Stay aligned with the approval flow using familiar controls.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {hasActiveFilters ? (
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
                >
                  <RefreshCw className="h-4 w-4 text-gray-500" />
                  Clear filters
                </button>
              ) : null}
              <button
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 rounded-full border border-[#4C3BCF] bg-[#4C3BCF] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3728a6] hover:border-[#3728a6]"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-gray-800">
                Status
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 shadow-sm transition focus:border-[#4C3BCF] focus:outline-none focus:ring-2 focus:ring-[#d7d1ff]"
              >
                {["All", "Pending", "Approved", "Rejected"].map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
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
            <div className="col-span-full rounded-3xl border border-dashed border-gray-200 bg-white px-8 py-16 text-center shadow-sm">
              <div className="flex flex-col items-center gap-3">
                <FileText className="h-12 w-12 text-[#4C3BCF]/30" />
                <p className="text-lg font-semibold text-[#001845]/80">
                  No workshops match the current filters
                </p>
                <p className="text-sm text-gray-500">
                  Try adjusting the status or refresh to see new submissions.
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
