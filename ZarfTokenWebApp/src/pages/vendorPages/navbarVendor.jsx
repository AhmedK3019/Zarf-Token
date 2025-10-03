import { Link } from "react-router-dom";

const NavbarVendor = ({ vendor }) => {
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
            to="/upcoming-bazars"
            className="transition-colors hover:text-primary"
          >
            Upcoming Bazars
          </Link>
          <Link
            to="/apply-booth"
            className="transition-colors hover:text-primary"
          >
            Apply for Booth
          </Link>
          <Link
            to="/my-requests"
            className="transition-colors hover:text-primary"
          >
            My Requests
          </Link>
          <Link
            to="/accepted-booths"
            className="transition-colors hover:text-primary"
          >
            Accepted Booths
          </Link>
          {vendor?.loyal ? (
            <Link
              to="/cancel-loyalty"
              className="transition-colors hover:text-primary"
            >
              Cancel Loyalty Program
            </Link>
          ) : (
            <Link
              to="/apply-loyalty"
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
