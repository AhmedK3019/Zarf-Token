import { NavLink } from "react-router-dom";
import logo from "../../assets/logo.png";

const NavbarAdmin = () => {
  return (
    <div className="flex w-full justify-center pt-9 pb-4">
      <header className="flex w-[86%] max-w-5xl min-w-[820px] items-center justify-center gap-8 rounded-full bg-white/95 px-5 py-2.5 shadow-[0_14px_32px_rgba(115,108,237,0.2)] backdrop-blur md:px-7">
        <img
          src={logo}
          alt="Logo"
          className="h-8 w-8 rounded-full bg-primary/10 p-1"
        />
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-primary/80 whitespace-nowrap">
          <NavLink
            to="/dashboard/admin/notifications"
            className={({ isActive }) =>
              isActive
                ? "rounded-full bg-black/5 px-4 py-2 text-primary shadow-inner transform scale-100"
                : "transition-colors hover:text-primary transform hover:scale-105"
            }
          >
            Notifications
          </NavLink>
          <NavLink
            to="/dashboard/admin/all-events"
            className={({ isActive }) =>
              isActive
                ? "rounded-full bg-black/5 px-4 py-2 text-primary shadow-inner transform scale-100"
                : "transition-colors hover:text-primary transform hover:scale-105"
            }
          >
            All Events
          </NavLink>
          <NavLink
            to="/dashboard/admin/signup-requests"
            className={({ isActive }) =>
              isActive
                ? "rounded-full bg-black/5 px-4 py-2 text-primary shadow-inner transform scale-100"
                : "transition-colors hover:text-primary transform hover:scale-105"
            }
          >
            SignUp Requests
          </NavLink>
          <NavLink
            to="/dashboard/admin/vendor-requests"
            className={({ isActive }) =>
              isActive
                ? "rounded-full bg-black/5 px-4 py-2 text-primary shadow-inner transform scale-100"
                : "transition-colors hover:text-primary transform hover:scale-105"
            }
          >
            Vendor Requests
          </NavLink>
          <NavLink
            to="/dashboard/admin/loyalty-vendors"
            className={({ isActive }) =>
              isActive
                ? "rounded-full bg-black/5 px-4 py-2 text-primary shadow-inner transform scale-100"
                : "transition-colors hover:text-primary transform hover:scale-105"
            }
          >
            Loyalty Vendors
          </NavLink>
          <NavLink
            to="/dashboard/admin/all-users"
            className={({ isActive }) =>
              isActive
                ? "rounded-full bg-black/5 px-4 py-2 text-primary shadow-inner transform scale-100"
                : "transition-colors hover:text-primary transform hover:scale-105"
            }
          >
            All Users
          </NavLink>
          <NavLink
            to="/dashboard/admin/add-admin"
            className={({ isActive }) =>
              isActive
                ? "rounded-full bg-black/5 px-4 py-2 text-primary shadow-inner transform scale-100"
                : "transition-colors hover:text-primary transform hover:scale-105"
            }
          >
            Add Admin | Officer
          </NavLink>
          <NavLink
            to="/dashboard/admin/all-admins"
            className={({ isActive }) =>
              isActive
                ? "rounded-full bg-black/5 px-4 py-2 text-primary shadow-inner transform scale-100"
                : "transition-colors hover:text-primary transform hover:scale-105"
            }
          >
            All Admins & Officers
          </NavLink>
        </nav>
      </header>
      <div className="flex px-4 items-center gap-2 text-sm font-medium">
        <button className="rounded-full border border-primary bg-white px-4 py-2 text-primary transition-colors hover:bg-black/10">
          Logout
        </button>
      </div>
    </div>
  );
};

export default NavbarAdmin;
