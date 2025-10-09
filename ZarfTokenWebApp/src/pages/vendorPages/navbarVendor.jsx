import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";

const NavbarVendor = ({ vendor }) => {
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
            to="/dashboard/vendor/upcoming-bazars"
            className="transition-colors hover:text-primary"
          >
            Upcoming Bazars
          </Link>
          <Link
            to="/dashboard/vendor/apply-booth"
            className="transition-colors hover:text-primary"
          >
            Apply for Booth
          </Link>
          <Link
            to="/dashboard/vendor/my-requests"
            className="transition-colors hover:text-primary"
          >
            My Requests
          </Link>
          <Link
            to="/dashboard/vendor/accepted-booths"
            className="transition-colors hover:text-primary"
          >
            Accepted Booths
          </Link>
          {vendor?.loyal ? (
            <Link
              to="/dashboard/vendor/cancel-loyalty"
              className="transition-colors hover:text-primary"
            >
              Cancel Loyalty Program
            </Link>
          ) : (
            <Link
              to="/dashboard/vendor/apply-loyalty"
              className="transition-colors hover:text-primary"
            >
              Join Loyalty Program
            </Link>
          )}
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

export default NavbarVendor;
