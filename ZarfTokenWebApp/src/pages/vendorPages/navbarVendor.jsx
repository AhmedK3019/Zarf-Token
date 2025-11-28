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
      <header className="w-full bg-[#001845] shadow-lg">
        <nav className="max-w-7xl mx-auto px-6 py-4">
          <div className="grid grid-cols-3 items-center h-16">
            {/* Left - Logo */}
            <div className="flex items-center gap-3">
              <div className="relative h-16 overflow-visible">
                <img
                  src="/NavbarLogo.png"
                  alt="ZarfToken logo"
                  className="h-16 w-auto object-contain"
                />
                <p className="text-white ml-2 text-lg font-semibold absolute bottom-0 left-16">
                  Welcome, {user.companyname}!
                </p>
              </div>
            </div>

            {/* Center - Links */}
            <div className="hidden lg:flex items-center gap-4 text-sm font-medium text-white justify-self-center">
              <div className="flex items-center gap-1 rounded-full bg-white/5 px-2 py-1 shadow-[0_10px_30px_rgba(0,0,0,0.22)] border border-white/10">
                <NavLink
                  to="/dashboard/vendor/upcoming-bazaars"
                  className={({ isActive }) =>
                    isActive
                      ? "px-4 py-2 rounded-full bg-white/15 text-white font-semibold transition-all flex items-center gap-2 shadow-sm"
                      : "px-4 py-2 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
                  }
                >
                  <Calendar className="h-4 w-4" />
                  Bazaars
                </NavLink>
                <NavLink
                  to="/dashboard/vendor/apply-booth"
                  className={({ isActive }) =>
                    isActive
                      ? "px-4 py-2 rounded-full bg-white/15 text-white font-semibold transition-all flex items-center gap-2 shadow-sm"
                      : "px-4 py-2 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
                  }
                >
                  <SquarePlus className="h-4 w-4" />
                  Apply
                </NavLink>
                <NavLink
                  to="/dashboard/vendor/my-requests"
                  className={({ isActive }) =>
                    isActive
                      ? "px-4 py-2 rounded-full bg-white/15 text-white font-semibold transition-all flex items-center gap-2 shadow-sm"
                      : "px-4 py-2 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
                  }
                >
                  <List className="h-4 w-4" />
                  Requests
                </NavLink>
                <NavLink
                  to="/dashboard/vendor/loyalty-program"
                  className={({ isActive }) =>
                    isActive
                      ? "px-4 py-2 rounded-full bg-white/15 text-white font-semibold transition-all flex items-center gap-2 shadow-sm"
                      : "px-4 py-2 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
                  }
                >
                  <Star className="h-4 w-4" />
                  Loyalty
                </NavLink>
              </div>
            </div>

            {/* Right - Notifications + Logout */}
            <div className="flex items-center gap-2 justify-self-end">
              <NotificationsDrawer />
              <button
                onClick={handleLogout}
                aria-label="Logout"
                title="Logout"
                className="p-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-all"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </nav>
      </header>
    </div>
  );
};

export default NavbarVendor;
