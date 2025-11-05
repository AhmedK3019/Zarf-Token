import { Routes, Route } from "react-router-dom";
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

  return (
    <div>
      <NavbarUser />
      <main className="max-w-5xl mx-auto mt-6 px-4">
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
