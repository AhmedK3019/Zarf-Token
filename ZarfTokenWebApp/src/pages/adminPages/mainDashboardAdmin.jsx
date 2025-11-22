import { Routes, Route } from "react-router-dom";
import NavbarAdmin from "./navbarAdmin";
import AllEvents from "../AllEvents";
import SignUpRequests from "./SignUpRequests";
import VendorRequests from "./VendorRequests";
import LoyaltyPartnersDirectory from "./LoyaltyPartnersDirectory";
import AllUsers from "./AllUsers";
import EventsSalesReport from "./EventsSalesReport";
import EventAttendeesReport from "./EventAttendeesReport";
import NotFound from "../NotFoundPage";

const mainDashboardAdmin = () => {
  return (
    <div className="min-h-screen bg-muted">
      <NavbarAdmin />
      <main>
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
  );
};

export default mainDashboardAdmin;
