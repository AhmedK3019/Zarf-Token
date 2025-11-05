import { NavLink, useNavigate } from "react-router-dom";
import { useAuthUser } from "../../hooks/auth"; // example context hook
import logo from "../../assets/logo.png";
import NotificationsDrawer from "../../components/NotificationsDrawer";

const NavbarUser = () => {
  const { user } = useAuthUser(); // { role, wallet }

  if (!user) return null; // or a loading state

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
          {/* Notifications removed from main nav; use the logo button on the right to open the drawer */}
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
        <NotificationsDrawer />
        <LogoutButton />
      </div>
    </div>
  );
};

export default NavbarUser;

function LogoutButton() {
  const navigate = useNavigate();
  const { logout } = useAuthUser();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <button
      onClick={handleLogout}
      className="rounded-full border border-primary bg-white px-4 py-2 text-primary transition-colors hover:bg-black/10"
    >
      Logout
    </button>
  );
}
