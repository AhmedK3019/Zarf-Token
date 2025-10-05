import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import EyeIcon from "../components/EyeIcon";

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
    tax: "",
    logo: null,
  },
});


const getRoleFromParams = (params) => (params.get("vendor") === "true" ? "vendor" : "gucian");
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUp() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [formData, setFormData] = useState(() => createInitialFormState());
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [activeRole, setActiveRole] = useState(() => getRoleFromParams(searchParams));
  const [passwordVisibility, setPasswordVisibility] = useState({ gucian: false, vendor: false });
  const logoInputRef = useRef(null);

  useEffect(() => {
    const roleFromQuery = getRoleFromParams(searchParams);
    setActiveRole(roleFromQuery);
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
        nextErrors.name = "Vendor name is required.";
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
      if (!activeData.tax.trim()) {
        nextErrors.tax = "Include your tax registration number.";
      }
      if (!activeData.logo) {
        nextErrors.logo = "Please upload your logo.";
      }
    }

    return nextErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      setSuccessMessage("");
      return;
    }

    setErrors({});
    setSuccessMessage(
      activeRole === "gucian"
        ? "Thanks for signing up! Our team will verify your GUC credentials and get you onboarded shortly."
        : "Vendor application received! We'll review your details and reach out to finalize your storefront."
    );

    setPasswordVisibility((prev) => ({
      ...prev,
      [activeRole]: false,
    }));

    const resetState = createInitialFormState();
    setFormData((prev) => ({
      ...prev,
      [activeRole]: resetState[activeRole],
    }));

    if (activeRole === "vendor" && logoInputRef.current) {
      logoInputRef.current.value = "";
    }
  };

  const selectedLogoName = formData.vendor.logo?.name ?? "";

  const getInputClassName = (field) =>
    `w-full rounded-2xl border px-4 py-3 text-sm text-primary shadow-inner transition focus:outline-none focus:ring-2 ${
      errors[field]
        ? "border-accent focus:border-accent focus:ring-accent/40"
        : "border-primary/15 focus:border-primary focus:ring-primary/30"
    }`;

  const baseToggleButtonClasses =
    "flex-1 rounded-full border border-transparent px-4 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline-none";
  const activeToggleClasses =
    "text-primary bg-transparent -translate-y-1 shadow-[0_14px_32px_rgba(115,108,237,0.35)] ring-2 ring-secondary/50 ring-offset-2 ring-offset-white hover:-translate-y-2 hover:shadow-[0_22px_45px_rgba(115,108,237,0.45)]";
  const inactiveToggleClasses =
    "bg-transparent text-primary shadow-none hover:-translate-y-1 hover:shadow-[0_14px_28px_rgba(115,108,237,0.18)]";

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-muted text-primary">
      <div className="pointer-events-none absolute left-1/2 top-[-20%] h-[420px] w-[120%] -translate-x-1/2 rounded-[50%] bg-gradient-to-r from-primary via-info to-secondary opacity-40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-18%] left-1/2 h-[360px] w-[110%] -translate-x-1/2 rounded-[50%] bg-gradient-to-r from-secondary via-primary to-info opacity-40 blur-3xl" />

      <main className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
        <div className="grid w-full max-w-6xl gap-12 lg:grid-cols-[1.05fr_1fr]">
          <div className="space-y-6 self-center">

            <h2 className="text-4xl font-bold text-primary sm:text-5xl lg:text-6xl">Become a Tokener</h2>
            <p className="text-base text-primary/80 sm:text-lg">
              Whether you're a GUCian ready to discover events or a vendor launching your booth, it only takes a few
              steps. 
              Pick the experience that fits you and we'll tailor the onboarding.
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
                      activeRole === "gucian" ? activeToggleClasses : inactiveToggleClasses
                    }`}
                  >
                    GUCian
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleChange("vendor")}
                    className={`${baseToggleButtonClasses} ${
                      activeRole === "vendor" ? activeToggleClasses : inactiveToggleClasses
                    }`}
                  >
                    Vendor
                  </button>
                </div>

                <form className="mt-6 space-y-6" onSubmit={handleSubmit} noValidate>
                  {successMessage && (
                    <div className="rounded-3xl border border-primary/20 bg-secondary/10 px-4 py-3 text-sm font-medium text-primary shadow-sm">
                      {successMessage}
                    </div>
                  )}

                  {activeRole === "gucian" ? (
                    <div className="space-y-5">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label htmlFor="firstName" className="block text-sm font-medium text-primary">
                            First name
                          </label>
                          <input
                            id="firstName"
                            type="text"
                            placeholder="Sara"
                            value={formData.gucian.firstName}
                            onChange={(event) => updateField("firstName", event.target.value)}
                            className={getInputClassName("firstName")}
                          />
                          {errors.firstName && <p className="text-sm font-medium text-accent">{errors.firstName}</p>}
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="lastName" className="block text-sm font-medium text-primary">
                            Last name
                          </label>
                          <input
                            id="lastName"
                            type="text"
                            placeholder="Omar"
                            value={formData.gucian.lastName}
                            onChange={(event) => updateField("lastName", event.target.value)}
                            className={getInputClassName("lastName")}
                          />
                          {errors.lastName && <p className="text-sm font-medium text-accent">{errors.lastName}</p>}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="gucId" className="block text-sm font-medium text-primary">
                          GUC ID
                        </label>
                        <input
                          id="gucId"
                          type="text"
                          placeholder="e.g. 34-12345"
                          value={formData.gucian.gucId}
                          onChange={(event) => updateField("gucId", event.target.value)}
                          className={getInputClassName("gucId")}
                        />
                        {errors.gucId && <p className="text-sm font-medium text-accent">{errors.gucId}</p>}
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="gucEmail" className="block text-sm font-medium text-primary">
                          GUC email
                        </label>
                        <input
                          id="gucEmail"
                          type="email"
                          placeholder="you@guc.edu.eg"
                          value={formData.gucian.email}
                          onChange={(event) => updateField("email", event.target.value)}
                          className={getInputClassName("email")}
                        />
                        {errors.email && <p className="text-sm font-medium text-accent">{errors.email}</p>}
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="gucPassword" className="block text-sm font-medium text-primary">
                          Password
                        </label>
                        <div className="relative">
                          <input
                            id="gucPassword"
                            type={passwordVisibility.gucian ? "text" : "password"}
                            placeholder="Create a password"
                            value={formData.gucian.password}
                            onChange={(event) => updateField("password", event.target.value)}
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
                              {passwordVisibility.gucian ? "Hide password" : "Show password"}
                            </span>
                          </button>
                        </div>
                        {errors.password && <p className="text-sm font-medium text-accent">{errors.password}</p>}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <label htmlFor="vendorName" className="block text-sm font-medium text-primary">
                          Vendor name
                        </label>
                        <input
                          id="vendorName"
                          type="text"
                          placeholder="Zarf Coffee Cart"
                          value={formData.vendor.name}
                          onChange={(event) => updateField("name", event.target.value)}
                          className={getInputClassName("name")}
                        />
                        {errors.name && <p className="text-sm font-medium text-accent">{errors.name}</p>}
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="vendorEmail" className="block text-sm font-medium text-primary">
                          Email
                        </label>
                        <input
                          id="vendorEmail"
                          type="email"
                          placeholder="contact@brand.com"
                          value={formData.vendor.email}
                          onChange={(event) => updateField("email", event.target.value)}
                          className={getInputClassName("email")}
                        />
                        {errors.email && <p className="text-sm font-medium text-accent">{errors.email}</p>}
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="vendorTax" className="block text-sm font-medium text-primary">
                          Tax registration number
                        </label>
                        <input
                          id="vendorTax"
                          type="text"
                          placeholder="e.g. 203-445-678"
                          value={formData.vendor.tax}
                          onChange={(event) => updateField("tax", event.target.value)}
                          className={getInputClassName("tax")}
                        />
                        {errors.tax && <p className="text-sm font-medium text-accent">{errors.tax}</p>}
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="vendorPassword" className="block text-sm font-medium text-primary">
                          Password
                        </label>
                        <div className="relative">
                          <input
                            id="vendorPassword"
                            type={passwordVisibility.vendor ? "text" : "password"}
                            placeholder="Create a password"
                            value={formData.vendor.password}
                            onChange={(event) => updateField("password", event.target.value)}
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
                              {passwordVisibility.vendor ? "Hide password" : "Show password"}
                            </span>
                          </button>
                        </div>
                        {errors.password && <p className="text-sm font-medium text-accent">{errors.password}</p>}
                      </div>

                      <div className="space-y-2">
                        <span className="block text-sm font-medium text-primary">Logo</span>
                        <label
                          htmlFor="vendorLogo"
                          className={`flex w-full cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 text-sm text-primary transition ${
                            errors.logo
                              ? "border-accent bg-accent/5"
                              : "border-dashed border-primary/30 bg-primary/5 hover:border-primary/60"
                          }`}
                        >
                          <span className="truncate pr-3">
                            {selectedLogoName || "Upload an image (PNG, JPG)"}
                          </span>
                          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                            Browse
                          </span>
                          <input
                            id="vendorLogo"
                            ref={logoInputRef}
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(event) => {
                              const file = event.target.files?.[0] ?? null;
                              updateField("logo", file);
                            }}
                          />
                        </label>
                        {errors.logo && <p className="text-sm font-medium text-accent">{errors.logo}</p>}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full rounded-full border border-primary/40 bg-white px-6 py-4 text-lg font-semibold text-primary tracking-wide shadow-[0_12px_24px_rgba(115,108,237,0.25)] transition-transform hover:-translate-y-0.5 hover:bg-secondary/20 hover:shadow-[0_16px_30px_rgba(115,108,237,0.3)]"
                  >
                    {activeRole === "gucian" ? "Create my GUCian account" : "Apply as a vendor"}
                  </button>

                  <p className="text-center text-xs text-primary/70">
                    By continuing you agree to our terms and acknowledge our privacy policy.
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






