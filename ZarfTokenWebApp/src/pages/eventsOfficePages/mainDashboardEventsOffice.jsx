import { Routes, Route } from "react-router-dom";
import NavbarEventsOffice from "./navbarEventsOffice";
import NotificationsDrawer from "../../components/NotificationsDrawer";
import { useAuthUser } from "../../hooks/auth";
import { LogOut } from "lucide-react";

import AllEvents from "../AllEvents";
import CreateEvent from "./CreateEvent";
import WorkshopRequests from "./WorkshopRequests";
import ArchivedEvents from "./ArchivedEvents";
import GenerateQR from "./GenerateQR";
import LoyaltyPartnersDirectory from "./LoyaltyPartnersDirectory";
import VendorRequests from "../adminPages/VendorRequests";
import VendorPoll from "./VendorPoll";
import GymSchedule from "../userPages/GymSchedule";
import NotFound from "../NotFoundPage";
import EditEvent from "./EditEvents";
import EventsSalesReport from "../adminPages/EventsSalesReport";
import EventAttendeesReport from "../adminPages/EventAttendeesReport";

const MainDashboardEventsOffice = () => {
  const { logout } = useAuthUser();

  return (
    <div className="flex h-screen w-full bg-muted overflow-hidden">
      <NavbarEventsOffice />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0 z-20 relative">
          <h2 className="text-lg font-semibold text-[#001845]">Events Office Dashboard</h2>
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
            <Route path="all-events" element={<AllEvents />} />
            <Route path="events-sales-report" element={<EventsSalesReport />} />
            <Route path="event-attendees-report" element={<EventAttendeesReport />} />
            <Route path="create-event" element={<CreateEvent />} />
            <Route path="workshop-requests" element={<WorkshopRequests />} />
            <Route path="archived-events" element={<ArchivedEvents />} />
            <Route path="generate-qr" element={<GenerateQR />} />
            <Route path="loyalty-program" element={<LoyaltyPartnersDirectory />} />
            <Route path="vendor-requests" element={<VendorRequests />} />
            <Route path="vendor-poll" element={<VendorPoll />} />
            <Route path="gym-schedule" element={<GymSchedule />} />
            <Route path="edit-event/:type/:id" element={<EditEvent />} />
            <Route path="*" element={<NotFound />}></Route>
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default MainDashboardEventsOffice;