import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuthUser } from "../../hooks/auth";
import { useState, useRef, useEffect } from "react";
import {
  LogOut,
  Calendar,
  Users,
  UserPlus,
  ShieldUser,
  Bell,
  Store,
  FileText,
  PackageCheck,
  ChevronDown,
} from "lucide-react";
import NotificationsDrawer from "../../components/NotificationsDrawer";

const NavbarAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthUser();
  const [usersDropdownOpen, setUsersDropdownOpen] = useState(false);
  const [requestsDropdownOpen, setRequestsDropdownOpen] = useState(false);
  const usersDropdownRef = useRef(null);
  const requestsDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        usersDropdownRef.current &&
        !usersDropdownRef.current.contains(event.target)
      ) {
        setUsersDropdownOpen(false);
      }
      if (
        requestsDropdownRef.current &&
        !requestsDropdownRef.current.contains(event.target)
      ) {
        setRequestsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close dropdowns when route changes
  useEffect(() => {
    setUsersDropdownOpen(false);
    setRequestsDropdownOpen(false);
  }, [location.pathname]);

  if (!user || user.role !== "Admin") return null;

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  // Check if any user-related route is active
  const isUsersActive =
    location.pathname.includes("/all-users") ||
    location.pathname.includes("/all-admins") ||
    location.pathname.includes("/add-admin");

  // Check if any request-related route is active
  const isRequestsActive =
    location.pathname.includes("/signup-requests") ||
    location.pathname.includes("/vendor-requests");

  return (
    <div className="w-full">
      {/* Dark Navy Header */}
      <header className="w-full bg-[#001233] shadow-lg">
        {/* Navigation Bar */}
        <nav className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Notifications */}
            <div className="flex items-center gap-4">
              <NotificationsDrawer />
            </div>

            {/* Center - Navigation Links */}
            <div className="hidden lg:flex items-center gap-4 text-sm font-medium text-white">
              {/* Events - Prominent button */}
              <NavLink
                to="/dashboard/admin/all-events"
                className={({ isActive }) =>
                  isActive
                    ? "px-5 py-2.5 rounded-lg bg-white/15 text-white font-semibold transition-all flex items-center gap-2 shadow-md"
                    : "px-5 py-2.5 rounded-lg text-white/90 hover:text-white hover:bg-white/8 transition-all flex items-center gap-2"
                }
              >
                <Calendar className="h-4 w-4" />
                Events
              </NavLink>

              {/* Requests Dropdown */}
              <div className="relative" ref={requestsDropdownRef}>
                <button
                  onClick={() => {
                    setRequestsDropdownOpen(!requestsDropdownOpen);
                    setUsersDropdownOpen(false);
                  }}
                  className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                    isRequestsActive
                      ? "bg-white/10 text-white font-semibold"
                      : "text-white/90 hover:text-white hover:bg-white/5"
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
                    ? "px-4 py-2 rounded-lg bg-white/10 text-white font-semibold transition-all flex items-center gap-2"
                    : "px-4 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2"
                }
              >
                <Store className="h-4 w-4" />
                Loyalty Program
              </NavLink>

              {/* Users Dropdown */}
              <div className="relative" ref={usersDropdownRef}>
                <button
                  onClick={() => {
                    setUsersDropdownOpen(!usersDropdownOpen);
                    setRequestsDropdownOpen(false);
                  }}
                  className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                    isUsersActive
                      ? "bg-white/10 text-white font-semibold"
                      : "text-white/90 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Users className="h-4 w-4" />
                  Users
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      usersDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {usersDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
                    <NavLink
                      to="/dashboard/admin/all-users"
                      onClick={() => setUsersDropdownOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 text-gray-800 hover:bg-primary/5 hover:text-primary transition-colors ${
                          isActive
                            ? "bg-primary/10 text-primary font-semibold"
                            : ""
                        }`
                      }
                    >
                      <Users
                        className={`h-4 w-4 ${
                          location.pathname.includes("/all-users")
                            ? "text-primary"
                            : "text-gray-600"
                        }`}
                      />
                      <span className="font-medium">All Users</span>
                    </NavLink>
                    <NavLink
                      to="/dashboard/admin/all-admins"
                      onClick={() => setUsersDropdownOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 text-gray-800 hover:bg-primary/5 hover:text-primary transition-colors border-t border-gray-200 ${
                          isActive
                            ? "bg-primary/10 text-primary font-semibold"
                            : ""
                        }`
                      }
                    >
                      <ShieldUser
                        className={`h-4 w-4 ${
                          location.pathname.includes("/all-admins")
                            ? "text-primary"
                            : "text-gray-600"
                        }`}
                      />
                      <span className="font-medium">Admins & Officers</span>
                    </NavLink>
                    <NavLink
                      to="/dashboard/admin/add-admin"
                      onClick={() => setUsersDropdownOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 text-gray-800 hover:bg-primary/5 hover:text-primary transition-colors border-t border-gray-200 ${
                          isActive
                            ? "bg-primary/10 text-primary font-semibold"
                            : ""
                        }`
                      }
                    >
                      <UserPlus
                        className={`h-4 w-4 ${
                          location.pathname.includes("/add-admin")
                            ? "text-primary"
                            : "text-gray-600"
                        }`}
                      />
                      <span className="font-medium">Add Admin/Officer</span>
                    </NavLink>
                  </div>
                )}
              </div>
            </div>

            {/* Right side - Logout */}
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
        </nav>

        {/* Main Heading and Subtitle */}
        <div className="max-w-7xl mx-auto px-6 pb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Campus Events & Booths
          </h1>
          <p className="text-lg text-white/80 max-w-3xl mx-auto">
            Discover amazing events and platform booths across campus. Filter by
            category to find exactly what you're looking for.
          </p>
        </div>
      </header>
    </div>
  );
};

export default NavbarAdmin;
