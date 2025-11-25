import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Calendar,
  PlusCircle,
  Archive,
  LayoutDashboard,
  Users,
  FileText,
  PackageCheck,
  Star,
  BarChart,
  QrCode,
  Clock,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const NavbarEventsOffice = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 py-3 rounded-lg transition-all duration-300 text-sm font-medium whitespace-nowrap ${
      isActive
        ? "bg-white/10 text-white shadow-sm"
        : "text-blue-100 hover:bg-white/5 hover:text-white"
    } ${
      isCollapsed 
        ? "px-4"  
        : "px-4"        
    }`;

  return (
    <nav 
      className={`bg-[#001845] flex flex-col h-full shrink-0 border-r border-blue-900 transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div className={`flex items-center h-20 border-b border-white/10 shrink-0 transition-all duration-300 ${
          isCollapsed ? "px-2" : "px-4"
        }`}
      >
        <div className="flex items-center overflow-hidden">
          <img
            src="/NavbarLogo.png"
            alt="Logo"
            className={`object-contain transition-all duration-300 ${isCollapsed ? "h-8 w-8" : "h-8 w-auto"}`}
          />
          <div 
            className={`flex items-center overflow-hidden transition-all duration-300 ${
              isCollapsed ? "w-0 opacity-0" : "w-32 opacity-100 ml-3"
            }`}
          >
            <span className="text-white font-bold tracking-wide whitespace-nowrap">
              Zarf Token
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto p-2 rounded-lg text-blue-200 hover:bg-white/10 hover:text-white transition-colors focus:outline-none"
          title={isCollapsed ? "Expand" : "Collapse"}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1 overflow-x-hidden custom-scrollbar">
        
        {!isCollapsed && (
          <div className="px-3 mb-2 mt-2 text-xs font-semibold text-blue-400 uppercase tracking-wider animate-in fade-in">
            Events Management
          </div>
        )}
        
        <NavLink to="/dashboard/eventsOffice/all-events" className={linkClass} title="All Events">
          <Calendar size={20} className="shrink-0" />
          {!isCollapsed && <span>All Events</span>}
        </NavLink>

        <NavLink to="/dashboard/eventsOffice/create-event" className={linkClass} title="Create Event">
          <PlusCircle size={20} className="shrink-0" />
          {!isCollapsed && <span>Create Event</span>}
        </NavLink>

        <NavLink to="/dashboard/eventsOffice/archived-events" className={linkClass} title="Archived Events">
          <Archive size={20} className="shrink-0" />
          {!isCollapsed && <span>Archived Events</span>}
        </NavLink>
        
        <NavLink to="/dashboard/eventsOffice/events-sales-report" className={linkClass} title="Sales Report">
          <LayoutDashboard size={20} className="shrink-0" />
          {!isCollapsed && <span>Sales Report</span>}
        </NavLink>
        
        <NavLink to="/dashboard/eventsOffice/event-attendees-report" className={linkClass} title="Attendees Report">
          <Users size={20} className="shrink-0" />
          {!isCollapsed && <span>Attendees Report</span>}
        </NavLink>

        {!isCollapsed && (
          <div className="px-3 mb-2 mt-6 text-xs font-semibold text-blue-400 uppercase tracking-wider animate-in fade-in">
            Requests
          </div>
        )}

        <NavLink to="/dashboard/eventsOffice/workshop-requests" className={linkClass} title="Workshop Requests">
          <FileText size={20} className="shrink-0" />
          {!isCollapsed && <span>Workshop Requests</span>}
        </NavLink>
        
        <NavLink to="/dashboard/eventsOffice/vendor-requests" className={linkClass} title="Vendor Requests">
          <PackageCheck size={20} className="shrink-0" />
          {!isCollapsed && <span>Vendor Requests</span>}
        </NavLink>

        {!isCollapsed && (
          <div className="px-3 mb-2 mt-6 text-xs font-semibold text-blue-400 uppercase tracking-wider animate-in fade-in">
            Tools & Directory
          </div>
        )}

        <NavLink to="/dashboard/eventsOffice/loyalty-program" className={linkClass} title="Loyalty Partners">
          <Star size={20} className="shrink-0" />
          {!isCollapsed && <span>Loyalty Partners</span>}
        </NavLink>

        <NavLink to="/dashboard/eventsOffice/vendor-poll" className={linkClass} title="Vendors Poll">
          <BarChart size={20} className="shrink-0" />
          {!isCollapsed && <span>Vendors Poll</span>}
        </NavLink>

        <NavLink to="/dashboard/eventsOffice/generate-qr" className={linkClass} title="Generate QR">
          <QrCode size={20} className="shrink-0" />
          {!isCollapsed && <span>Generate QR</span>}
        </NavLink>

        <NavLink to="/dashboard/eventsOffice/gym-schedule" className={linkClass} title="Gym Schedule">
          <Clock size={20} className="shrink-0" />
          {!isCollapsed && <span>Gym Schedule</span>}
        </NavLink>

      </div>
    </nav>
  );
};

export default NavbarEventsOffice;