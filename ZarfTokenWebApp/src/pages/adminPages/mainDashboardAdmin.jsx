import { Routes, Route } from "react-router-dom";
import NavbarAdmin from "./navbarAdmin";
import NotificationsDrawer from "../../components/NotificationsDrawer";
import { useAuthUser } from "../../hooks/auth";
import { LogOut } from "lucide-react";
import AllEvents from "../AllEvents";
import SignUpRequests from "./SignUpRequests";
import VendorRequests from "./VendorRequests";
import LoyaltyPartnersDirectory from "./LoyaltyPartnersDirectory";
import AllUsers from "./AllUsers";
import EventsSalesReport from "./EventsSalesReport";
import EventAttendeesReport from "./EventAttendeesReport";
import NotFound from "../NotFoundPage";

const mainDashboardAdmin = () => {
  const { logout } = useAuthUser();
  return (
    <div className="flex h-screen w-full bg-muted overflow-hidden">
      <NavbarAdmin />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0 z-20 relative">
          <h2 className="text-lg font-semibold text-[#001845]">Admin Dashboard</h2>
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-[#001845] hover:bg-gray-200 transition-all cursor-pointer overflow-visible">
              <NotificationsDrawer className="text-[#001845]" />
            </div>
            <button
              onClick={() => { logout(); window.location.href = "/"; }}
              className="px-4 py-2 rounded-lg bg-gray-100 text-[#001845] hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm font-semibold"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-0">
          <Routes>
            <Route index element={<AllEvents />} />
            <Route path="/all-events" element={<AllEvents />} />
            <Route path="/events-sales-report" element={<EventsSalesReport />} />
            <Route path="/event-attendees-report" element={<EventAttendeesReport />} />
            <Route path="/signup-requests" element={<SignUpRequests />} />
            <Route path="/vendor-requests" element={<VendorRequests />} />
            <Route path="/loyalty-program" element={<LoyaltyPartnersDirectory />} />
            <Route path="/loyals" element={<LoyaltyPartnersDirectory />} />
            <Route path="/users" element={<AllUsers />} />
            <Route path="*" element={<NotFound />}></Route>
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default mainDashboardAdmin;
