import { NavLink, useNavigate } from "react-router-dom";
import { useAuthUser } from "../../hooks/auth";
import {
  LogOut,
  Calendar,
  UserPlus,
  Package,
  Star,
  Users,
  ShieldUser,
  FileUser,
} from "lucide-react";
import logo from "../../assets/logo.png";
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
    <div className="flex w-full justify-center pt-9 pb-4">
      <header className="flex w-[86%] max-w-5xl min-w-[820px] items-center justify-center gap-8 rounded-full bg-white/95 px-5 py-2.5 shadow-[0_14px_32px_rgba(115,108,237,0.2)] backdrop-blur md:px-7">
        <button
          onClick={handleLogout}
          aria-label="Logout"
          title="Logout"
          className="-ml-2 mr-2 rounded-full p-1 text-primary hover:bg-black/5 hover:cursor-pointer"
        >
          <LogOut className="h-6 w-6" />
        </button>
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-primary/80 whitespace-nowrap">
          {/* Notifications removed from main nav; use the logo button on the right to open the drawer */}
          <NavLink
            to="/dashboard/admin/all-events"
            className={({ isActive }) =>
              isActive
                ? "rounded-full bg-black/5 px-3 py-2 text-primary shadow-inner transform scale-100"
                : "transition-colors hover:text-primary transform hover:scale-105"
            }
            title="All Events"
          >
            <Calendar className="h-5 w-5" />
          </NavLink>
          <NavLink
            to="/dashboard/admin/signup-requests"
            className={({ isActive }) =>
              isActive
                ? "rounded-full bg-black/5 px-3 py-2 text-primary shadow-inner transform scale-100"
                : "transition-colors hover:text-primary transform hover:scale-105"
            }
            title="SignUp Requests"
          >
            <FileUser className="h-5 w-5" />
          </NavLink>
          <NavLink
            to="/dashboard/admin/vendor-requests"
            className={({ isActive }) =>
              isActive
                ? "rounded-full bg-black/5 px-3 py-2 text-primary shadow-inner transform scale-100"
                : "transition-colors hover:text-primary transform hover:scale-105"
            }
            title="Vendor Requests"
          >
            <Package className="h-5 w-5" />
          </NavLink>
          <NavLink
            to="/dashboard/admin/loyalty-vendors"
            className={({ isActive }) =>
              isActive
                ? "rounded-full bg-black/5 px-3 py-2 text-primary shadow-inner transform scale-100"
                : "transition-colors hover:text-primary transform hover:scale-105"
            }
            title="Loyalty Vendors"
          >
            <Star className="h-5 w-5" />
          </NavLink>
          <NavLink
            to="/dashboard/admin/all-users"
            className={({ isActive }) =>
              isActive
                ? "rounded-full bg-black/5 px-3 py-2 text-primary shadow-inner transform scale-100"
                : "transition-colors hover:text-primary transform hover:scale-105"
            }
            title="All Users"
          >
            <Users className="h-5 w-5" />
          </NavLink>
          <NavLink
            to="/dashboard/admin/add-admin"
            className={({ isActive }) =>
              isActive
                ? "rounded-full bg-black/5 px-3 py-2 text-primary shadow-inner transform scale-100"
                : "transition-colors hover:text-primary transform hover:scale-105"
            }
            title="Add Admin | Officer"
          >
            <UserPlus className="h-5 w-5" />
          </NavLink>
          <NavLink
            to="/dashboard/admin/all-admins"
            className={({ isActive }) =>
              isActive
                ? "rounded-full bg-black/5 px-3 py-2 text-primary shadow-inner transform scale-100"
                : "transition-colors hover:text-primary transform hover:scale-105"
            }
            title="All Admins & Officers"
          >
            <ShieldUser className="h-5 w-5" />
          </NavLink>
        </nav>
      </header>
      <div className="flex px-4 items-center gap-2 text-sm font-medium">
        <NotificationsDrawer />
      </div>
    </div>
  );
};

export default NavbarAdmin;
