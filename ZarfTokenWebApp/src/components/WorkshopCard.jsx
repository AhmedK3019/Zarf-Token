import React from "react";

const STATUS_CONFIG = {
  Pending: {
    badge: "border-info/30 bg-info/10 text-info",
    tooltip: "Pending – awaiting Events Office review.",
  },
  Accepted: {
    badge: "border-secondary/40 bg-secondary/15 text-secondary",
    tooltip: "Accepted – ready to publish to students.",
  },
  Flagged: {
    badge: "border-accent/30 bg-accent/10 text-accent",
    tooltip: "Flagged – needs follow-up before approval.",
  },
  Rejected: {
    badge: "border-accent/30 bg-accent/10 text-accent",
    tooltip: "Rejected – not approved for publication.",
  },
};

const CATEGORY_THEME = {
  Technical: {
    accent: "bg-gradient-to-b from-secondary to-info",
    chip: "bg-gradient-to-r from-secondary/30 via-white/10 to-info/30 text-primary/90",
  },
  Career: {
    accent: "bg-gradient-to-b from-primary to-secondary",
    chip: "bg-gradient-to-r from-primary/30 via-white/10 to-secondary/30 text-primary",
  },
  "Soft Skills": {
    accent: "bg-gradient-to-b from-info to-secondary",
    chip: "bg-gradient-to-r from-info/30 via-white/10 to-secondary/30 text-primary/90",
  },
  default: {
    accent: "bg-gradient-to-b from-primary to-secondary",
    chip: "bg-gradient-to-r from-primary/30 via-white/10 to-secondary/30 text-primary",
  },
};

function classNames(...values) {
  return values.filter(Boolean).join(" ");
}

function formatDateRange(dateISO, durationHours) {
  const date = new Date(dateISO);
  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
  const durationLabel = `${durationHours} ${durationHours === 1 ? "hour" : "hours"}`;
  return `Scheduled for ${formattedDate}, ${durationLabel}`;
}

export default function WorkshopCard({ workshop, onView }) {
  const statusConfig = STATUS_CONFIG[workshop.status] ?? STATUS_CONFIG.Pending;
  const theme = CATEGORY_THEME[workshop.category] ?? CATEGORY_THEME.default;

  return (
    <article className="relative animate-fade-in">
      <div
        className={classNames(
          "relative overflow-hidden rounded-[24px] bg-gradient-to-br from-primary/40 via-white/10 to-secondary/40 p-[1px] shadow-[0_24px_70px_rgba(115,108,237,0.16)] transition duration-300 ease-out",
          "backdrop-blur-xl hover:scale-[1.02] hover:shadow-[0_34px_90px_rgba(115,108,237,0.22)]"
        )}
      >
        <div className="relative rounded-[23px] bg-white/85 px-6 py-7 sm:px-8">
          <span aria-hidden="true" className={classNames("absolute inset-y-4 left-0 w-1.5 rounded-full", theme.accent)} />

          <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 text-left">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/60">
                  {workshop.professorName}
                </p>
                <h2 className="text-xl font-semibold text-primary sm:text-2xl">{workshop.title}</h2>
              </div>

              <div className="flex flex-col items-end gap-3">
                <span
                  className={classNames(
                    "rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide backdrop-blur-sm transition",
                    statusConfig.badge
                  )}
                  title={statusConfig.tooltip}
                  role="status"
                >
                  {workshop.status}
                </span>
                <span
                  className={classNames(
                    "inline-flex items-center rounded-full border border-white/50 px-3 py-1 text-xs font-semibold shadow-inner backdrop-blur-sm",
                    theme.chip
                  )}
                >
                  {workshop.category}
                </span>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-primary/70">{workshop.description}</p>

            <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-primary/60">
              <span className="font-medium text-primary/70">{formatDateRange(workshop.dateISO, workshop.durationHours)}</span>
              <button
                type="button"
                onClick={() => onView(workshop)}
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-transparent px-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/40"
              >
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-secondary opacity-60 transition group-hover:opacity-100" />
                <span className="relative inline-flex items-center rounded-full bg-white/85 px-5 py-2 text-sm font-semibold text-primary transition group-hover:bg-transparent group-hover:text-white">
                  View Full Workshop
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
