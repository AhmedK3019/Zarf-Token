import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import EyeIcon from "./EyeIcon";

const roleRoutes = {
  student: "/dashboard/student",
  faculty: "/dashboard/faculty",
  staff: "/dashboard/staff",
  vendor: "/dashboard/vendor",
  admin: "/dashboard/admin",
};

const resolveRoleRoute = (email) => {
  if (!email) return null;
  const normalized = email.toLowerCase();
  if (normalized.includes("admin")) return roleRoutes.admin;
  if (normalized.includes("faculty") || normalized.endsWith("@faculty.edu")) return roleRoutes.faculty;
  if (normalized.includes("staff") || normalized.endsWith("@staff.edu")) return roleRoutes.staff;
  if (normalized.includes("vendor") || normalized.endsWith("@vendors.com")) return roleRoutes.vendor;
  if (normalized.includes("student") || normalized.endsWith("@students.edu")) return roleRoutes.student;
  return null;
};

const Hero = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "", role: "" });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Toggle password visibility for the landing CTA without breaking styling.
  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = { email: "", password: "", role: "" };
    if (!email.trim()) {
      nextErrors.email = "Please enter your email.";
    }
    if (!password.trim()) {
      nextErrors.password = "Please enter your password.";
    }

    const targetRoute = resolveRoleRoute(email);
    if (email.trim() && !targetRoute) {
      nextErrors.role = "We couldn't determine your dashboard. Please use your campus email.";
    }

    setErrors(nextErrors);

    const hasErrors = Object.values(nextErrors).some(Boolean);
    if (!hasErrors && targetRoute) {
      navigate(targetRoute);
    }
  };

  const emailClassName = errors.email
    ? "border-accent focus:ring-accent/40"
    : "border-primary/20 focus:border-primary focus:ring-primary/30";

  const passwordClassName = errors.password
    ? "border-accent focus:ring-accent/40"
    : "border-primary/20 focus:border-primary focus:ring-primary/30";

  return (
    <section className="relative z-10 flex w-full flex-1 items-center justify-center px-6 py-12">
      <div className="relative grid w-full max-w-6xl gap-12 md:grid-cols-2 md:items-center">
        <div className="max-w-xl space-y-4">
          <h1 className="text-4xl font-bold text-primary sm:text-5xl lg:text-6xl">
            All your events.
          </h1>
          <h1 className="text-4xl font-bold text-primary sm:text-5xl lg:text-6xl">
            One place.
          </h1>
          <h1 className="text-4xl font-bold text-primary sm:text-5xl lg:text-6xl">
            GUC x Zarf Token
          </h1>
          <p className="text-base text-primary/80 sm:text-lg">
            From planning to participation, Zarf Token keeps your community synced. Instant registrations, real-time
            insights, and automated engagement at your fingertips.
          </p>
        </div>

        <div className="relative flex justify-center">
          <div className="relative w-full max-w-md rounded-[32px] bg-gradient-to-br from-primary via-primary/80 to-secondary p-[1px] shadow-[0_28px_50px_rgba(115,108,237,0.3)]">
            <div className="relative rounded-[31px] bg-white/90 p-6 backdrop-blur">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-primary">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="you@campus.edu"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className={`w-full rounded-2xl border px-4 py-3 text-sm text-primary shadow-inner transition focus:outline-none focus:ring-2 ${emailClassName}`}
                    />
                    {errors.email && <p className="text-sm font-medium text-accent">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-primary">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={isPasswordVisible ? "text" : "password"}
                        placeholder="********"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className={`w-full rounded-2xl border px-4 py-3 text-sm text-primary shadow-inner transition focus:outline-none focus:ring-2 pr-12 ${passwordClassName}`}
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-3 flex items-center text-primary/60 transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                        aria-pressed={isPasswordVisible}
                      >
                        <EyeIcon visible={isPasswordVisible} />
                        <span className="sr-only">
                          {isPasswordVisible ? "Hide password" : "Show password"}
                        </span>
                      </button>
                    </div>
                    {errors.password && <p className="text-sm font-medium text-accent">{errors.password}</p>}
                  </div>
                </div>

                {errors.role && <p className="text-sm font-medium text-accent">{errors.role}</p>}

                <button
                  type="submit"
                  className="w-full rounded-full border border-primary/40 bg-white px-6 py-4 text-lg font-semibold text-primary tracking-wide shadow-[0_12px_24px_rgba(115,108,237,0.25)] transition-transform hover:-translate-y-0.5 hover:bg-secondary/20 hover:shadow-[0_16px_30px_rgba(115,108,237,0.3)]"
                >
                  Sign in
                </button>

                <p className="text-center text-sm text-primary">Not a member?</p>
                <div className="flex items-center justify-center gap-4 text-sm font-semibold text-primary">
                  <Link to="/signup" className="text-secondary hover:text-primary">
                    Sign up as a GUCian
                  </Link>
                  <span className="text-primary font-extrabold">|</span>
                  <Link to="/signup?vendor=true" className="text-secondary hover:text-primary">
                    Sign up as a Vendor
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
