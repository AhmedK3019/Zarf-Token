import { Routes, Route } from "react-router-dom";
import NavbarAdmin from "./navbarAdmin";
import AllEvents from "../AllEvents";
import SignUpRequests from "./SignUpRequests";
import VendorRequests from "./VendorRequests";
import LoyaltyVendors from "./LoyaltyVendors";
import AllUsers from "./AllUsers";
import AddAdmin from "./AddAdminOrEventsOffice";
import AllAdmins from "./AllAdminsAndOfficers";
import EventsSalesReport from "./EventsSalesReport";
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
          <Route path="/signup-requests" element={<SignUpRequests />} />
          <Route path="/vendor-requests" element={<VendorRequests />} />
          <Route path="/loyalty-vendors" element={<LoyaltyVendors />} />
          <Route path="/all-users" element={<AllUsers />} />
          <Route path="/add-admin" element={<AddAdmin />} />
          <Route path="/all-admins" element={<AllAdmins />} />
          <Route path="*" element={<NotFound />}></Route>
        </Routes>
      </main>
    </div>
  );
};

export default mainDashboardAdmin;
