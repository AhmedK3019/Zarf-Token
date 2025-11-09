import React from "react";
import {
  AlertCircle,
  Ban,
  CheckCircle,
  Clock,
  Info,
} from "lucide-react";

const STATUS_THEMES = {
  pending: {
    label: "Pending Review",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    iconWrapperClass: "bg-amber-50 text-amber-600",
    accentClass: "border-amber-100",
    icon: Clock,
  },
  approved: {
    label: "Approved",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    iconWrapperClass: "bg-emerald-50 text-emerald-600",
    accentClass: "border-emerald-100",
    icon: CheckCircle,
  },
  accepted: {
    label: "Accepted",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    iconWrapperClass: "bg-emerald-50 text-emerald-600",
    accentClass: "border-emerald-100",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejected",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    iconWrapperClass: "bg-rose-50 text-rose-600",
    accentClass: "border-rose-100",
    icon: AlertCircle,
  },
  cancelled: {
    label: "Cancelled",
    badgeClass: "bg-gray-100 text-gray-600 border-gray-200",
    iconWrapperClass: "bg-gray-50 text-gray-500",
    accentClass: "border-gray-200",
    icon: Ban,
  },
  info: {
    label: "Info",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    iconWrapperClass: "bg-blue-50 text-blue-600",
    accentClass: "border-blue-100",
    icon: Info,
  },
  default: {
    label: "Status",
    badgeClass: "bg-slate-50 text-slate-600 border-slate-200",
    iconWrapperClass: "bg-slate-50 text-slate-600",
    accentClass: "border-slate-100",
    icon: Info,
  },
};

const STATUS_ALIASES = {
  accepted: "accepted",
  approval: "approved",
  approve: "approved",
  completed: "approved",
  done: "approved",
  success: "approved",
  denied: "rejected",
  failed: "rejected",
  canceled: "cancelled",
  pending: "pending",
  reviewing: "info",
  review: "info",
  "in review": "info",
};

const cx = (...values) => values.filter(Boolean).join(" ");

const normalizeStatus = (status) => {
  if (!status) return "default";
  const lowered = String(status).toLowerCase();
  return STATUS_ALIASES[lowered] || lowered;
};

export const getDashboardStatusTheme = (status) => {
  const key = normalizeStatus(status);
  return STATUS_THEMES[key] || STATUS_THEMES.default;
};

export function DashboardStatusBadge({
  status,
  label,
  icon: IconProp,
  className = "",
}) {
  const theme = getDashboardStatusTheme(status);
  const Icon = IconProp || theme.icon;

  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide",
        theme.badgeClass,
        className
      )}
    >
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
      {label || theme.label}
    </span>
  );
}

const DashboardCard = ({
  title,
  subtitle,
  status,
  statusLabel,
  statusBadgeClassName = "",
  statusIcon,
  icon: LeadingIcon,
  iconClassName = "",
  headerContent = null,
  children,
  footer = null,
  className = "",
  bodyClassName = "",
  style = {},
  ...articleProps
}) => {
  const theme = getDashboardStatusTheme(status);

  return (
    <article
      className={cx(
        "relative flex min-h-[260px] flex-col rounded-2xl border bg-white p-6 text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus-within:ring-2 focus-within:ring-[#736CED]/20",
        theme.accentClass,
        className
      )}
      style={style}
      {...articleProps}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {LeadingIcon && (
            <div
              className={cx(
                "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-white to-slate-50 shadow-inner",
                theme.iconWrapperClass,
                iconClassName
              )}
            >
              <LeadingIcon className="h-5 w-5" />
            </div>
          )}
          <div>
            {subtitle ? (
              <p className="text-xs font-semibold text-slate-400">{subtitle}</p>
            ) : null}
            <h3 className="text-lg font-semibold text-slate-900 leading-snug">
              {title}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {headerContent}
          {status ? (
            <DashboardStatusBadge
              status={status}
              label={statusLabel}
              icon={statusIcon}
              className={statusBadgeClassName}
            />
          ) : null}
        </div>
      </div>

      <div
        className={cx(
          "flex flex-1 flex-col gap-3 text-sm leading-relaxed text-slate-600",
          bodyClassName
        )}
      >
        {children}
      </div>

      {footer ? (
        <div className="mt-6 border-t border-gray-100 pt-4">{footer}</div>
      ) : null}
    </article>
  );
};

export default DashboardCard;
