import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuthUser } from "../../hooks/auth";
import { useState, useRef, useEffect } from "react";
import {
  LogOut,
  Calendar,
  ShoppingBag,
  List,
  CheckSquare,
  SquarePlus,
  Star,
  Bell,
  ChevronDown,
} from "lucide-react";
import logo from "../../assets/logo.png";
import NotificationsDrawer from "../../components/NotificationsDrawer";

const NavbarVendor = ({ vendor }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthUser();
  // Hooks first so call order is stable even if we return early
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // if not authenticated or not a vendor, don't render nav
  if (!user || user.role !== "Vendor") return null;

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

            {/* Center - Links */}
            <div className="hidden lg:flex items-center gap-4 text-sm font-medium text-white">
              <NavLink
                to="/dashboard/vendor/upcoming-bazaars"
                className={({ isActive }) =>
                  isActive
                    ? "px-4 py-2 rounded-lg bg-white/15 text-white font-semibold transition-all flex items-center gap-2"
                    : "px-4 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/8 transition-all flex items-center gap-2"
                }
              >
                <Calendar className="h-4 w-4" />
                Bazaars
              </NavLink>
              <NavLink
                to="/dashboard/vendor/apply-booth"
                className={({ isActive }) =>
                  isActive
                    ? "px-4 py-2 rounded-lg bg-white/15 text-white font-semibold transition-all flex items-center gap-2"
                    : "px-4 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/8 transition-all flex items-center gap-2"
                }
              >
                <SquarePlus className="h-4 w-4" />
                Apply Booth
              </NavLink>
              <NavLink
                to="/dashboard/vendor/my-requests"
                className={({ isActive }) =>
                  isActive
                    ? "px-4 py-2 rounded-lg bg-white/15 text-white font-semibold transition-all flex items-center gap-2"
                    : "px-4 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/8 transition-all flex items-center gap-2"
                }
              >
                <List className="h-4 w-4" />
                Requests
              </NavLink>
              <NavLink
                to="/dashboard/vendor/accepted-booths"
                className={({ isActive }) =>
                  isActive
                    ? "px-4 py-2 rounded-lg bg-white/15 text-white font-semibold transition-all flex items-center gap-2"
                    : "px-4 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/8 transition-all flex items-center gap-2"
                }
              >
                <CheckSquare className="h-4 w-4" />
                Accepted
              </NavLink>
              <NavLink
                to="/dashboard/vendor/loyalty-program"
                className={({ isActive }) =>
                  isActive
                    ? "px-4 py-2 rounded-lg bg-white/15 text-white font-semibold transition-all flex items-center gap-2"
                    : "px-4 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/8 transition-all flex items-center gap-2"
                }
              >
                <Star className="h-4 w-4" />
                Loyalty
              </NavLink>
            </div>

            {/* Right - Logout */}
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
      </header>
    </div>
  );
};

export default NavbarVendor;
