import { Link } from "react-router-dom";

const NavbarEventsOffice = () => {
  return (
    <div className="flex w-full justify-center pt-9 pb-4">
      <header className="flex w-[86%] max-w-5xl items-center justify-between rounded-full bg-white/95 px-5 py-2.5 shadow-[0_14px_32px_rgba(115,108,237,0.2)] backdrop-blur md:px-7">
        <img
          src="../../assets/logo.png"
          alt="Logo"
          className="h-8 w-8 rounded-full bg-primary/10 p-1"
        />
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-primary/80">
          <Link
            to="/dashboard/eventsOffice/notifications"
            className="rounded-full bg-primary/10 px-4 py-2 text-primary shadow-inner"
          >
            Notifications
          </Link>
          <Link
            to="/dashboard/eventsOffice/all-events"
            className="transition-colors hover:text-primary"
          >
            All Events
          </Link>
          <Link
            to="/dashboard/eventsOffice/create-event"
            className="transition-colors hover:text-primary"
          >
            Create Event
          </Link>
          <Link
            to="/dashboard/eventsOffice/workshop-requests"
            className="transition-colors hover:text-primary"
          >
            Workshop Requests
          </Link>
          <Link
            to="/dashboard/eventsOffice/archived-events"
            className="transition-colors hover:text-primary"
          >
            Archived Events
          </Link>
          <Link
            to="/dashboard/eventsOffice/generate-qr"
            className="transition-colors hover:text-primary"
          >
            Generate QR
          </Link>
          <Link
            to="/dashboard/eventsOffice/loyalty-vendors"
            className="transition-colors hover:text-primary"
          >
            Loyalty Vendors
          </Link>
          <Link
            to="/dashboard/eventsOffice/vendor-requests"
            className="transition-colors hover:text-primary"
          >
            Vendor Requests
          </Link>
          <Link
            to="/dashboard/eventsOffice/vendor-poll"
            className="transition-colors hover:text-primary"
          >
            Vendor Poll
          </Link>
          <Link
            to="/dashboard/eventsOffice/gym-schedule"
            className="transition-colors hover:text-primary"
          >
            Gym Schedule
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

export default NavbarEventsOffice;
