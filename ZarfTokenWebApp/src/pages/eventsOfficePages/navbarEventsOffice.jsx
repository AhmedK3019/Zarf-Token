import { NavLink } from "react-router-dom";
import logo from "../../assets/logo.png";

const NavbarEventsOffice = () => {
  return (
    <div className="flex w-full justify-center pt-9 pb-4">
      <header className="flex w-[86%] max-w-5xl items-center justify-between rounded-full bg-white/95 px-5 py-2.5 shadow-[0_14px_32px_rgba(115,108,237,0.2)] backdrop-blur md:px-7">
        <img
          src={logo}
          alt="Logo"
          className="h-8 w-8 rounded-full bg-primary/10 p-1"
        />
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-primary/80">
          <NavLink
            to="/dashboard/eventsOffice/notifications"
            className={({ isActive }) =>
              isActive
                ? "rounded-full bg-black/5 px-4 py-2 text-primary shadow-inner transform scale-100"
                : "transition-colors hover:text-primary transform hover:scale-105"
            }
          >
            Notifications
          </NavLink>
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

        <div className="flex items-center gap-2 text-sm font-medium">
          <button className="rounded-full border border-primary px-4 py-2 text-primary transition-colors hover:bg-primary hover:text-white">
            Logout
          </button>
        </div>
      </header>
    </div>
  );
};

export default NavbarEventsOffice;
