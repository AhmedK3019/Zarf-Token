import { NavLink } from "react-router-dom";
import { useAuthUser } from "../../hooks/auth"; // example context hook
import logo from "../../assets/logo.png";

const NavbarUser = () => {
  const { user } = useAuthUser(); // { role, wallet }

  const commonLinks = (
    <>
      <NavLink
        to="/dashboard/user/notifications"
        className="rounded-full bg-primary/10 px-4 py-2 text-primary shadow-inner"
      >
        Notifications
      </NavLink>
      <NavLink
        to="/dashboard/user/all-events"
        className="transition-colors hover:text-primary"
      >
        All Events
      </NavLink>
      <NavLink
        to="/dashboard/user/wallet"
        className="transition-colors hover:text-primary"
      >
        Wallet (${user.wallet || 0})
      </NavLink>
      <NavLink
        to="/dashboard/user/favourite-events"
        className="transition-colors hover:text-primary"
      >
        Favourite Events
      </NavLink>
      <NavLink
        to="/dashboard/user/registered-events"
        className="transition-colors hover:text-primary"
      >
        Registered Events
      </NavLink>
      <NavLink
        to="/dashboard/user/loyalty-program"
        className="transition-colors hover:text-primary"
      >
        Loyalty Program
      </NavLink>
      <NavLink
        to="/dashboard/user/vendors-poll"
        className="transition-colors hover:text-primary"
      >
        Vendors Poll
      </NavLink>
      <NavLink
        to="/dashboard/user/gym-schedule"
        className="transition-colors hover:text-primary"
      >
        Gym Schedule
      </NavLink>
    </>
  );

  return (
    <div className="flex w-full justify-center pt-9 pb-4">
      <header className="flex w-[86%] max-w-5xl min-w-[820px] items-center justify-center gap-8 rounded-full bg-white/95 px-5 py-2.5 shadow-[0_14px_32px_rgba(115,108,237,0.2)] backdrop-blur md:px-7">
        <img
          src={logo}
          alt="Logo"
          className="h-8 w-8 rounded-full bg-primary/10 p-1"
        />

        <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-primary/80">
          {/* map commonLinks into NavLinks for active styling */}
          <NavLink
            to="/dashboard/user/notifications"
            className={({ isActive }) =>
              isActive
                ? "rounded-full bg-black/5 px-4 py-2 text-primary shadow-inner transform scale-100"
                : "transition-colors hover:text-primary transform hover:scale-105"
            }
          >
            Notifications
          </NavLink>
          <NavLink
            to="/dashboard/user/all-events"
            className={({ isActive }) =>
              isActive
                ? "rounded-full bg-black/5 px-4 py-2 text-primary shadow-inner transform scale-100"
                : "transition-colors hover:text-primary transform hover:scale-105"
            }
          >
            All Events
          </NavLink>
          <NavLink
            to="/dashboard/user/wallet"
            className={({ isActive }) =>
              isActive
                ? "rounded-full bg-black/5 px-4 py-2 text-primary shadow-inner transform scale-100"
                : "transition-colors hover:text-primary transform hover:scale-105"
            }
          >
            Wallet (${user.wallet || 0})
          </NavLink>
          <NavLink
            to="/dashboard/user/favourite-events"
            className={({ isActive }) =>
              isActive
                ? "rounded-full bg-black/5 px-4 py-2 text-primary shadow-inner transform scale-100"
                : "transition-colors hover:text-primary transform hover:scale-105"
            }
          >
            Favourite Events
          </NavLink>
          <NavLink
            to="/dashboard/user/registered-events"
            className={({ isActive }) =>
              isActive
                ? "rounded-full bg-black/5 px-4 py-2 text-primary shadow-inner transform scale-100"
                : "transition-colors hover:text-primary transform hover:scale-105"
            }
          >
            Registered Events
          </NavLink>
          <NavLink
            to="/dashboard/user/loyalty-program"
            className={({ isActive }) =>
              isActive
                ? "rounded-full bg-black/5 px-4 py-2 text-primary shadow-inner transform scale-100"
                : "transition-colors hover:text-primary transform hover:scale-105"
            }
          >
            Loyalty Program
          </NavLink>
          <NavLink
            to="/dashboard/user/vendors-poll"
            className={({ isActive }) =>
              isActive
                ? "rounded-full bg-black/5 px-4 py-2 text-primary shadow-inner transform scale-100"
                : "transition-colors hover:text-primary transform hover:scale-105"
            }
          >
            Vendors Poll
          </NavLink>
          <NavLink
            to="/dashboard/user/gym-schedule"
            className={({ isActive }) =>
              isActive
                ? "rounded-full bg-black/5 px-4 py-2 text-primary shadow-inner transform scale-100"
                : "transition-colors hover:text-primary transform hover:scale-105"
            }
          >
            Gym Schedule
          </NavLink>

          {user.role === "Student" && (
            <NavLink
              to="/dashboard/user/courts"
              className={({ isActive }) =>
                isActive
                  ? "rounded-full bg-black/5 px-4 py-2 text-primary shadow-inner transform scale-100"
                  : "transition-colors hover:text-primary transform hover:scale-105"
              }
            >
              Courts
            </NavLink>
          )}

          {user.role === "Professor" && (
            <>
              <NavLink
                to="/dashboard/user/create-workshop"
                className={({ isActive }) =>
                  isActive
                    ? "rounded-full bg-black/5 px-4 py-2 text-primary shadow-inner transform scale-100"
                    : "transition-colors hover:text-primary transform hover:scale-105"
                }
              >
                Create Workshop
              </NavLink>
              <NavLink
                to="/dashboard/user/my-workshops"
                className={({ isActive }) =>
                  isActive
                    ? "rounded-full bg-black/5 px-4 py-2 text-primary shadow-inner transform scale-100"
                    : "transition-colors hover:text-primary transform hover:scale-105"
                }
              >
                My Workshops
              </NavLink>
            </>
          )}
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

export default NavbarUser;
