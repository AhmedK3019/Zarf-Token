import { Routes, Route } from "react-router-dom";
import NavbarEventsOffice from "./navbarEventsOffice";
import Notifications from "../Notifications";
import AllEvents from "../AllEvents";
import CreateEvent from "./CreateEvent";
import WorkshopRequests from "./WorkshopRequests";
import ArchivedEvents from "./ArchivedEvents";
import GenerateQR from "./GenerateQR";
import LoyaltyVendors from "../adminPages/LoyaltyVendors";
import VendorRequests from "../adminPages/VendorRequests";
import VendorPoll from "./VendorPoll";
import GymSchedule from "../userPages/GymSchedule";

const mainDashboardEventsOffice = () => {
  return (
    <div>
      <NavbarEventsOffice />
      <main className="max-w-5xl mx-auto mt-6 px-4">
        <Routes>
          <Route index element={<Notifications />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="all-events" element={<AllEvents />} />
          <Route path="create-event" element={<CreateEvent />} />
          <Route path="workshop-requests" element={<WorkshopRequests />} />
          <Route path="archived-events" element={<ArchivedEvents />} />
          <Route path="generate-qr" element={<GenerateQR />} />
          <Route path="loyalty-vendors" element={<LoyaltyVendors />} />
          <Route path="vendor-requests" element={<VendorRequests />} />
          <Route path="vendor-poll" element={<VendorPoll />} />
          <Route path="gym-schedule" element={<GymSchedule />} />
        </Routes>
      </main>
    </div>
  );
};

export default mainDashboardEventsOffice;
