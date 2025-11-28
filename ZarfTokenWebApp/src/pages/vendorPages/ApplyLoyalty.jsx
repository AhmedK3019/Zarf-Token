import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  Info,
  Loader2,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import api from "../../services/api";
import { useAuthUser } from "../../context/UserContext";

const DISCOUNT_MIN = 1;
const DISCOUNT_MAX = 100;
const TERMS_MIN_CHARS = 50;
const TERMS_MIN_WORDS = 10;
const TERMS_MAX_CHARS = 2000;
const INACTIVE_STATUSES = ["rejected", "cancelled", "inactive"];
const STATUS_PAGE_PATH = "/dashboard/vendor/loyalty-program";
const CONFETTI_COLORS = [
  "#4C3BCF",
  "#736CED",
  "#23CE6B",
  "#FFD447",
  "#FF6B6B",
  "#00B5D8",
];

const statusTone = {
  pending: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    label: "Pending Review",
  },
  approved: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    label: "Approved",
  },
  rejected: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    label: "Rejected",
  },
  cancelled: {
    bg: "bg-gray-50",
    text: "text-gray-600",
    border: "border-gray-200",
    label: "Cancelled",
  },
  inactive: {
    bg: "bg-gray-50",
    text: "text-gray-600",
    border: "border-gray-200",
    label: "Inactive",
  },
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

const StatusPill = ({ status }) => {
  if (!status) return null;
  const key = String(status).toLowerCase();
  const tone = statusTone[key] || statusTone.pending;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${tone.bg} ${tone.text} ${tone.border} border`}
    >
      <BadgeCheck size={12} />
      {tone.label}
    </span>
  );
};

const RequirementChecklist = ({ isPromoUnique, termsOk, discountOk }) => {
  const rows = [
    {
      label: `Discount between ${DISCOUNT_MIN}% and ${DISCOUNT_MAX}%`,
      ok: discountOk,
    },
    {
      label: `Terms >= ${TERMS_MIN_CHARS} chars & ${TERMS_MIN_WORDS} words`,
      ok: termsOk,
    },
  ];
  return (
    <ul className="space-y-2">
      {rows.map((row) => (
        <li
          key={row.label}
          className={`flex items-center gap-3 text-sm ${
            row.ok ? "text-emerald-600" : "text-gray-500"
          }`}
        >
          <CheckCircle2
            size={16}
            className={row.ok ? "text-emerald-500" : "text-gray-300"}
          />
          <span>{row.label}</span>
        </li>
      ))}
    </ul>
  );
};

const PreviewCard = ({ values, vendor }) => {
  const snippet =
    values.terms.trim().length === 0
      ? "Your detailed terms will preview here in real time."
      : values.terms.trim().slice(0, 220) +
        (values.terms.trim().length > 220 ? "..." : "");
  return (
    <div className="rounded-2xl border border-indigo-100 bg-white/90 p-5 shadow-sm">
      <div className="flex items-center gap-3 text-sm font-semibold text-[#4C3BCF]">
        <Sparkles size={16} />
        Live Preview
      </div>
      <h3 className="mt-3 text-2xl font-bold tracking-wide text-[#18122B]">
        {values.promoCode.trim() || "PROMO2025"}
      </h3>
      <p className="text-sm text-gray-500">
        Proposed by {vendor?.companyname || vendor?.name || "your company"}
      </p>
      <div className="mt-4 rounded-xl bg-[#F8F5FF] p-4">
        <p className="text-sm font-medium text-[#4C3BCF]">Discount Rate</p>
        <p className="text-3xl font-black text-[#18122B]">
          {values.discountRate || 0}% OFF
        </p>
      </div>
      <div className="mt-4">
        <p className="text-sm font-semibold text-gray-700">
          Terms & Conditions
        </p>
        <p className="mt-1 text-sm text-gray-600">{snippet}</p>
      </div>
    </div>
  );
};

const ApplicationCard = ({ application }) => {
  if (!application) return null;
  const termsLen = (application.termsAndConditions || "").length;
  return (
    <div className="rounded-2xl border border-gray-100 p-4 shadow-sm transition hover:border-[#736CED]/40">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-lg font-bold text-[#18122B]">
            {application.promoCode}
          </p>
          <p className="text-xs text-gray-500">
            Submitted {formatDate(application.createdAt)}
          </p>
        </div>
        <StatusPill status={application.status} />
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
        <span>{application.discountRate}% discount</span>
        <span>{termsLen} chars in terms</span>
      </div>
      {application.reviewerNotes && (
        <p className="mt-2 text-sm italic text-gray-600">
          Review note: "{application.reviewerNotes}"
        </p>
      )}
    </div>
  );
};

const normalizePromo = (value = "") =>
  value.toUpperCase().replace(/[^A-Z0-9-]/g, "");

const buildReferenceId = (application) => {
  const createdAt = application?.createdAt
    ? new Date(application.createdAt)
    : new Date();
  const datePart = [
    createdAt.getFullYear(),
    String(createdAt.getMonth() + 1).padStart(2, "0"),
    String(createdAt.getDate()).padStart(2, "0"),
  ].join("");
  const source =
    application?._id ||
    application?.promoCode ||
    `${createdAt.getTime()}${Math.floor(Math.random() * 1000)}`;
  const uniqueSegment = String(source)
    .replace(/[^A-Za-z0-9]/g, "")
    .slice(-4)
    .toUpperCase()
    .padStart(4, "0");
  return `APP-${datePart}-${uniqueSegment}`;
};

const ConfettiBurst = ({ active }) => {
  const pieces = useMemo(() => {
    if (!active) return [];
    return Array.from({ length: 80 }).map((_, idx) => ({
      id: idx,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2.8 + Math.random() * 1.4,
      size: 6 + Math.random() * 8,
      color: CONFETTI_COLORS[idx % CONFETTI_COLORS.length],
      drift: (Math.random() - 0.5) * 120,
    }));
  }, [active]);

  if (!active) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="confetti-piece"
          style={{
            left: `${piece.left}%`,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            width: `${piece.size}px`,
            height: `${Math.max(piece.size * 0.45, 3)}px`,
            backgroundColor: piece.color,
            "--confetti-drift": `${piece.drift}px`,
          }}
        />
      ))}
    </div>
  );
};

const SubmissionSuccessModal = ({ data, countdown, onViewStatus }) => {
  if (!data) return null;
  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-2xl animate-slide-up">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 shadow-inner">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-[#18122B]">
          Application Submitted Successfully!{" "}
          <span className="text-emerald-500">{"\u2713"}</span>
        </h2>
        <p className="mt-1 text-base font-semibold text-gray-700">
          Application submitted and under review
        </p>
        <p className="mt-2 text-sm text-gray-600">
          You'll receive an email once reviewed (2-3 business days).
        </p>

        <div className="mt-6 rounded-2xl bg-gray-50 p-4 text-left text-sm text-gray-600">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-800">Application ID</span>
            <span className="font-mono text-[#4C3BCF]">{data.reference}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span>Promo Code</span>
            <span className="font-semibold text-gray-800">
              {data.promoCode}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span>Discount</span>
            <span className="font-semibold text-gray-800">
              {data.discountRate}% OFF
            </span>
          </div>
          {data.email && (
            <p className="mt-3 text-xs text-gray-500">
              Confirmation sent to <strong>{data.email}</strong>
            </p>
          )}
        </div>
        <p className="mt-4 text-xs uppercase tracking-wide text-gray-400">
          Redirecting to status page in {Math.max(countdown ?? 3, 0)}s
        </p>
        <button
          onClick={onViewStatus}
          className="mt-4 w-full rounded-2xl bg-[#4C3BCF] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#3728a6]"
        >
          View Application Status
        </button>
      </div>
    </div>
  );
};

export default function ApplyLoyalty() {
  const { user } = useAuthUser();
  const navigate = useNavigate();
  const vendorId = user?._id;
  const [formValues, setFormValues] = useState({
    promoCode: "",
    discountRate: 10,
    terms: "",
  });
  const [touched, setTouched] = useState({});
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [appsError, setAppsError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [celebration, setCelebration] = useState(null);
  const [redirectCountdown, setRedirectCountdown] = useState(null);
  const [serverError, setServerError] = useState(null);
  const [promoStatus, setPromoStatus] = useState({
    state: "idle",
    available: null,
    message: null,
  });
  const redirectTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const debounceRef = useRef(null);

  const fetchApplications = useCallback(async () => {
    if (!vendorId) return;
    setLoadingApps(true);
    setAppsError(null);
    try {
      const res = await api.get("/loyalty", { params: { vendorId } });
      const rows = Array.isArray(res.data) ? res.data : [];
      rows.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setApplications(rows);
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        err?.message ||
        "Unable to fetch applications";
      setAppsError(message);
    } finally {
      setLoadingApps(false);
    }
  }, [vendorId]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    if (!celebration) {
      setRedirectCountdown(null);
      return;
    }
    setRedirectCountdown(3);
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
    }
    countdownIntervalRef.current = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev === null) return prev;
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    redirectTimerRef.current = setTimeout(() => {
      navigate(STATUS_PAGE_PATH);
    }, 3000);
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, [celebration, navigate]);

  const handleViewStatus = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
    }
    navigate(STATUS_PAGE_PATH);
  }, [navigate]);

  const activeApplication = useMemo(() => {
    return applications.find((app) => {
      const status = String(app.status || "").toLowerCase();
      return !INACTIVE_STATUSES.includes(status);
    });
  }, [applications]);
  const lastRejected = useMemo(
    () => applications.find((app) => app.status === "rejected"),
    [applications]
  );

  const canSubmit = Boolean(vendorId) && !activeApplication;

  const wordCount = useMemo(
    () => formValues.terms.trim().split(/\s+/).filter(Boolean).length,
    [formValues.terms]
  );

  const validationErrors = useMemo(() => {
    const errors = {};
    const promo = normalizePromo(formValues.promoCode.trim());
    if (!promo) {
      errors.promoCode = "Promo code is required.";
    } else if (promo.length < 4 || promo.length > 20) {
      errors.promoCode = "Promo code must be 4-20 characters.";
    } else if (promoStatus.state === "taken") {
      errors.promoCode = "This promo code is already in use.";
    }

    const discount = Number(formValues.discountRate);
    if (!Number.isFinite(discount)) {
      errors.discountRate = "Discount rate is required.";
    } else if (discount < DISCOUNT_MIN || discount > DISCOUNT_MAX) {
      errors.discountRate = `Discount must be between ${DISCOUNT_MIN}% and ${DISCOUNT_MAX}%.`;
    }

    const terms = formValues.terms.trim();
    if (!terms) {
      errors.terms = "Terms & conditions are required.";
    } else if (terms.length < TERMS_MIN_CHARS) {
      errors.terms = `Add at least ${TERMS_MIN_CHARS} characters.`;
    } else if (wordCount < TERMS_MIN_WORDS) {
      errors.terms = `Include at least ${TERMS_MIN_WORDS} clear statements.`;
    }
    return errors;
  }, [formValues, promoStatus.state, wordCount]);

  const showError = (field) =>
    (touched[field] || submitting) && validationErrors[field];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: name === "promoCode" ? normalizePromo(value) : value,
    }));
    if (serverError) setServerError(null);
  };

  const handleBlur = (field) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ promoCode: true, discountRate: true, terms: true });
    if (Object.keys(validationErrors).length || !canSubmit) return;
    setSubmitting(true);
    setServerError(null);
    try {
      const payload = {
        vendorId,
        promoCode: normalizePromo(formValues.promoCode.trim()),
        discountRate: Number(formValues.discountRate),
        termsAndConditions: formValues.terms.trim(),
      };
      const res = await api.post("/loyalty", payload);
      const apiRecord =
        res?.data && typeof res.data === "object" ? res.data : null;
      const createdApplication = {
        ...(apiRecord || {}),
        promoCode: apiRecord?.promoCode || payload.promoCode,
        discountRate: apiRecord?.discountRate || payload.discountRate,
        createdAt: apiRecord?.createdAt || new Date().toISOString(),
      };
      setCelebration({
        reference: buildReferenceId(createdApplication),
        promoCode: createdApplication.promoCode,
        discountRate: createdApplication.discountRate,
        email: user?.email || null,
      });
      setFormValues({ promoCode: "", discountRate: 10, terms: "" });
      setTouched({});
      await fetchApplications();
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        err?.message ||
        "Unable to submit application";
      setServerError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const termsStats = `${formValues.terms.length}/${TERMS_MAX_CHARS} characters, ${wordCount} words`;

  const requirementState = {
    isPromoUnique:
      promoStatus.state === "available" ||
      (!formValues.promoCode.trim() && promoStatus.state !== "taken"),
    termsOk:
      formValues.terms.trim().length >= TERMS_MIN_CHARS &&
      wordCount >= TERMS_MIN_WORDS,
    discountOk:
      Number(formValues.discountRate) >= DISCOUNT_MIN &&
      Number(formValues.discountRate) <= DISCOUNT_MAX,
  };

  return (
    <>
      <div className="space-y-6 p-6">
        <header className="flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(STATUS_PAGE_PATH)}
            className="inline-flex items-center gap-2 rounded-full border border-[#736CED]/50 px-4 py-2 text-sm font-semibold text-[#4C3BCF] hover:bg-[#F6F3FF]"
          >
            <ShieldCheck size={16} />
            View status page
          </button>
          <button
            type="button"
            onClick={fetchApplications}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            <RefreshCcw size={16} />
            Refresh status
          </button>
        </header>

        {activeApplication && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-amber-900">
            <ShieldCheck className="mt-0.5 h-5 w-5" />
            <div>
              <p className="font-semibold">Application unavailable</p>
              <p className="text-sm">
                You already have an active loyalty program (
                {activeApplication.status}) submitted on{" "}
                {formatDate(activeApplication.createdAt)}. Cancel your current
                program from the status page before submitting another one.
              </p>
            </div>
          </div>
        )}

        {!activeApplication && lastRejected && (
          <div className="flex items-start gap-3 rounded-2xl border border-indigo-200 bg-indigo-50/80 p-4 text-indigo-900">
            <Info className="mt-0.5 h-5 w-5" />
            <div>
              <p className="font-semibold">You can resubmit</p>
              <p className="text-sm">
                Your previous application (submitted{" "}
                {formatDate(lastRejected.createdAt)}) was rejected. Update your
                promo details below and resubmit.
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-5">
          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-3xl border border-gray-100 bg-white/80 p-6 shadow-sm lg:col-span-3"
          >
            <div>
              <label
                htmlFor="promoCode"
                className="flex items-center justify-between text-sm font-semibold text-gray-700"
              >
                Promo Code
                <span
                  className={`text-xs font-semibold ${
                    promoStatus.state === "available"
                      ? "text-emerald-600"
                      : promoStatus.state === "taken"
                      ? "text-rose-600"
                      : "text-gray-400"
                  }`}
                >
                  {promoStatus.message}
                </span>
              </label>
              <input
                id="promoCode"
                name="promoCode"
                type="text"
                maxLength={20}
                disabled={!canSubmit}
                value={formValues.promoCode}
                onChange={handleChange}
                onBlur={() => handleBlur("promoCode")}
                className={`mt-2 w-full rounded-2xl border px-4 py-3 text-lg font-semibold tracking-widest uppercase shadow-inner placeholder:text-gray-400 focus:border-[#736CED] focus:ring-2 focus:ring-[#C4B5FD]/70 ${
                  showError("promoCode") ? "border-rose-300" : "border-gray-200"
                }`}
                placeholder="PROMO2025"
              />
              {showError("promoCode") && (
                <p className="mt-1 text-sm text-rose-600">
                  {validationErrors.promoCode}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="discountRate"
                className="text-sm font-semibold text-gray-700"
              >
                Discount Rate (%)
              </label>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="range"
                  min={DISCOUNT_MIN}
                  max={DISCOUNT_MAX}
                  step={1}
                  id="discountRate"
                  name="discountRate"
                  disabled={!canSubmit}
                  value={formValues.discountRate}
                  onChange={handleChange}
                  onBlur={() => handleBlur("discountRate")}
                  className="flex-1 accent-[#736CED]"
                />
                <input
                  type="number"
                  min={DISCOUNT_MIN}
                  max={DISCOUNT_MAX}
                  name="discountRate"
                  disabled={!canSubmit}
                  value={formValues.discountRate}
                  onChange={handleChange}
                  onBlur={() => handleBlur("discountRate")}
                  className={`w-20 rounded-2xl border px-3 py-2 text-center text-lg font-semibold ${
                    showError("discountRate")
                      ? "border-rose-300"
                      : "border-gray-200"
                  }`}
                />
              </div>
              {showError("discountRate") && (
                <p className="mt-1 text-sm text-rose-600">
                  {validationErrors.discountRate}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="terms"
                className="flex items-center justify-between text-sm font-semibold text-gray-700"
              >
                Terms & Conditions
                <span className="text-xs text-gray-500">{termsStats}</span>
              </label>
              <textarea
                id="terms"
                name="terms"
                rows={8}
                maxLength={TERMS_MAX_CHARS}
                disabled={!canSubmit}
                value={formValues.terms}
                onChange={handleChange}
                onBlur={() => handleBlur("terms")}
                className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm leading-6 shadow-inner placeholder:text-gray-400 focus:border-[#736CED] focus:ring-2 focus:ring-[#C4B5FD]/70 ${
                  showError("terms") ? "border-rose-300" : "border-gray-200"
                }`}
                placeholder="Explain the loyalty mechanics, redemption rules, validity period, exclusions, and customer support commitments."
              />
              <div className="mt-1 text-xs text-gray-500">
                Minimum {TERMS_MIN_CHARS} characters / {TERMS_MIN_WORDS} words.
              </div>
              {showError("terms") && (
                <p className="mt-1 text-sm text-rose-600">
                  {validationErrors.terms}
                </p>
              )}
            </div>

            {serverError && (
              <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <AlertCircle size={16} />
                <span>{serverError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className={`w-full rounded-2xl px-5 py-3 text-center text-sm font-semibold text-white shadow-lg transition ${
                !canSubmit || submitting
                  ? "cursor-not-allowed bg-gray-400"
                  : "bg-[#4C3BCF] hover:bg-[#3728a6]"
              }`}
            >
              <span className="inline-flex items-center justify-center gap-2">
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {activeApplication ? "Program Active" : "Submit Application"}
              </span>
            </button>
            {!canSubmit && (
              <p className="text-center text-xs text-gray-500">
                You can submit a new application only after cancelling your
                active program or once a pending request is resolved.
              </p>
            )}
          </form>

          <div className="space-y-5 lg:col-span-2">
            <PreviewCard values={formValues} vendor={user} />
            <div className="rounded-3xl border border-gray-100 bg-white/80 p-5 shadow-sm">
              <p className="text-sm font-semibold text-gray-700">
                Submission Checklist
              </p>
              <p className="text-xs text-gray-500">
                All criteria must pass before the Events Office reviews your
                request.
              </p>
              <div className="mt-4">
                <RequirementChecklist {...requirementState} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <ConfettiBurst active={Boolean(celebration)} />
      <SubmissionSuccessModal
        data={celebration}
        countdown={redirectCountdown}
        onViewStatus={handleViewStatus}
      />
    </>
  );
}
