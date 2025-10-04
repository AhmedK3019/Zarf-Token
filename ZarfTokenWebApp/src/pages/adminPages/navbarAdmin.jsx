import { Link } from "react-router-dom";

const NavbarAdmin = () => {
  return (
    <div className="flex w-full justify-center pt-9 pb-4">
      <header className="flex w-[86%] max-w-5xl items-center justify-between rounded-full bg-white/95 px-5 py-2.5 shadow-[0_14px_32px_rgba(115,108,237,0.2)] backdrop-blur md:px-7">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/assets/logo.png"
            alt="Logo"
            className="h-8 w-8 rounded-full bg-primary/10 p-1"
          />
          <span className="text-base font-semibold text-primary">
            Zarf Token
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-primary/80">
          <Link
            to="/notifications"
            className="rounded-full bg-primary/10 px-4 py-2 text-primary shadow-inner"
          >
            Notifications
          </Link>
          <Link
            to="/all-events"
            className="transition-colors hover:text-primary"
          >
            All Events
          </Link>
          <Link
            to="/signup-requests"
            className="transition-colors hover:text-primary"
          >
            SignUp Requests
          </Link>
          <Link
            to="/all-users"
            className="transition-colors hover:text-primary"
          >
            All Users
          </Link>
          <Link
            to="/all-admins"
            className="transition-colors hover:text-primary"
          >
            All Admins
          </Link>
          <Link
            to="/events-office"
            className="transition-colors hover:text-primary"
          >
            Events Office
          </Link>
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

export default NavbarAdmin;
