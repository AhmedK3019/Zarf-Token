import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuthUser } from "../../hooks/auth"; // example context hook
import { useState, useRef, useEffect } from "react";
import {
  LogOut,
  Calendar,
  Wallet,
  Heart,
  Bookmark,
  Vote,
  CheckSquare,
  Star,
  ShoppingBag,
  Clock,
  PlusCircle,
  Volleyball,
  List,
  Bell,
  ChevronDown,
} from "lucide-react";
import logo from "../../assets/logo.png";
import NotificationsDrawer from "../../components/NotificationsDrawer";

const NavbarUser = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthUser(); // { role, wallet, logout }
  // Hooks must be called on every render — declare them before any early return.
  const location = useLocation();
  const [eventsDropdownOpen, setEventsDropdownOpen] = useState(false);
  const [gymDropdownOpen, setGymDropdownOpen] = useState(false);
  const [workshopsDropdownOpen, setWorkshopsDropdownOpen] = useState(false);
  const eventsRef = useRef(null);
  const gymRef = useRef(null);
  const workshopsRef = useRef(null);
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (eventsRef.current && !eventsRef.current.contains(event.target)) {
        setEventsDropdownOpen(false);
      }
      if (gymRef.current && !gymRef.current.contains(event.target)) {
        setGymDropdownOpen(false);
      }
      if (
        workshopsRef.current &&
        !workshopsRef.current.contains(event.target)
      ) {
        setWorkshopsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setEventsDropdownOpen(false);
    setGymDropdownOpen(false);
    setWorkshopsDropdownOpen(false);
  }, [location.pathname]);

  if (!user) return null; // or a loading state

  // Format wallet value for display. Keep two decimal places (e.g. 0.00).
  const formatWallet = (w) => {
    if (w === undefined || w === null) return "0.00";
    try {
      // Mongoose Decimal128 may come as an object whose toString yields the numeric string.
      const raw =
        typeof w === "object" && typeof w.toString === "function"
          ? w.toString()
          : w;
      const num = Number(raw);
      if (Number.isNaN(num)) return "0.00";
      return num.toFixed(2);
    } catch (e) {
      return "0.00";
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="w-full">
      <header className="w-full bg-[#001233] shadow-lg">
        <nav className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left - Notifications */}
            <div className="flex items-center gap-4">
              <NotificationsDrawer />
            </div>

            {/* Center - Links with dropdowns */}
            <div className="hidden lg:flex items-center gap-4 text-sm font-medium text-white">
              {/* Events dropdown: All / Favourites / Registered */}
              <div className="relative" ref={eventsRef}>
                <button
                  onClick={() => {
                    setEventsDropdownOpen(!eventsDropdownOpen);
                    setGymDropdownOpen(false);
                    setWorkshopsDropdownOpen(false);
                  }}
                  className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                    location.pathname.includes("/dashboard/user/all-events") ||
                    location.pathname.includes(
                      "/dashboard/user/favourite-events"
                    ) ||
                    location.pathname.includes(
                      "/dashboard/user/registered-events"
                    )
                      ? "bg-white/10 text-white font-semibold"
                      : "text-white/90 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                  Events
                  <ChevronDown
                    className={`h-4 w-4 ${
                      eventsDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {eventsDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
                    <NavLink
                      to="/dashboard/user/all-events"
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 text-gray-800 hover:bg-primary/5 hover:text-primary transition-colors ${
                          isActive
                            ? "bg-primary/10 text-primary font-semibold"
                            : ""
                        }`
                      }
                      onClick={() => setEventsDropdownOpen(false)}
                    >
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">All Events</span>
                    </NavLink>
                    <NavLink
                      to="/dashboard/user/favourite-events"
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 text-gray-800 hover:bg-primary/5 hover:text-primary transition-colors border-t border-gray-200 ${
                          isActive
                            ? "bg-primary/10 text-primary font-semibold"
                            : ""
                        }`
                      }
                      onClick={() => setEventsDropdownOpen(false)}
                    >
                      <Heart className="h-4 w-4" />
                      <span className="font-medium">Favourites</span>
                    </NavLink>
                    <NavLink
                      to="/dashboard/user/registered-events"
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 text-gray-800 hover:bg-primary/5 hover:text-primary transition-colors border-t border-gray-200 ${
                          isActive
                            ? "bg-primary/10 text-primary font-semibold"
                            : ""
                        }`
                      }
                      onClick={() => setEventsDropdownOpen(false)}
                    >
                      <CheckSquare className="h-4 w-4" />
                      <span className="font-medium">Registered</span>
                    </NavLink>
                  </div>
                )}
              </div>

              {/* Workshops dropdown (Professors only): Create / My Workshops */}
              {user.role === "Professor" && (
                <div className="relative" ref={workshopsRef}>
                  <button
                    onClick={() => {
                      setWorkshopsDropdownOpen(!workshopsDropdownOpen);
                      setEventsDropdownOpen(false);
                      setGymDropdownOpen(false);
                    }}
                    className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                      location.pathname.includes("/create-workshop") ||
                      location.pathname.includes("/my-workshops")
                        ? "bg-white/10 text-white font-semibold"
                        : "text-white/90 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <PlusCircle className="h-4 w-4" />
                    Workshops
                    <ChevronDown
                      className={`h-4 w-4 ${
                        workshopsDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {workshopsDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
                      <NavLink
                        to="/dashboard/user/create-workshop"
                        onClick={() => setWorkshopsDropdownOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-3 text-gray-800 hover:bg-primary/5 hover:text-primary transition-colors ${
                            isActive
                              ? "bg-primary/10 text-primary font-semibold"
                              : ""
                          }`
                        }
                      >
                        <PlusCircle className="h-4 w-4" />
                        <span className="font-medium">Create Workshop</span>
                      </NavLink>
                      <NavLink
                        to="/dashboard/user/my-workshops"
                        onClick={() => setWorkshopsDropdownOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-3 text-gray-800 hover:bg-primary/5 hover:text-primary transition-colors border-t border-gray-200 ${
                            isActive
                              ? "bg-primary/10 text-primary font-semibold"
                              : ""
                          }`
                        }
                      >
                        <List className="h-4 w-4" />
                        <span className="font-medium">My Workshops</span>
                      </NavLink>
                    </div>
                  )}
                </div>
              )}

              {/* Gym & Courts dropdown: Gym + Courts (show Courts for Students) */}
              <div className="relative" ref={gymRef}>
                <button
                  onClick={() => {
                    setGymDropdownOpen(!gymDropdownOpen);
                    setEventsDropdownOpen(false);
                    setWorkshopsDropdownOpen(false);
                  }}
                  className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                    location.pathname.includes("/gym-schedule") ||
                    location.pathname.includes("/courts")
                      ? "bg-white/10 text-white font-semibold"
                      : "text-white/90 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Clock className="h-4 w-4" />
                  Activities
                  <ChevronDown
                    className={`h-4 w-4 ${gymDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {gymDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-44 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
                    <NavLink
                      to="/dashboard/user/gym-schedule"
                      onClick={() => setGymDropdownOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 text-gray-800 hover:bg-primary/5 hover:text-primary transition-colors ${
                          isActive
                            ? "bg-primary/10 text-primary font-semibold"
                            : ""
                        }`
                      }
                    >
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">Gym Schedule</span>
                    </NavLink>
                    {user.role === "Student" && (
                      <NavLink
                        to="/dashboard/user/courts"
                        onClick={() => setGymDropdownOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-3 text-gray-800 hover:bg-primary/5 hover:text-primary transition-colors border-t border-gray-200 ${
                            isActive
                              ? "bg-primary/10 text-primary font-semibold"
                              : ""
                          }`
                        }
                      >
                        <Volleyball className="h-4 w-4" />
                        <span className="font-medium">Courts</span>
                      </NavLink>
                    )}
                  </div>
                )}
              </div>

              {/* Loyalty Program and Polls remain as standalone links */}
              <NavLink
                to="/dashboard/user/loyalty-program"
                className={({ isActive }) =>
                  isActive
                    ? "px-4 py-2 rounded-lg bg-white/15 text-white font-semibold transition-all flex items-center gap-2"
                    : "px-4 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/8 transition-all flex items-center gap-2"
                }
              >
                <Star className="h-4 w-4" />
                Loyalty Program
              </NavLink>
              <NavLink
                to="/dashboard/user/vendors-poll"
                className={({ isActive }) =>
                  isActive
                    ? "px-4 py-2 rounded-lg bg-white/15 text-white font-semibold transition-all flex items-center gap-2"
                    : "px-4 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/8 transition-all flex items-center gap-2"
                }
              >
                <Vote className="h-4 w-4" />
                Polls
              </NavLink>
            </div>

            {/* Right - Wallet + Logout */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-white/90 text-sm">
                <Wallet className="h-4 w-4" />
                <span className="font-semibold">
                  {formatWallet(user.wallet)} EGP
                </span>
              </div>
              <button
                onClick={handleLogout}
                aria-label="Logout"
                title="Logout"
                className="px-3 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 text-sm"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </nav>
      </header>
    </div>
  );
};

export default NavbarUser;
