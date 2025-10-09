import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";

const NavbarAdmin = () => {
  return (
    <div className="flex w-full justify-center pt-9 pb-4">
      <header className="flex w-[86%] max-w-5xl items-center justify-between rounded-full bg-white/95 px-5 py-2.5 shadow-[0_14px_32px_rgba(115,108,237,0.2)] backdrop-blur md:px-7">
        <img
          src={logo}
          alt="Logo"
          className="h-8 w-8 rounded-full bg-primary/10 p-1"
        />
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-primary/80">
          <Link
            to="/dashboard/admin/notifications"
            className="rounded-full bg-primary/10 px-4 py-2 text-primary shadow-inner"
          >
            Notifications
          </Link>
          <Link
            to="/dashboard/admin/all-events"
            className="transition-colors hover:text-primary"
          >
            All Events
          </Link>
          <Link
            to="/dashboard/admin/signup-requests"
            className="transition-colors hover:text-primary"
          >
            SignUp Requests
          </Link>
          <Link
            to="/dashboard/admin/vendor-requests"
            className="transition-colors hover:text-primary"
          >
            Vendor Requests
          </Link>
          <Link
            to="/dashboard/admin/loyalty-vendors"
            className="transition-colors hover:text-primary"
          >
            Loyalty Vendors
          </Link>
          <Link
            to="/dashboard/admin/all-users"
            className="transition-colors hover:text-primary"
          >
            All Users
          </Link>
          <Link
            to="/dashboard/admin/add-admin"
            className="transition-colors hover:text-primary"
          >
            All Admins
          </Link>
          <Link
            to="/dashboard/admin/events-office"
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
