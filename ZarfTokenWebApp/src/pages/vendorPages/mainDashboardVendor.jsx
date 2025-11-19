import { Routes, Route, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const isBazaarOpportunitiesPage = location.pathname === "/dashboard/vendor" || 
                                    location.pathname === "/dashboard/vendor/" ||
                                    location.pathname === "/dashboard/vendor/upcoming-bazaars";

  return (
    <div>
      <NavbarVendor vendor={vendor} />
      {/* Dashboard Container with Bazaar Opportunities Section */}
      {isBazaarOpportunitiesPage && (
        <div className="w-full bg-[#001233] text-white px-6 py-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl font-bold sm:text-5xl mb-4">
              Bazaar Opportunities
            </h1>
            <p className="text-lg max-w-2xl mx-auto opacity-90">
              Explore upcoming bazaars and find the perfect opportunity for your business.
            </p>
          </div>
        </div>
      )}
      <main className={`w-full px-4 ${isBazaarOpportunitiesPage ? 'mt-8' : 'mt-6'}`}>
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
