import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuthUser } from "../../hooks/auth";
import {
  Calendar,
  Users,
  Bell,
  PackageCheck,
  Star,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const NavbarAdmin = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 py-3 rounded-lg transition-all duration-300 text-sm font-medium whitespace-nowrap ${
      isActive
        ? "bg-white/10 text-white shadow-sm"
        : "text-blue-100 hover:bg-white/5 hover:text-white"
    } ${isCollapsed ? "px-4" : "px-4"}`;

  return (
    <nav
      className={`bg-[#001845] flex flex-col h-full shrink-0 border-r border-blue-900 transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* --- HEADER AREA --- */}
      <div
        className={`flex items-center h-20 border-b border-white/10 shrink-0 transition-all duration-300 ${
          isCollapsed ? "px-2" : "px-4"
        }`}
      >
        <div className="flex items-center overflow-hidden">
          <img
            src="/NavbarLogo.png"
            alt="Logo"
            className={`object-contain transition-all duration-300 ${
              isCollapsed ? "h-8 w-8" : "h-8 w-auto"
            }`}
          />
          <div
            className={`flex items-center overflow-hidden transition-all duration-300 ${
              isCollapsed ? "w-0 opacity-0" : "w-24 opacity-100 ml-3"
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
            Events
          </div>
        )}

        <NavLink
          to="/dashboard/admin/all-events"
          className={linkClass}
          title="All Events"
        >
          <Calendar size={20} className="shrink-0" />
          {!isCollapsed && <span>All Events</span>}
        </NavLink>

        <NavLink
          to="/dashboard/admin/events-sales-report"
          className={linkClass}
          title="Sales Report"
        >
          <LayoutDashboard size={20} className="shrink-0" />
          {!isCollapsed && <span>Sales Report</span>}
        </NavLink>

        <NavLink
          to="/dashboard/admin/event-attendees-report"
          className={linkClass}
          title="Attendees Report"
        >
          <Users size={20} className="shrink-0" />
          {!isCollapsed && <span>Attendees Report</span>}
        </NavLink>

        {!isCollapsed && (
          <div className="px-3 mb-2 mt-6 text-xs font-semibold text-blue-400 uppercase tracking-wider animate-in fade-in">
            Requests
          </div>
        )}

        <NavLink
          to="/dashboard/admin/signup-requests"
          className={linkClass}
          title="Sign-Up Requests"
        >
          <Bell size={20} className="shrink-0" />
          {!isCollapsed && <span>Sign-Up Requests</span>}
        </NavLink>

        <NavLink
          to="/dashboard/admin/vendor-requests"
          className={linkClass}
          title="Vendor Requests"
        >
          <PackageCheck size={20} className="shrink-0" />
          {!isCollapsed && <span>Vendor Requests</span>}
        </NavLink>

        {!isCollapsed && (
          <div className="px-3 mb-2 mt-6 text-xs font-semibold text-blue-400 uppercase tracking-wider animate-in fade-in">
            Directory
          </div>
        )}

        <NavLink
          to="/dashboard/admin/loyals"
          className={linkClass}
          title="Loyalty Partners"
        >
          <Star size={20} className="shrink-0" />
          {!isCollapsed && <span>Loyalty Partners</span>}
        </NavLink>

        <NavLink
          to="/dashboard/admin/users"
          className={linkClass}
          title="User Management"
        >
          <Users size={20} className="shrink-0" />
          {!isCollapsed && <span>Users</span>}
        </NavLink>
      </div>
    </nav>
  );
};

export default NavbarAdmin;
