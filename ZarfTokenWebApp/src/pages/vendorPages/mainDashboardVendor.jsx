import { Routes, Route } from "react-router-dom";
import NavbarVendor from "./navbarVendor";
import UpcomingBazars from "./UpcomingBazars";
import ApplyBooth from "./ApplyBooth";
import MyRequests from "./MyRequests";
import AcceptedBooths from "./AcceptedBooths";
import ApplyLoyalty from "./ApplyLoyalty";
import CancelLoyalty from "./CancelLoyalty";

const mainDashboardVendor = ({ vendor }) => {
  return (
    <div>
      <NavbarVendor vendor={vendor} />
      <main className="max-w-5xl mx-auto mt-6 px-4">
        <Routes>
          <Route path="/upcoming-bazars" element={<UpcomingBazars />} />
          <Route path="/apply-booth" element={<ApplyBooth />} />
          <Route path="/my-requests" element={<MyRequests />} />
          <Route path="/accepted-booths" element={<AcceptedBooths />} />
          {vendor?.loyal ? (
            <Route path="/cancel-loyalty" element={<CancelLoyalty />} />
          ) : (
            <Route path="/apply-loyalty" element={<ApplyLoyalty />} />
          )}
        </Routes>
      </main>
    </div>
  );
};

export default mainDashboardVendor;
