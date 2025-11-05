import { NavLink, useNavigate } from "react-router-dom";
import { useAuthUser } from "../../hooks/auth";
import {
  LogOut,
  Calendar,
  ShoppingBag,
  List,
  CheckSquare,
  Star,
} from "lucide-react";
import logo from "../../assets/logo.png";

const NavbarVendor = ({ vendor }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthUser();
  // if not authenticated or not a vendor, don't render nav
  if (!user || user.role !== "Vendor") return null;

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="flex w-full justify-center pt-9 pb-4">
      <header className="flex w-[86%] max-w-3xl min-w-[820px] items-center justify-center gap-8 rounded-full bg-white/95 px-5 py-2.5 shadow-[0_14px_32px_rgba(115,108,237,0.2)] backdrop-blur md:px-7">
        <button
          onClick={handleLogout}
          aria-label="Logout"
          title="Logout"
          className="-ml-2 mr-2 rounded-full p-1 text-primary hover:bg-black/5"
        >
          <LogOut className="h-6 w-6" />
        </button>
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-primary/80 whitespace-nowrap">
          <NavLink
            to="/dashboard/vendor/upcoming-bazaars"
            className={({ isActive }) =>
              isActive
                ? "rounded-full bg-black/5 px-3 py-2 text-primary shadow-inner transform scale-100"
                : "transition-colors hover:text-primary transform hover:scale-105"
            }
            title="Upcoming Bazaars"
          >
            <Calendar className="h-5 w-5" />
          </NavLink>
          <NavLink
            to="/dashboard/vendor/apply-booth"
            className={({ isActive }) =>
              isActive
                ? "rounded-full bg-black/5 px-3 py-2 text-primary shadow-inner transform scale-100"
                : "transition-colors hover:text-primary transform hover:scale-105"
            }
            title="Apply for Booth"
          >
            <ShoppingBag className="h-5 w-5" />
          </NavLink>
          <NavLink
            to="/dashboard/vendor/my-requests"
            className={({ isActive }) =>
              isActive
                ? "rounded-full bg-black/5 px-3 py-2 text-primary shadow-inner transform scale-100"
                : "transition-colors hover:text-primary transform hover:scale-105"
            }
            title="My Requests"
          >
            <List className="h-5 w-5" />
          </NavLink>
          <NavLink
            to="/dashboard/vendor/accepted-booths"
            className={({ isActive }) =>
              isActive
                ? "rounded-full bg-black/5 px-3 py-2 text-primary shadow-inner transform scale-100"
                : "transition-colors hover:text-primary transform hover:scale-105"
            }
            title="Accepted Booths"
          >
            <CheckSquare className="h-5 w-5" />
          </NavLink>
          {vendor?.loyal ? (
            <NavLink
              to="/dashboard/vendor/cancel-loyalty"
              className={({ isActive }) =>
                isActive
                  ? "rounded-full bg-black/5 px-3 py-2 text-primary shadow-inner transform scale-100"
                  : "transition-colors hover:text-primary transform hover:scale-105"
              }
              title="Cancel Loyalty Program"
            >
              <Star className="h-5 w-5" />
            </NavLink>
          ) : (
            <NavLink
              to="/dashboard/vendor/apply-loyalty"
              className={({ isActive }) =>
                isActive
                  ? "rounded-full bg-black/5 px-3 py-2 text-primary shadow-inner transform scale-100"
                  : "transition-colors hover:text-primary transform hover:scale-105"
              }
              title="Join Loyalty Program"
            >
              <Star className="h-5 w-5" />
            </NavLink>
          )}
        </nav>
      </header>
      <div className="flex px-4 items-center gap-2 text-sm font-medium"></div>
    </div>
  );
};

export default NavbarVendor;
