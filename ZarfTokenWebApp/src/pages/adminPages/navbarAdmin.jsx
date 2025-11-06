import { NavLink, useNavigate } from "react-router-dom";
import { useAuthUser } from "../../hooks/auth";
import {
  LogOut,
} from "lucide-react";
import NotificationsDrawer from "../../components/NotificationsDrawer";

const NavbarAdmin = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthUser();
  if (!user || user.role !== "Admin") return null;

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

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
            <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-white">
              <NavLink
                to="/dashboard/admin/all-events"
                className={({ isActive }) =>
                  isActive
                    ? "px-4 py-2 rounded-lg bg-white/10 text-white font-semibold transition-all"
                    : "px-4 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/5 transition-all"
                }
              >
                All Events
              </NavLink>
              <NavLink
                to="/dashboard/admin/signup-requests"
                className={({ isActive }) =>
                  isActive
                    ? "px-4 py-2 rounded-lg bg-white/10 text-white font-semibold transition-all"
                    : "px-4 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/5 transition-all"
                }
              >
                Signup Requests
              </NavLink>
              <NavLink
                to="/dashboard/admin/vendor-requests"
                className={({ isActive }) =>
                  isActive
                    ? "px-4 py-2 rounded-lg bg-white/10 text-white font-semibold transition-all"
                    : "px-4 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/5 transition-all"
                }
              >
                Vendor Requests
              </NavLink>
              <NavLink
                to="/dashboard/admin/loyalty-vendors"
                className={({ isActive }) =>
                  isActive
                    ? "px-4 py-2 rounded-lg bg-white/10 text-white font-semibold transition-all"
                    : "px-4 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/5 transition-all"
                }
              >
                Loyalty Vendors
              </NavLink>
              <NavLink
                to="/dashboard/admin/all-users"
                className={({ isActive }) =>
                  isActive
                    ? "px-4 py-2 rounded-lg bg-white/10 text-white font-semibold transition-all"
                    : "px-4 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/5 transition-all"
                }
              >
                All Users
              </NavLink>
              <NavLink
                to="/dashboard/admin/add-admin"
                className={({ isActive }) =>
                  isActive
                    ? "px-4 py-2 rounded-lg bg-white/10 text-white font-semibold transition-all"
                    : "px-4 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/5 transition-all"
                }
              >
                Add Admin | Officer
              </NavLink>
              <NavLink
                to="/dashboard/admin/all-admins"
                className={({ isActive }) =>
                  isActive
                    ? "px-4 py-2 rounded-lg bg-white/10 text-white font-semibold transition-all"
                    : "px-4 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/5 transition-all"
                }
              >
                All Admins & Officers
              </NavLink>
            </div>

            {/* Right side - Logout */}
            <button
              onClick={handleLogout}
              aria-label="Logout"
              title="Logout"
              className="px-4 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <LogOut className="h-5 w-5" />
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
