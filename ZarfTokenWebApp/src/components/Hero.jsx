import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import EyeIcon from "./EyeIcon";
import api from "../services/api";
import { useAuthUser } from "../hooks/auth";

const roleRoutes = {
  admin: "/dashboard/admin",
  company: "/dashboard/vendor",
  eventsOffice: "/dashboard/eventsOffice",
  user: "/dashboard/user",
};

const resolveRoleRoute = async (email, password) => {
  try {
    if (!email) return null;
    const { data } = await api.post("/allUsers/login", {
      email,
      password,
    });
    // logic to determine role based on user.role
    if (data.message !== "Login successful") return null;
    switch (String(data.user.role)) {
      case "Admin":
        return roleRoutes.admin;
      case "Vendor":
        return roleRoutes.company;
      case "Event office":
        return roleRoutes.eventsOffice;
      case "Student":
      case "Professor":
      case "TA":
      case "Staff":
        return roleRoutes.user;
      default:
        return null;
    }
  } catch (error) {
    return null;
  }
};

const Hero = () => {
  const { login, user } = useAuthUser();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "", role: "" });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  useEffect(() => {
    // If user already logged in, redirect immediately
    if (user && user.role) {
      switch (String(user.role)) {
        case "Admin":
          navigate("/dashboard/admin/all-events");
          break;
        case "Vendor":
          navigate("/dashboard/vendor/upcoming-bazaars");
          break;
        case "Event office":
          navigate("/dashboard/eventsOffice/all-events");
          break;
        case "Student":
        case "Professor":
        case "TA":
        case "staff":
          navigate("/dashboard/user/all-events");
          break;
        default:
          break;
      }
    }
  }, [user, navigate]);

  // Toggle password visibility for the landing CTA without breaking styling.
  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const handleSubmit = async (event) => {
    setErrors({ email: "", password: "", role: "" });
    event.preventDefault();

    const nextErrors = { email: "", password: "", role: "" };
    if (!email.trim()) {
      nextErrors.email = "Please enter your email.";
    }
    if (!password.trim()) {
      nextErrors.password = "Please enter your password.";
    }

    const targetRoute = await resolveRoleRoute(email, password);
    if (email.trim() && !targetRoute) {
      nextErrors.role = "Invalid credentials or unauthorized role.";
    }

    setErrors(nextErrors);

    const hasErrors = Object.values(nextErrors).some(Boolean);
    if (!hasErrors && targetRoute) {
      await login(email, password);
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
          <h1 className="text-4xl font-bold text-[#001233] sm:text-5xl lg:text-6xl">
            All your events.
          </h1>
          <h1 className="text-4xl font-bold text-[#001233] sm:text-5xl lg:text-6xl">
            One place.
          </h1>
          <h1 className="text-4xl font-bold text-[#001233] sm:text-5xl lg:text-6xl">
            GUC x Zarf Token
          </h1>
          <p className="text-base text-[#001233] sm:text-lg">
            From planning to participation, Zarf Token keeps your community
            synced. Instant registrations, real-time insights, and automated
            engagement at your fingertips.
          </p>
        </div>

        <div className="relative flex justify-center">
          <div className="relative w-full max-w-md rounded-[20px] border border-primary/15 bg-white shadow-none">
            <div className="relative rounded-[19px] bg-white/95 p-6 backdrop-blur-none">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-primary"
                    >
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
                    {errors.email && (
                      <p className="text-sm font-medium text-accent">
                        {errors.email}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-primary"
                    >
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
                          {isPasswordVisible
                            ? "Hide password"
                            : "Show password"}
                        </span>
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm font-medium text-accent">
                        {errors.password}
                      </p>
                    )}
                  </div>
                </div>

                {errors.role && (
                  <p className="text-sm font-medium text-accent">
                    {errors.role}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full rounded-full border border-primary/40 bg-white px-6 py-4 text-lg font-semibold text-primary tracking-wide transition-transform hover:-translate-y-0.5 hover:bg-secondary/15 shadow-none"
                >
                  Sign in
                </button>

                <p className="text-center text-sm text-primary">
                  Not a member?{" "}
                  <Link
                    to="/signup"
                    className="font-semibold text-secondary hover:text-primary"
                  >
                    Sign up
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
