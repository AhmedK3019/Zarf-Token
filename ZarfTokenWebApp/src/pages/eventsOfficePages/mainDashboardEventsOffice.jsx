import { Routes, Route } from "react-router-dom";
import NavbarEventsOffice from "./navbarEventsOffice";

import AllEvents from "../AllEvents";
import CreateEvent from "./CreateEvent";
import WorkshopRequests from "./WorkshopRequests";
import ArchivedEvents from "./ArchivedEvents";
import GenerateQR from "./GenerateQR";
import LoyaltyVendors from "../adminPages/LoyaltyVendors";
import LoyaltyPartnersDirectory from "./LoyaltyPartnersDirectory";
import VendorRequests from "../adminPages/VendorRequests";
import VendorPoll from "./VendorPoll";
import GymSchedule from "../userPages/GymSchedule";
import NotFound from "../NotFoundPage";
import EditEvent from "./EditEvents";
import EventsSalesReport from "../adminPages/EventsSalesReport";
import EventAttendeesReport from "../adminPages/EventAttendeesReport";
const mainDashboardEventsOffice = () => {
  return (
    <div>
      <NavbarEventsOffice />
      <main className="w-full mt-6 px-4">
        <Routes>
          <Route index element={<AllEvents />} />
          <Route path="all-events" element={<AllEvents />} />
          <Route path="events-sales-report" element={<EventsSalesReport />} />
          <Route path="event-attendees-report" element={<EventAttendeesReport />} />
          <Route path="create-event" element={<CreateEvent />} />
          <Route path="workshop-requests" element={<WorkshopRequests />} />
          <Route path="archived-events" element={<ArchivedEvents />} />
          <Route path="generate-qr" element={<GenerateQR />} />
          <Route path="loyalty-vendors" element={<LoyaltyVendors />} />
          <Route path="loyalty-program" element={<LoyaltyPartnersDirectory />} />
          <Route path="vendor-requests" element={<VendorRequests />} />
          <Route path="vendor-poll" element={<VendorPoll />} />
          <Route path="gym-schedule" element={<GymSchedule />} />
          <Route path="edit-event/:type/:id" element={<EditEvent />} />
          <Route path="*" element={<NotFound />}></Route>
        </Routes>
      </main>
    </div>
  );
};

export default mainDashboardEventsOffice;
