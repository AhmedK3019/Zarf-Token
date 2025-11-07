import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuthUser } from "../../hooks/auth";
import { useState, useRef, useEffect } from "react";
import {
  LogOut,
  Calendar,
  PlusCircle,
  FileText,
  Archive,
  QrCode,
  Star,
  Package,
  BarChart,
  Clock,
  ChevronDown,
} from "lucide-react";
import logo from "../../assets/logo.png";
import NotificationsDrawer from "../../components/NotificationsDrawer";

const NavbarEventsOffice = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthUser();
  const [eventsOpen, setEventsOpen] = useState(false);
  const [requestsOpen, setRequestsOpen] = useState(false);
  const eventsRef = useRef(null);
  const requestsRef = useRef(null);
  const location = useLocation();

  // close dropdowns when clicking outside
  useEffect(() => {
    function onDocClick(e) {
      if (eventsRef.current && !eventsRef.current.contains(e.target)) {
        setEventsOpen(false);
      }
      if (requestsRef.current && !requestsRef.current.contains(e.target)) {
        setRequestsOpen(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  // close on route change
  useEffect(() => {
    setEventsOpen(false);
    setRequestsOpen(false);
  }, [location.pathname]);

  if (!user || user.role !== "Event office") return null;

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="w-full">
      <header className="w-full bg-[#001233] shadow-lg">
        <nav className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left - Notifications */}
            <div className="flex items-center gap-4">
              <NotificationsDrawer />
            </div>

            {/* Center - Links (with dropdowns) */}
            <div className="hidden lg:flex items-center gap-4 text-sm font-medium text-white">
              {/* Events dropdown: All / Create / Archived */}
              <div className="relative" ref={eventsRef}>
                <button
                  onClick={() => setEventsOpen((s) => !s)}
                  aria-expanded={eventsOpen}
                  aria-haspopup="true"
                  className="px-4 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/8 transition-all flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Events</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      eventsOpen ? "-rotate-180" : ""
                    }`}
                  />
                </button>

                {eventsOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white/95 rounded-lg shadow-lg z-20 py-2">
                    <NavLink
                      to="/dashboard/eventsOffice/all-events"
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 text-gray-800 hover:bg-primary/5 hover:text-primary transition-colors ${
                          isActive
                            ? "bg-primary/10 text-primary font-semibold"
                            : ""
                        }`
                      }
                    >
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        All Events
                      </span>
                    </NavLink>
                    <NavLink
                      to="/dashboard/eventsOffice/create-event"
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 text-gray-800 hover:bg-primary/5 hover:text-primary transition-colors ${
                          isActive
                            ? "bg-primary/10 text-primary font-semibold"
                            : ""
                        }`
                      }
                    >
                      <span className="flex items-center gap-2">
                        <PlusCircle className="h-4 w-4" />
                        Create Event
                      </span>
                    </NavLink>
                    <NavLink
                      to="/dashboard/eventsOffice/archived-events"
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 text-gray-800 hover:bg-primary/5 hover:text-primary transition-colors ${
                          isActive
                            ? "bg-primary/10 text-primary font-semibold"
                            : ""
                        }`
                      }
                    >
                      <span className="flex items-center gap-2">
                        <Archive className="h-4 w-4" />
                        Archived Events
                      </span>
                    </NavLink>
                  </div>
                )}
              </div>

              {/* Requests dropdown: Workshop Requests / Vendor Requests */}
              <div className="relative" ref={requestsRef}>
                <button
                  onClick={() => setRequestsOpen((s) => !s)}
                  aria-expanded={requestsOpen}
                  aria-haspopup="true"
                  className="px-4 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/8 transition-all flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  <span>Requests</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      requestsOpen ? "-rotate-180" : ""
                    }`}
                  />
                </button>

                {requestsOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-white/95 rounded-lg shadow-lg z-20 py-2">
                    <NavLink
                      to="/dashboard/eventsOffice/workshop-requests"
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 text-gray-800 hover:bg-primary/5 hover:text-primary transition-colors ${
                          isActive
                            ? "bg-primary/10 text-primary font-semibold"
                            : ""
                        }`
                      }
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Workshop Requests
                      </span>
                    </NavLink>
                    <NavLink
                      to="/dashboard/eventsOffice/vendor-requests"
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 text-gray-800 hover:bg-primary/5 hover:text-primary transition-colors ${
                          isActive
                            ? "bg-primary/10 text-primary font-semibold"
                            : ""
                        }`
                      }
                    >
                      <span className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Vendor Requests
                      </span>
                    </NavLink>
                  </div>
                )}
              </div>

              <NavLink
                to="/dashboard/eventsOffice/generate-qr"
                className={({ isActive }) =>
                  isActive
                    ? "px-4 py-2 rounded-lg bg-white/15 text-white font-semibold transition-all flex items-center gap-2"
                    : "px-4 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/8 transition-all flex items-center gap-2"
                }
              >
                <QrCode className="h-4 w-4" />
                QR
              </NavLink>
              <NavLink
                to="/dashboard/eventsOffice/loyalty-vendors"
                className={({ isActive }) =>
                  isActive
                    ? "px-4 py-2 rounded-lg bg-white/15 text-white font-semibold transition-all flex items-center gap-2"
                    : "px-4 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/8 transition-all flex items-center gap-2"
                }
              >
                <Star className="h-4 w-4" />
                Loyals
              </NavLink>
              <NavLink
                to="/dashboard/eventsOffice/vendor-poll"
                className={({ isActive }) =>
                  isActive
                    ? "px-4 py-2 rounded-lg bg-white/15 text-white font-semibold transition-all flex items-center gap-2"
                    : "px-4 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/8 transition-all flex items-center gap-2"
                }
              >
                <BarChart className="h-4 w-4" />
                Poll
              </NavLink>
              <NavLink
                to="/dashboard/eventsOffice/gym-schedule"
                className={({ isActive }) =>
                  isActive
                    ? "px-4 py-2 rounded-lg bg-white/15 text-white font-semibold transition-all flex items-center gap-2"
                    : "px-4 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/8 transition-all flex items-center gap-2"
                }
              >
                <Clock className="h-4 w-4" />
                Gym
              </NavLink>
            </div>

            {/* Right - Logout */}
            <button
              onClick={handleLogout}
              aria-label="Logout"
              title="Logout"
              className="px-3 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 text-sm"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </nav>
      </header>
    </div>
  );
};

export default NavbarEventsOffice;
