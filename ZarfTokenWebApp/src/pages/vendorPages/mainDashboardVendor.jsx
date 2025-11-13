import { Routes, Route } from "react-router-dom";
import NavbarVendor from "./navbarVendor";
import UpcomingBazaars from "./UpcomingBazaars";
import ApplyBooth from "./ApplyBooth";
import MyRequests from "./MyRequests";
import AcceptedBooths from "./AcceptedBooths";
import ApplyLoyalty from "./ApplyLoyalty";
import LoyaltyProgram from "./LoyaltyProgram";
import CancelLoyalty from "./CancelLoyalty";
import NotFound from "../NotFoundPage";

const MainDashboardVendor = ({ vendor }) => {
  return (
    <div>
      <NavbarVendor vendor={vendor} />
      <main className="w-full mt-6 px-4">
        <Routes>
          <Route index element={<UpcomingBazaars />} />
          <Route path="/upcoming-bazaars" element={<UpcomingBazaars />} />
          <Route path="/apply-booth" element={<ApplyBooth />} />
          <Route path="/my-requests" element={<MyRequests />} />
          <Route path="/accepted-booths" element={<AcceptedBooths />} />
          <Route
            path="/loyalty-program"
            element={<LoyaltyProgram vendor={vendor} />}
          />
          {vendor?.loyal ? (
            <Route path="/cancel-loyalty" element={<CancelLoyalty />} />
          ) : (
            <Route path="/apply-loyalty" element={<ApplyLoyalty />} />
          )}
          <Route path="*" element={<NotFound />}></Route>
        </Routes>
      </main>
    </div>
  );
};

export default MainDashboardVendor;
