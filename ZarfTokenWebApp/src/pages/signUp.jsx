import React, { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import EyeIcon from "../components/EyeIcon";
import api from "../services/api";
import DecorativeIcons from "../components/DecorativeIcons";
import EventTicker from "../components/EventTicker";

const createInitialFormState = () => ({
  gucian: {
    firstName: "",
    lastName: "",
    gucid: "",
    email: "",
    password: "",
  },
  vendor: {
    name: "",
    email: "",
    password: "",
    tax: null,
    logo: null,
  },
});

const getRoleFromParams = (params) =>
  params.get("vendor") === "true" ? "vendor" : "gucian";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const allowedTaxFileTypes = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "application/pdf",
];
const allowedLogoFileTypes = ["image/svg+xml", "image/png", "image/webp"];

// Map the four strength tiers to their Tailwind-driven styles.
const passwordStrengthStyles = {
  weak: {
    ariaLabel: "Weak password",
    barClass: "bg-[#ef4444]",
    width: "10%",
    score: 1,
  },
  medium: {
    ariaLabel: "Medium password",
    barClass: "bg-[#f97316]",
    width: "50%",
    score: 2,
  },
  fair: {
    ariaLabel: "Fair password",
    barClass: "bg-[#facc15]",
    width: "75%",
    score: 3,
  },
  strong: {
    ariaLabel: "Strong password",
    barClass: "bg-[#22c55e]",
    width: "100%",
    score: 4,
  },
};

// Evaluate strength against the requested heuristics.
const evaluatePasswordStrength = (password) => {
  if (!password) {
    return null;
  }

  const length = password.length;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  if (hasUppercase && hasNumber && hasSpecial) {
    // Treat fully mixed passwords as strong once they reach 8 chars to match the desired UX.
    if (length >= 10) {
      return passwordStrengthStyles.strong;
    }

    if (length >= 8) {
      return passwordStrengthStyles.strong;
    }

    return passwordStrengthStyles.fair;
  }

  if (
    (length >= 8 && (hasUppercase || hasNumber)) ||
    (hasUppercase && hasNumber)
  ) {
    return passwordStrengthStyles.medium;
  }

  return passwordStrengthStyles.weak;
};

function PasswordStrengthMeter({ password }) {
  const strength = evaluatePasswordStrength(password);

  if (!strength) {
    return null;
  }

  return (
    <div className="pt-1" aria-live="polite">
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-primary/10"
        role="progressbar"
        aria-valuenow={strength.score}
        aria-valuemin={0}
        aria-valuemax={4}
        aria-valuetext={strength.ariaLabel}
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${strength.barClass}`}
          style={{ width: strength.width }}
        />
      </div>
      <span className="sr-only">{strength.ariaLabel}</span>
    </div>
  );
}

export default function SignUp() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [formData, setFormData] = useState(() => createInitialFormState());
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [activeRole, setActiveRole] = useState(() => {
    const r = getRoleFromParams(searchParams);
    return r === "vendor" ? "vendor" : "gucian";
  });
  const [passwordVisibility, setPasswordVisibility] = useState({
    gucian: false,
    vendor: false,
  });
  const logoInputRef = useRef(null);
  const taxInputRef = useRef(null);

  useEffect(() => {
    const roleFromQuery = getRoleFromParams(searchParams);
    // Always ensure a safe default in case parsing fails elsewhere
    setActiveRole(roleFromQuery ?? "gucian");
    setErrors({});
    setSuccessMessage("");
    setPasswordVisibility({ gucian: false, vendor: false });
  }, [searchParams]);

  const setQueryRole = (role) => {
    const nextParams = new URLSearchParams(searchParams);
    if (role === "vendor") {
      nextParams.set("vendor", "true");
    } else {
      nextParams.delete("vendor");
    }
    setSearchParams(nextParams, { replace: true });
  };

  const handleRoleChange = (role) => {
    if (role === activeRole) return;
    setActiveRole(role);
    setErrors({});
    setSuccessMessage("");
    setPasswordVisibility({ gucian: false, vendor: false });
    setQueryRole(role);
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [activeRole]: {
        ...prev[activeRole],
        [field]: value,
      },
    }));

    setErrors((prevErrors) => {
      if (!prevErrors[field]) {
        return prevErrors;
      }
      const nextErrors = { ...prevErrors };
      delete nextErrors[field];
      return nextErrors;
    });
  };

  // Toggle between masked and visible password states for each role.
  const togglePasswordVisibility = (role) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [role]: !prev[role],
    }));
  };

  const validateForm = () => {
    const activeData = formData[activeRole];
    const nextErrors = {};

    if (activeRole === "gucian") {
      if (!activeData.firstName.trim()) {
        nextErrors.firstName = "Please add your first name.";
      }
      if (!activeData.lastName.trim()) {
        nextErrors.lastName = "Please add your last name.";
      }
      if (!activeData.gucid.trim()) {
        nextErrors.gucid = "Your GUC ID helps us verify your account.";
      }
      if (!activeData.email.trim()) {
        nextErrors.email = "Campus email is required.";
      } else if (!emailPattern.test(activeData.email)) {
        nextErrors.email = "Enter a valid email address.";
      }
      if (!activeData.password.trim()) {
        nextErrors.password = "Create a password to secure your account.";
      } else if (activeData.password.trim().length < 6) {
        nextErrors.password = "Password should be at least 6 characters.";
      }
    } else {
      if (!activeData.name.trim()) {
        nextErrors.name = "Company name is required.";
      }
      if (!activeData.email.trim()) {
        nextErrors.email = "Email is required.";
      } else if (!emailPattern.test(activeData.email)) {
        nextErrors.email = "Enter a valid email address.";
      }
      if (!activeData.password.trim()) {
        nextErrors.password = "Create a password to secure your account.";
      } else if (activeData.password.trim().length < 6) {
        nextErrors.password = "Password should be at least 6 characters.";
      }
      if (!activeData.tax) {
        nextErrors.tax = "Upload your tax registration document.";
      } else {
        if (!allowedTaxFileTypes.includes(activeData.tax.type)) {
          nextErrors.tax = "Supported formats: PNG, JPG, or PDF.";
        }
      }
      if (!activeData.logo) {
        nextErrors.logo = "Please upload your logo file.";
      } else if (!allowedLogoFileTypes.includes(activeData.logo.type)) {
        nextErrors.logo = "Supported formats: SVG, PNG, or WebP.";
      }
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    setErrors({});
    setSuccessMessage("");
    event.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      setSuccessMessage("");
      return;
    }

    try {
      // Use a safe effectiveRole so a missing/undefined activeRole
      // doesn't cause us to hit the wrong backend endpoint.
      const effectiveRole = activeRole === "vendor" ? "vendor" : "gucian";

      let res;

      if (effectiveRole === "gucian") {
        // ---- Gucian Signup ----
        const body = {
          firstname: formData.gucian.firstName,
          lastname: formData.gucian.lastName,
          gucid: formData.gucian.gucid,
          email: formData.gucian.email,
          password: formData.gucian.password,
        };

        res = await api.post("/user/signup", body, {
          headers: { "Content-Type": "application/json" },
        });
      } else {
        // ---- Company Signup ----
        const form = new FormData();
        form.append("companyname", formData.vendor.name);
        form.append("email", formData.vendor.email);
        form.append("password", formData.vendor.password);
        form.append("taxcard", formData.vendor.tax);
        form.append("logo", formData.vendor.logo);

        res = await api.post("/vendor/signupvendor", form);
      }

      // axios returns the parsed response in res.data
      const data = res?.data;

      // treat any non-2xx status as error — but prefer backend message
      if (res?.status >= 400) {
        const serverMsg =
          data?.message ||
          data?.error ||
          JSON.stringify(data) ||
          "Signup failed";
        const fieldErrors = data?.errors || data?.fieldErrors || null;
        const err = new Error(serverMsg);
        err.status = res.status;
        err.fieldErrors = fieldErrors;
        throw err;
      }

      if (data?.user?.role === "Student") {
        setSuccessMessage("Student signed up successfully!");
      } else if (data?.user?.role === "Not Specified") {
        setSuccessMessage("Your sign-up request is currently being reviewed.");
      } else if (data?.user?.role === "Vendor") {
        setSuccessMessage("Company account created successfully!");
      } else {
        setSuccessMessage("Signed up successfully!");
      }

      // Reset fields
      setFormData(createInitialFormState());
      if (logoInputRef.current) logoInputRef.current.value = "";
      if (taxInputRef.current) taxInputRef.current.value = "";
    } catch (err) {
      console.error("Signup error:", err);

      // axios error shape: err.response?.data
      const resp = err?.response?.data ?? null;

      // Prefer structured server messages when available
      const serverMessage =
        resp?.message || resp?.error || err?.message || "Signup failed";

      // If backend returned field-level errors (common shapes), map them
      // Examples supported: { errors: { field: msg } } or { fieldErrors: [{ field, message }] }
      let nextErrors = {};
      if (resp?.errors && typeof resp.errors === "object") {
        // If errors is an object map
        nextErrors = { ...resp.errors };
      } else if (Array.isArray(resp?.fieldErrors)) {
        resp.fieldErrors.forEach((fe) => {
          if (fe.field) nextErrors[fe.field] = fe.message || serverMessage;
        });
      } else if (err?.fieldErrors && typeof err.fieldErrors === "object") {
        nextErrors = { ...err.fieldErrors };
      }

      // Always include a general message under 'general'
      if (!nextErrors.general) nextErrors.general = serverMessage;

      setErrors(nextErrors);
      setSuccessMessage("");
    }
  };

  const selectedTaxName = formData.vendor.tax?.name ?? "";
  const selectedLogoName = formData.vendor.logo?.name ?? "";

  const getInputClassName = (field) =>
    `w-full rounded-2xl border px-4 py-3 text-sm text-primary shadow-inner transition focus:outline-none focus:ring-2 ${
      errors[field]
        ? "border-accent focus:border-accent focus:ring-accent/40"
        : "border-primary/15 focus:border-primary focus:ring-primary/30"
    }`;

  const baseToggleButtonClasses =
    "flex-1 rounded-full border border-transparent px-4 py-2 text-sm font-semibold transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent shadow-none";
  const activeToggleClasses =
    "text-primary bg-transparent -translate-y-1 ring-2 ring-secondary/70 ring-offset-[3px] ring-offset-transparent hover:-translate-y-2 shadow-none";
  const inactiveToggleClasses =
    "bg-transparent text-primary/90 shadow-none hover:-translate-y-1";

  // Decorative icons configuration for signup page
  // More icons on left side, fewer on right to balance the form
  // Icons positioned away from: back button (top-left), center form area (40-65%), and input boxes
  const signupIcons = [
    // Left side - more concentrated, avoiding top-left corner (back button area)
    { type: "palmTree", left: "5%", top: "25%", size: 75, rotate: -12 },
    { type: "sunglasses", left: "3%", top: "55%", size: 55, rotate: -18 },
    { type: "waves", left: "19%", top: "65%", size: 85, rotate: 0 },
    { type: "star", left: "6%", top: "78%", size: 45, rotate: 30 },
    { type: "trophy", left: "15%", top: "18%", size: 55, rotate: 10 },
    { type: "calendar", left: "9%", top: "68%", size: 42, rotate: -8 },
    { type: "locationPin", left: "16%", top: "82%", size: 47, rotate: 12 },
    { type: "balloon", left: "11%", top: "60%", size: 53, rotate: -28 },
    { type: "confetti", left: "20%", top: "22%", size: 58, rotate: 22 },
    { type: "star", left: "2%", top: "35%", size: 38, rotate: 35 },
    { type: "sun", left: "7%", top: "15%", size: 60, rotate: 20 },
    { type: "palmTree", left: "10%", top: "30%", size: 65, rotate: 15 },
    { type: "sunglasses", left: "1%", top: "70%", size: 52, rotate: 25 },
    { type: "waves", left: "29%", top: "75%", size: 75, rotate: -5 },
    { type: "microphone", left: "5%", top: "50%", size: 48, rotate: -10 },
    { type: "trophy", left: "22%", top: "28%", size: 50, rotate: 8 },
    { type: "camera", left: "21%", top: "75%", size: 45, rotate: -18 },
    // Right side - fewer icons, avoiding form area (center-right 50-70%)
    { type: "star", left: "88%", top: "12%", size: 40, rotate: -20 },
    { type: "microphone", left: "92%", top: "28%", size: 50, rotate: 15 },
    { type: "camera", left: "90%", top: "60%", size: 45, rotate: 25 },
    { type: "musicNote", left: "87%", top: "75%", size: 50, rotate: -18 },
    { type: "sun", left: "90%", top: "20%", size: 55, rotate: -25 },
    { type: "waves", left: "89%", top: "82%", size: 70, rotate: 0 },
    { type: "beachBall", left: "91%", top: "50%", size: 48, rotate: -15 },
    { type: "star", left: "94%", top: "65%", size: 42, rotate: 22 },
    { type: "calendar", left: "88%", top: "38%", size: 44, rotate: -8 },
    // Top and bottom edges - avoiding center
    //{ type: "confetti", left: "30%", top: "3%", size: 50, rotate: 15 },
   // { type: "ticket", left: "70%", top: "5%", size: 45, rotate: -20 },
    { type: "locationPin", left: "25%", top: "86%", size: 48, rotate: 8 },
  ];

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#D5CFE1] text-primary">

      {/* Decorative Icons */}
      <DecorativeIcons icons={signupIcons} iconColor="text-primary/15" />

      <div className="relative z-30 w-full">
        <EventTicker />
      </div>

      <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-10">
        <div className="grid w-full max-w-6xl gap-12 lg:grid-cols-[1.05fr_1fr]">
          <div className="space-y-6 self-center">
            <h2 className="text-4xl font-bold text-primary sm:text-5xl lg:text-6xl">
              Become a Tokener
            </h2>
            <p className="text-base text-primary/80 sm:text-lg">
              Whether you're a GUCian ready to discover events or a company
              launching your booth, it only takes a few steps. Pick the
              experience that fits you and we'll tailor the onboarding.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div className="relative rounded-[24px] border border-primary/15 bg-white">
              <div className="rounded-[23px] bg-white p-6">
                <div className="flex items-center justify-between gap-3 text-sm font-semibold">
                  <button
                    type="button"
                    onClick={() => handleRoleChange("gucian")}
                    className={`${baseToggleButtonClasses} ${
                      activeRole === "gucian"
                        ? activeToggleClasses
                        : inactiveToggleClasses
                    }`}
                  >
                    GUCian
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleChange("vendor")}
                    className={`${baseToggleButtonClasses} ${
                      activeRole === "vendor"
                        ? activeToggleClasses
                        : inactiveToggleClasses
                    }`}
                  >
                    Company
                  </button>
                </div>

                <form
                  className="mt-6 space-y-6"
                  onSubmit={handleSubmit}
                  noValidate
                >
                  {successMessage && (
                    <div className="rounded-3xl border border-primary/20 bg-secondary/10 px-4 py-3 text-sm font-medium text-primary shadow-sm">
                      {successMessage}
                    </div>
                  )}
                  {errors.general && (
                    <div className="rounded-lg border border-red-400 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 shadow-sm">
                      {errors.general}
                    </div>
                  )}

                  {activeRole === "gucian" ? (
                    <div className="space-y-5">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label
                            htmlFor="firstName"
                            className="block text-sm font-medium text-primary"
                          >
                            First name
                          </label>
                          <input
                            id="firstName"
                            type="text"
                            placeholder="Sara"
                            value={formData.gucian.firstName}
                            onChange={(event) =>
                              updateField("firstName", event.target.value)
                            }
                            className={getInputClassName("firstName")}
                          />
                          {errors.firstName && (
                            <p className="text-sm font-medium text-accent">
                              {errors.firstName}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor="lastName"
                            className="block text-sm font-medium text-primary"
                          >
                            Last name
                          </label>
                          <input
                            id="lastName"
                            type="text"
                            placeholder="Omar"
                            value={formData.gucian.lastName}
                            onChange={(event) =>
                              updateField("lastName", event.target.value)
                            }
                            className={getInputClassName("lastName")}
                          />
                          {errors.lastName && (
                            <p className="text-sm font-medium text-accent">
                              {errors.lastName}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="gucid"
                          className="block text-sm font-medium text-primary"
                        >
                          GUC ID
                        </label>
                        <input
                          id="gucid"
                          type="text"
                          placeholder="e.g. 34-12345"
                          value={formData.gucian.gucid}
                          onChange={(event) =>
                            updateField("gucid", event.target.value)
                          }
                          className={getInputClassName("gucid")}
                        />
                        {errors.gucid && (
                          <p className="text-sm font-medium text-accent">
                            {errors.gucid}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="gucEmail"
                          className="block text-sm font-medium text-primary"
                        >
                          GUC email
                        </label>
                        <input
                          id="gucEmail"
                          type="email"
                          placeholder="you@guc.edu.eg"
                          value={formData.gucian.email}
                          onChange={(event) =>
                            updateField("email", event.target.value)
                          }
                          className={getInputClassName("email")}
                        />
                        {errors.email && (
                          <p className="text-sm font-medium text-accent">
                            {errors.email}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="gucPassword"
                          className="block text-sm font-medium text-primary"
                        >
                          Password
                        </label>
                        <div className="relative">
                          <input
                            id="gucPassword"
                            type={
                              passwordVisibility.gucian ? "text" : "password"
                            }
                            placeholder="Create a password"
                            value={formData.gucian.password}
                            onChange={(event) =>
                              updateField("password", event.target.value)
                            }
                            className={`${getInputClassName("password")} pr-12`}
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility("gucian")}
                            className="absolute inset-y-0 right-3 flex items-center text-primary/60 transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                            aria-pressed={passwordVisibility.gucian}
                          >
                            <EyeIcon visible={passwordVisibility.gucian} />
                            <span className="sr-only">
                              {passwordVisibility.gucian
                                ? "Hide password"
                                : "Show password"}
                            </span>
                          </button>
                        </div>
                        <PasswordStrengthMeter
                          password={formData.gucian.password}
                        />
                        {errors.password && (
                          <p className="text-sm font-medium text-accent">
                            {errors.password}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <label
                          htmlFor="vendorName"
                          className="block text-sm font-medium text-primary"
                        >
                          Company name
                        </label>
                        <input
                          id="vendorName"
                          type="text"
                          placeholder="El Sewedy Electric Co S.A.E."
                          value={formData.vendor.name}
                          onChange={(event) =>
                            updateField("name", event.target.value)
                          }
                          className={getInputClassName("name")}
                        />
                        {errors.name && (
                          <p className="text-sm font-medium text-accent">
                            {errors.name}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="vendorEmail"
                          className="block text-sm font-medium text-primary"
                        >
                          Email
                        </label>
                        <input
                          id="vendorEmail"
                          type="email"
                          placeholder="company@example.com"
                          value={formData.vendor.email}
                          onChange={(event) =>
                            updateField("email", event.target.value)
                          }
                          className={getInputClassName("email")}
                        />
                        {errors.email && (
                          <p className="text-sm font-medium text-accent">
                            {errors.email}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <span className="block text-sm font-medium text-primary">
                          Tax registration document
                        </span>
                        <label
                          htmlFor="vendorTax"
                          className={`flex w-full cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 text-sm text-primary transition ${
                            errors.tax
                              ? "border-accent bg-accent/5"
                              : "border-dashed border-primary/30 bg-primary/5 hover:border-primary/60"
                          }`}
                        >
                          <span className="truncate pr-3">
                            {selectedTaxName ||
                              "Upload your file (PDF, PNG, or JPG)"}
                          </span>
                          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                            Browse
                          </span>
                          <input
                            id="vendorTax"
                            ref={taxInputRef}
                            type="file"
                            accept=".png,.jpg,.jpeg,.pdf"
                            className="sr-only"
                            onChange={(event) => {
                              const file = event.target.files?.[0] ?? null;
                              updateField("tax", file);
                            }}
                          />
                        </label>
                        {errors.tax && (
                          <p className="text-sm font-medium text-accent">
                            {errors.tax}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <span className="block text-sm font-medium text-primary">
                          Logo
                        </span>
                        <label
                          htmlFor="vendorLogo"
                          className={`flex w-full cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 text-sm text-primary transition ${
                            errors.logo
                              ? "border-accent bg-accent/5"
                              : "border-dashed border-primary/30 bg-primary/5 hover:border-primary/60"
                          }`}
                        >
                          <span className="truncate pr-3">
                            {selectedLogoName ||
                              "Upload your file (SVG, PNG, or WebP)"}
                          </span>
                          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                            Browse
                          </span>
                          <input
                            id="vendorLogo"
                            ref={logoInputRef}
                            type="file"
                            accept=".svg,.png,.webp"
                            className="sr-only"
                            onChange={(event) => {
                              const file = event.target.files?.[0] ?? null;
                              updateField("logo", file);
                            }}
                          />
                        </label>
                        {errors.logo && (
                          <p className="text-sm font-medium text-accent">
                            {errors.logo}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="vendorPassword"
                          className="block text-sm font-medium text-primary"
                        >
                          Password
                        </label>
                        <div className="relative">
                          <input
                            id="vendorPassword"
                            type={
                              passwordVisibility.vendor ? "text" : "password"
                            }
                            placeholder="Create a password"
                            value={formData.vendor.password}
                            onChange={(event) =>
                              updateField("password", event.target.value)
                            }
                            className={`${getInputClassName("password")} pr-12`}
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility("vendor")}
                            className="absolute inset-y-0 right-3 flex items-center text-primary/60 transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                            aria-pressed={passwordVisibility.vendor}
                          >
                            <EyeIcon visible={passwordVisibility.vendor} />
                            <span className="sr-only">
                              {passwordVisibility.vendor
                                ? "Hide password"
                                : "Show password"}
                            </span>
                          </button>
                        </div>
                        <PasswordStrengthMeter
                          password={formData.vendor.password}
                        />
                        {errors.password && (
                          <p className="text-sm font-medium text-accent">
                            {errors.password}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full rounded-full border border-primary/40 bg-white px-6 py-4 text-lg font-semibold text-primary tracking-wide transition-transform hover:-translate-y-0.5 hover:bg-secondary/15 shadow-none"
                  >
                    {activeRole === "gucian"
                      ? "Create my GUCian account"
                      : "Apply as a company"}
                  </button>

                  <p className="text-center text-sm font-semibold text-primary/80">
                    Already a member?{" "}
                    <Link
                      to="/"
                      className="text-secondary underline decoration-primary/40 transition hover:text-primary"
                    >
                      Sign in
                    </Link>
                  </p>

                  <p className="text-center text-xs text-primary/70">
                    By continuing you agree to our terms and acknowledge our
                    privacy policy.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="relative z-10 w-full px-6 py-6 text-center text-sm text-primary/70">
        {new Date().getFullYear()} Zarf Token. All rights reserved.
      </footer>
    </div>
  );
}
