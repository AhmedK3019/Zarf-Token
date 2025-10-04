import { Routes, Route } from "react-router-dom";
import NavbarAdmin from "./navbarAdmin";
import Notifications from "../Notifications";
import AllEvents from "../AllEvents";
import SignUpRequests from "./SignUpRequests";
import VendorRequests from "./VendorRequests";
import LoyaltyVendors from "./LoyaltyVendors";
import AllUsers from "./AllUsers";
import AddAdmin from "./AddAdminOrEventsOffice";
import EventsOffice from "./EventsOffice";

const mainDashboardAdmin = () => {
  return (
    <div>
      <NavbarAdmin />
      <main className="max-w-5xl mx-auto mt-6 px-4">
        <Routes>
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/all-events" element={<AllEvents />} />
          <Route path="/signup-requests" element={<SignUpRequests />} />
          <Route path="/vendor-requests" element={<VendorRequests />} />
          <Route path="/loyalty-vendors" element={<LoyaltyVendors />} />
          <Route path="/all-users" element={<AllUsers />} />
          <Route path="/add-admin" element={<AddAdmin />} />
          <Route path="/events-office" element={<EventsOffice />} />
        </Routes>
      </main>
    </div>
  );
};

export default mainDashboardAdmin;
