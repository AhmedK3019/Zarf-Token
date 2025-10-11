import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import EyeIcon from "../components/EyeIcon";
import api from "../services/api";

const createInitialFormState = () => ({
  gucian: {
    firstName: "",
    lastName: "",
    gucId: "",
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
  const navigate = useNavigate();
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

  // Provide a quick exit route back to the landing page.
  const handleGoBack = () => {
    navigate("/", { replace: true });
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
      if (!activeData.gucId.trim()) {
        nextErrors.gucId = "Your GUC ID helps us verify your account.";
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
          gucid: formData.gucian.gucId,
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

      // treat any non-2xx status as error
      if (res?.status >= 400) {
        throw new Error(data?.message || "Signup failed");
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
      console.error(err);
      setErrors({ general: err.message });
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
    "flex-1 rounded-full border border-transparent px-4 py-2 text-sm font-semibold transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";
  const activeToggleClasses =
    "text-primary bg-transparent -translate-y-1 shadow-[0_0_0_2px_rgba(115,108,237,0.4),0_18px_40px_rgba(115,108,237,0.32)] ring-2 ring-secondary/70 ring-offset-[3px] ring-offset-transparent hover:-translate-y-2 hover:shadow-[0_0_0_3px_rgba(115,108,237,0.45),0_26px_52px_rgba(115,108,237,0.45)]";
  const inactiveToggleClasses =
    "bg-transparent text-primary/90 shadow-none hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(115,108,237,0.18)]";

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-muted text-primary">
      <div className="pointer-events-none absolute left-1/2 top-[-20%] h-[420px] w-[120%] -translate-x-1/2 rounded-[50%] bg-gradient-to-r from-primary via-info to-secondary opacity-40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-18%] left-1/2 h-[360px] w-[110%] -translate-x-1/2 rounded-[50%] bg-gradient-to-r from-secondary via-primary to-info opacity-40 blur-3xl" />

      <main className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
        <button
          type="button"
          onClick={handleGoBack}
          className="absolute left-6 top-6 inline-flex items-center justify-center rounded-full border border-primary/40 bg-white px-4 py-2 text-sm font-semibold text-primary tracking-wide shadow-[0_8px_18px_rgba(115,108,237,0.2)] transition-transform hover:-translate-y-0.5 hover:bg-secondary/20 hover:shadow-[0_12px_24px_rgba(115,108,237,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:left-10 sm:top-10"
        >
          Back
        </button>
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
            <div className="relative rounded-[32px] bg-gradient-to-br from-primary via-primary/80 to-secondary p-[1px] shadow-[0_28px_50px_rgba(115,108,237,0.3)]">
              <div className="rounded-[31px] bg-white/95 p-6 backdrop-blur">
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
                          htmlFor="gucId"
                          className="block text-sm font-medium text-primary"
                        >
                          GUC ID
                        </label>
                        <input
                          id="gucId"
                          type="text"
                          placeholder="e.g. 34-12345"
                          value={formData.gucian.gucId}
                          onChange={(event) =>
                            updateField("gucId", event.target.value)
                          }
                          className={getInputClassName("gucId")}
                        />
                        {errors.gucId && (
                          <p className="text-sm font-medium text-accent">
                            {errors.gucId}
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
                    className="w-full rounded-full border border-primary/40 bg-white px-6 py-4 text-lg font-semibold text-primary tracking-wide shadow-[0_12px_24px_rgba(115,108,237,0.25)] transition-transform hover:-translate-y-0.5 hover:bg-secondary/20 hover:shadow-[0_16px_30px_rgba(115,108,237,0.3)]"
                  >
                    {activeRole === "gucian"
                      ? "Create my GUCian account"
                      : "Apply as a company"}
                  </button>

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
