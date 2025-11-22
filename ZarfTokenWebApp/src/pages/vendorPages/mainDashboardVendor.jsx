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
  const isBazaarOpportunitiesPage =
    location.pathname === "/dashboard/vendor" ||
    location.pathname === "/dashboard/vendor/" ||
    location.pathname === "/dashboard/vendor/upcoming-bazaars";
  const isApplyBoothPage =
    location.pathname === "/dashboard/vendor/apply-booth";
  const isMyRequestsPage =
    location.pathname === "/dashboard/vendor/my-requests";
  const isAcceptedBoothsPage =
    location.pathname === "/dashboard/vendor/accepted-booths";
  const isLoyaltyProgramPage =
    location.pathname === "/dashboard/vendor/loyalty-program";
  const isApplyLoyaltyPage =
    location.pathname === "/dashboard/vendor/apply-loyalty";

  return (
    <div>
      <NavbarVendor vendor={vendor} />
      {/* Dashboard Container with Bazaar Opportunities Section */}
      {isBazaarOpportunitiesPage && (
        <div className="w-full bg-[#001845] text-white px-6 py-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl font-bold sm:text-5xl mb-4">
              Bazaar Opportunities
            </h1>
            <p className="text-lg max-w-2xl mx-auto opacity-90">
              Explore upcoming bazaars and find the perfect opportunity for your
              business.
            </p>
          </div>
        </div>
      )}
      {/* Dashboard Container with Apply Booth Section */}
      {isApplyBoothPage && (
        <div className="w-full bg-[#001845] text-white px-6 py-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl font-bold sm:text-5xl mb-4">
              Request a Platform Booth
            </h1>
            <p className="text-lg max-w-2xl mx-auto opacity-90">
              Apply for a standalone booth in the main student activity area by
              selecting a location on the map.
            </p>
          </div>
        </div>
      )}
      {/* Dashboard Container with My Requests Section */}
      {isMyRequestsPage && (
        <div className="w-full bg-[#001845] text-white px-6 py-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl font-bold sm:text-5xl mb-4">
              My Participation Requests
            </h1>
            <p className="text-lg max-w-2xl mx-auto opacity-90">
              Track statuses, payment deadlines, and cancellation eligibility in
              one place.
            </p>
          </div>
        </div>
      )}
      {/* Dashboard Container with Accepted Booths Section */}
      {isAcceptedBoothsPage && (
        <div className="w-full bg-[#001845] text-white px-6 py-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl font-bold sm:text-5xl mb-4">My Booths</h1>
            <p className="text-lg max-w-2xl mx-auto opacity-90">
              Manage your accepted booths and platform storefronts.
            </p>
          </div>
        </div>
      )}
      {/* Dashboard Container with Loyalty Program Section */}
      {isLoyaltyProgramPage && (
        <div className="w-full bg-[#001845] text-white px-6 py-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl font-bold sm:text-5xl mb-4">
              Join the GUC Loyalty Program
            </h1>
            <p className="text-lg max-w-2xl mx-auto opacity-90">
              Apply now to offer exclusive discounts to the GUC community.
            </p>
          </div>
        </div>
      )}
      {isApplyLoyaltyPage && (
        <div className="w-full bg-[#001845] text-white px-6 py-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl font-bold sm:text-5xl mb-4">
              Submit a New Application
            </h1>
            <p className="text-lg max-w-3xl mx-auto opacity-90">
              One active program is allowed at a time. Cancel your current program
              before submitting a new application. Rejected vendors can resubmit
              with updated details.
            </p>
          </div>
        </div>
      )}
      <main
        className={`w-full px-4 ${
          isBazaarOpportunitiesPage ||
          isApplyBoothPage ||
          isMyRequestsPage ||
          isAcceptedBoothsPage ||
          isLoyaltyProgramPage ||
          isApplyLoyaltyPage
            ? "mt-8"
            : "mt-6"
        }`}
      >
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
