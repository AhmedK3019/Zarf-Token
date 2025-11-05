import { NavLink, useNavigate } from "react-router-dom";
import { useAuthUser } from "../../hooks/auth";
import { LogOut } from "lucide-react";
import logo from "../../assets/logo.png";
import NotificationsDrawer from "../../components/NotificationsDrawer";

const NavbarEventsOffice = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthUser();
  if (!user || user.role !== "Event office") return null;

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
          className="-ml-2 mr-2 rounded-full p-1 text-primary hover:bg-black/5"
        >
          <LogOut className="h-6 w-6" />
        </button>
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-primary/80">
          {/* Notifications removed from main nav; use the logo button on the right to open the drawer */}
          <NavLink
            to="/dashboard/eventsOffice/all-events"
            className={({ isActive }) =>
              isActive
                ? "rounded-full bg-black/5 px-4 py-2 text-primary shadow-inner transform scale-100"
                : "transition-colors hover:text-primary transform hover:scale-105"
            }
          >
            All Events
          </NavLink>
          <NavLink
            to="/dashboard/eventsOffice/create-event"
            className={({ isActive }) =>
              isActive
                ? "rounded-full bg-black/5 px-4 py-2 text-primary shadow-inner transform scale-100"
                : "transition-colors hover:text-primary transform hover:scale-105"
            }
          >
            Create Event
          </NavLink>
          <NavLink
            to="/dashboard/eventsOffice/workshop-requests"
            className={({ isActive }) =>
              isActive
                ? "rounded-full bg-black/5 px-4 py-2 text-primary shadow-inner transform scale-100"
                : "transition-colors hover:text-primary transform hover:scale-105"
            }
          >
            Workshop Requests
          </NavLink>
          <NavLink
            to="/dashboard/eventsOffice/archived-events"
            className={({ isActive }) =>
              isActive
                ? "rounded-full bg-black/5 px-4 py-2 text-primary shadow-inner transform scale-100"
                : "transition-colors hover:text-primary transform hover:scale-105"
            }
          >
            Archived Events
          </NavLink>
          <NavLink
            to="/dashboard/eventsOffice/generate-qr"
            className={({ isActive }) =>
              isActive
                ? "rounded-full bg-black/5 px-4 py-2 text-primary shadow-inner transform scale-100"
                : "transition-colors hover:text-primary transform hover:scale-105"
            }
          >
            Generate QR
          </NavLink>
          <NavLink
            to="/dashboard/eventsOffice/loyalty-vendors"
            className={({ isActive }) =>
              isActive
                ? "rounded-full bg-black/5 px-4 py-2 text-primary shadow-inner transform scale-100"
                : "transition-colors hover:text-primary transform hover:scale-105"
            }
          >
            Loyalty Vendors
          </NavLink>
          <NavLink
            to="/dashboard/eventsOffice/vendor-requests"
            className={({ isActive }) =>
              isActive
                ? "rounded-full bg-black/5 px-4 py-2 text-primary shadow-inner transform scale-100"
                : "transition-colors hover:text-primary transform hover:scale-105"
            }
          >
            Vendor Requests
          </NavLink>
          <NavLink
            to="/dashboard/eventsOffice/vendor-poll"
            className={({ isActive }) =>
              isActive
                ? "rounded-full bg-black/5 px-4 py-2 text-primary shadow-inner transform scale-100"
                : "transition-colors hover:text-primary transform hover:scale-105"
            }
          >
            Vendor Poll
          </NavLink>
          <NavLink
            to="/dashboard/eventsOffice/gym-schedule"
            className={({ isActive }) =>
              isActive
                ? "rounded-full bg-black/5 px-4 py-2 text-primary shadow-inner transform scale-100"
                : "transition-colors hover:text-primary transform hover:scale-105"
            }
          >
            Gym Schedule
          </NavLink>
        </nav>
      </header>
      <div className="flex px-4 items-center gap-2 text-sm font-medium">
        <NotificationsDrawer />
      </div>
    </div>
  );
};

export default NavbarEventsOffice;
