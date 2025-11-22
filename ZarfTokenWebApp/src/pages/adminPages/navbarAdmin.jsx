import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuthUser } from "../../hooks/auth";
import { useState, useRef, useEffect } from "react";
import {
  LogOut,
  Calendar,
  Users,
  Bell,
  Store,
  Star,
  FileText,
  PackageCheck,
  ChevronDown,
} from "lucide-react";
import NotificationsDrawer from "../../components/NotificationsDrawer";

const NavbarAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthUser();
  const [eventsDropdownOpen, setEventsDropdownOpen] = useState(false);
  const eventsDropdownRef = useRef(null);
  const [requestsDropdownOpen, setRequestsDropdownOpen] = useState(false);
  const requestsDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        requestsDropdownRef.current &&
        !requestsDropdownRef.current.contains(event.target)
      ) {
        setRequestsDropdownOpen(false);
      }
      if (
        eventsDropdownRef.current &&
        !eventsDropdownRef.current.contains(event.target)
      ) {
        setEventsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close dropdowns when route changes
  useEffect(() => {
    setRequestsDropdownOpen(false);
    setEventsDropdownOpen(false);
  }, [location.pathname]);

  if (!user || user.role !== "Admin") return null;

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  // Check if any user-related route is active
  const isUsersActive = location.pathname.includes("/users");

  // Check if any request-related route is active
  const isRequestsActive =
    location.pathname.includes("/signup-requests") ||
    location.pathname.includes("/vendor-requests");

  const isEventsActive =
    location.pathname.includes("/all-events") ||
    location.pathname.includes("/events-sales-report");

  return (
    <div className="w-full">
      {/* Dark Navy Header */}
      <header className="w-full bg-[#001233] shadow-lg">
        {/* Navigation Bar */}
        <nav className="max-w-7xl mx-auto px-6 py-4">
          <div className="grid grid-cols-3 items-center h-16">
            {/* Left side - Logo */}
            <div className="flex items-center gap-3 justify-self-start">
              <div className="relative h-16 overflow-visible">
                <img
                  src="/NavbarLogo.png"
                  alt="ZarfToken logo"
                  className="h-16 w-auto object-contain"
                />
                <p className="text-white ml-2 text-lg font-semibold absolute bottom-0 left-16">
                  Welcome, Admin!
                </p>
              </div>
            </div>

            {/* Center - Navigation Links inside a pill */}
            <div className="hidden lg:flex items-center gap-4 text-sm font-medium text-white justify-self-center">
              <div className="flex items-center gap-1 rounded-full bg-white/5 px-2 py-1 shadow-[0_10px_30px_rgba(0,0,0,0.22)] border border-white/10">
                {/* Events Dropdown */}
                <div className="relative" ref={eventsDropdownRef}>
                  <button
                    onClick={() => {
                      setEventsDropdownOpen(!eventsDropdownOpen);
                      setRequestsDropdownOpen(false);
                    }}
                    className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 ${
                      isEventsActive
                        ? "bg-white/15 text-white font-semibold shadow-sm"
                        : "text-white/90 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Calendar className="h-4 w-4" />
                    Events
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        eventsDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {eventsDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
                      <NavLink
                        to="/dashboard/admin/all-events"
                        onClick={() => setEventsDropdownOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-3 text-gray-800 hover:bg-primary/5 hover:text-primary transition-colors ${
                            isActive
                              ? "bg-primary/10 text-primary font-semibold"
                              : ""
                          }`
                        }
                      >
                        <Calendar
                          className={`h-4 w-4 ${
                            location.pathname.includes("/all-events")
                              ? "text-primary"
                              : "text-gray-600"
                          }`}
                        />
                        <span className="font-medium">All Events</span>
                      </NavLink>
                      <NavLink
                        to="/dashboard/admin/events-sales-report"
                        onClick={() => setEventsDropdownOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-3 text-gray-800 hover:bg-primary/5 hover:text-primary transition-colors border-t border-gray-200 ${
                            isActive
                              ? "bg-primary/10 text-primary font-semibold"
                              : ""
                          }`
                        }
                      >
                        <FileText
                          className={`h-4 w-4 ${
                            location.pathname.includes("/events-sales-report")
                              ? "text-primary"
                              : "text-gray-600"
                          }`}
                        />
                        <span className="font-medium">Events Sales Report</span>
                      </NavLink>
                      <NavLink
                        to="/dashboard/admin/event-attendees-report"
                        onClick={() => setEventsDropdownOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-3 text-gray-800 hover:bg-primary/5 hover:text-primary transition-colors border-t border-gray-200 ${
                            isActive
                              ? "bg-primary/10 text-primary font-semibold"
                              : ""
                          }`
                        }
                      >
                        <FileText
                          className={`h-4 w-4 ${
                            location.pathname.includes(
                              "/event-attendees-report"
                            )
                              ? "text-primary"
                              : "text-gray-600"
                          }`}
                        />
                        <span className="font-medium">
                          Event Attendees Report
                        </span>
                      </NavLink>
                    </div>
                  )}
                </div>

                {/* Requests Dropdown */}
                <div className="relative" ref={requestsDropdownRef}>
                  <button
                    onClick={() => {
                      setRequestsDropdownOpen(!requestsDropdownOpen);
                    }}
                    className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 ${
                      isRequestsActive
                        ? "bg-white/15 text-white font-semibold shadow-sm"
                        : "text-white/90 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <FileText className="h-4 w-4" />
                    Requests
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        requestsDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {requestsDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
                      <NavLink
                        to="/dashboard/admin/signup-requests"
                        onClick={() => setRequestsDropdownOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-3 text-gray-800 hover:bg-primary/5 hover:text-primary transition-colors ${
                            isActive
                              ? "bg-primary/10 text-primary font-semibold"
                              : ""
                          }`
                        }
                      >
                        <Bell
                          className={`h-4 w-4 ${
                            location.pathname.includes("/signup-requests")
                              ? "text-primary"
                              : "text-gray-600"
                          }`}
                        />
                        <span className="font-medium">Sign-Up Requests</span>
                      </NavLink>
                      <NavLink
                        to="/dashboard/admin/vendor-requests"
                        onClick={() => setRequestsDropdownOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-3 text-gray-800 hover:bg-primary/5 hover:text-primary transition-colors border-t border-gray-200 ${
                            isActive
                              ? "bg-primary/10 text-primary font-semibold"
                              : ""
                          }`
                        }
                      >
                        <PackageCheck
                          className={`h-4 w-4 ${
                            location.pathname.includes("/vendor-requests")
                              ? "text-primary"
                              : "text-gray-600"
                          }`}
                        />
                        <span className="font-medium">Vendor Applications</span>
                      </NavLink>
                    </div>
                  )}
                </div>

                {/* Manage Vendors */}
                <NavLink
                  to="/dashboard/admin/loyalty-vendors"
                  className={({ isActive }) =>
                    isActive
                      ? "px-4 py-2 rounded-full bg-white/15 text-white font-semibold transition-all flex items-center gap-2 shadow-sm"
                      : "px-4 py-2 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
                  }
                >
                  <Store className="h-4 w-4" />
                  Loyals
                </NavLink>

                {/* Loyalty Partners */}
                <NavLink
                  to="/dashboard/admin/loyalty-program"
                  className={({ isActive }) =>
                    isActive
                      ? "px-4 py-2 rounded-full bg-white/15 text-white font-semibold transition-all flex items-center gap-2 shadow-sm"
                      : "px-4 py-2 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
                  }
                >
                  <Star className="h-4 w-4" />
                  Partners
                </NavLink>

                {/* Users Dropdown */}
                <NavLink
                  to="/dashboard/admin/users"
                  className={({ isActive }) =>
                    isActive || isUsersActive
                      ? "px-4 py-2 rounded-full bg-white/15 text-white font-semibold transition-all flex items-center gap-2 shadow-sm"
                      : "px-4 py-2 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
                  }
                >
                  <Users className="h-4 w-4" />
                  Users
                </NavLink>
              </div>
            </div>

            {/* Right side - Notifications + Logout */}
            <div className="flex items-center gap-2 justify-self-end">
              <NotificationsDrawer />
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

        {/* Main Heading and Subtitle */}
        {(() => {
          const path = location.pathname || "";
          let headerTitle = "Campus Events & Booths";
          let headerSubtitle = "";

          if (path.includes("/signup-requests")) {
            headerTitle = "Sign-Up Requests";
            headerSubtitle = "";
          } else if (path.includes("/vendor-requests")) {
            headerTitle = "Vendor Participation Requests";
            headerSubtitle = "";
          } else if (path.includes("/users")) {
            headerTitle = "Users & Roles";
            headerSubtitle = "";
          }

          return (
            <div className="max-w-7xl mx-auto px-6 pb-8 text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                {headerTitle}
              </h1>
              {headerSubtitle && (
                <p className="text-lg text-white/80 max-w-3xl mx-auto">
                  {headerSubtitle}
                </p>
              )}
            </div>
          );
        })()}
      </header>
    </div>
  );
};

export default NavbarAdmin;
