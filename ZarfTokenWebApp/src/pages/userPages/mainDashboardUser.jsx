import { Routes, Route, useLocation } from "react-router-dom";
import NavbarUser from "./navbarUser";
import { useAuthUser } from "../../hooks/auth";

import AllEvents from "../AllEvents";
import FavouriteEvents from "./FavouriteEvents";
import RegisteredEvents from "./RegisteredEvents";
import LoyaltyProgram from "./LoyaltyProgram";
import VendorsPoll from "./VendorsPoll";
import GymSchedule from "./GymSchedule";
import Courts from "../studentPages/Courts";
import CreateWorkshop from "../professorPages/CreateWorkshop";
import MyWorkshops from "../professorPages/MyWorkshops";
import NotFound from "../NotFoundPage";

const mainDashboardUser = () => {
  const { user } = useAuthUser();
  const location = useLocation();
  const isFavouriteEventsPage = location.pathname === "/dashboard/user/favourite-events";
  const isRegisteredEventsPage = location.pathname === "/dashboard/user/registered-events";

  return (
    <div>
      <NavbarUser />
      {/* Dashboard Container with My Favorites Section */}
      {isFavouriteEventsPage && (
        <div className="w-full bg-[#001233] text-white px-6 py-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl font-bold sm:text-5xl mb-4">
              My Favorites
            </h1>
          </div>
        </div>
      )}
      {/* Dashboard Container with My Registered Events Section */}
      {isRegisteredEventsPage && (
        <div className="w-full bg-[#001233] text-white px-6 py-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl font-bold sm:text-5xl mb-4">
              My Registered Events
            </h1>
            <p className="text-sm max-w-2xl mx-auto opacity-90">
              Here are the workshops and trips you signed up for.
            </p>
          </div>
        </div>
      )}
      <main className={`w-full px-4 ${(isFavouriteEventsPage || isRegisteredEventsPage) ? 'mt-8' : 'mt-6'}`}>
        <Routes>
          <Route index element={<AllEvents />} />
          <Route path="/all-events" element={<AllEvents />} />
          <Route path="/favourite-events" element={<FavouriteEvents />} />
          <Route path="/registered-events" element={<RegisteredEvents />} />
          <Route path="/loyalty-program" element={<LoyaltyProgram />} />
          <Route path="/vendors-poll" element={<VendorsPoll />} />
          <Route path="/gym-schedule" element={<GymSchedule />} />

          {user && user.role === "Student" && (
            <Route path="/courts" element={<Courts />} />
          )}

          {user && user.role === "Professor" && (
            <>
              <Route path="/create-workshop" element={<CreateWorkshop />} />
              <Route path="/my-workshops" element={<MyWorkshops />} />
            </>
          )}
          <Route path="*" element={<NotFound />}></Route>
        </Routes>
      </main>
    </div>
  );
};

export default mainDashboardUser;
