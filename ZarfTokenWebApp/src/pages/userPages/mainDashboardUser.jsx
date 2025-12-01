import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import NavbarUser from "./navbarUser";
import { useAuthUser } from "../../hooks/auth";
import { ArrowLeft } from "lucide-react";

import AllEvents from "../AllEvents";
import FavouriteEvents from "./FavouriteEvents";
import RegisteredEvents from "./RegisteredEvents";
import LoyaltyProgram from "./LoyaltyProgram";
import VendorsPoll from "./VendorsPoll";
import GymSchedule from "./GymSchedule";
import Courts from "../studentPages/Courts";
import MyReservations from "../studentPages/MyReservations";
import CreateWorkshop from "../professorPages/CreateWorkshop";
import MyWorkshops from "../professorPages/MyWorkshops";
import NotFound from "../NotFoundPage";

const mainDashboardUser = () => {
  const { user } = useAuthUser();
  const location = useLocation();
  const navigate = useNavigate();
  const isFavouriteEventsPage =
    location.pathname === "/dashboard/user/favourite-events";
  const isRegisteredEventsPage =
    location.pathname === "/dashboard/user/registered-events";
  const isGymSchedulePage =
    location.pathname === "/dashboard/user/gym-schedule";
  const isLoyaltyProgramPage =
    location.pathname === "/dashboard/user/loyalty-program";
  const isVendorsPollPage =
    location.pathname === "/dashboard/user/vendors-poll";
  const isCourtsPage = location.pathname === "/dashboard/user/courts";
  const isMyReservationsPage =
    location.pathname === "/dashboard/user/my-reservations";
  const isCampusEventsPage = location.pathname === "/dashboard/user/all-events";
  const isCreateWorkshopPage =
    location.pathname === "/dashboard/user/create-workshop";
  const isMyWorkshopsPage =
    location.pathname === "/dashboard/user/my-workshops";

  return (
    <div>
      <NavbarUser />
      {/* Dashboard Container with My Favorites Section */}
      {isFavouriteEventsPage && (
        <div className="w-full bg-[#001845] text-white px-6 py-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl font-bold sm:text-5xl mb-4">
              My Favourites
            </h1>
            <p className="text-lg max-w-2xl mx-auto opacity-90">
              Here are your favourite events.
            </p>
          </div>
        </div>
      )}
      {/* Dashboard Container with My Registered Events Section */}
      {isRegisteredEventsPage && (
        <div className="w-full bg-[#001845] text-white px-6 py-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl font-bold sm:text-5xl mb-4">
              My Registered Events
            </h1>
            <p className="text-lg max-w-2xl mx-auto opacity-90">
              Here are the workshops and trips you signed up for.
            </p>
          </div>
        </div>
      )}
      {/* Dashboard Container with Gym Schedule Section */}
      {isGymSchedulePage && (
        <div className="w-full bg-[#001845] text-white px-6 py-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl font-bold sm:text-5xl mb-4">
              Gym Schedule
            </h1>
            <p className="text-lg max-w-2xl mx-auto opacity-90">
              Check out the gym schedule and plan your workouts.
            </p>
          </div>
        </div>
      )}
      {/* Dashboard Container with Loyalty Program Section */}
      {isLoyaltyProgramPage && (
        <div className="w-full bg-[#001845] text-white px-6 py-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl font-bold sm:text-5xl mb-4">
              GUC Loyalty Program Partners
            </h1>
            <p className="text-lg max-w-2xl mx-auto opacity-90">
              Explore every active vendor in the GUC loyalty program.
            </p>
          </div>
        </div>
      )}
      {isVendorsPollPage && (
        <div className="w-full bg-[#001845] text-white px-6 py-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl font-bold sm:text-5xl mb-3">
              Vendors Poll
            </h1>
            <p className="text-lg max-w-2xl mx-auto opacity-90">
              Tell us which vendors you want to see next on campus.
            </p>
          </div>
        </div>
      )}
      {isCourtsPage && (
        <div className="w-full bg-[#001845] text-white px-6 py-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl font-bold sm:text-5xl mb-3">
              Campus Courts
            </h1>
            <p className="text-lg max-w-2xl mx-auto opacity-90">
              Discover available court times for your sports activities. Filter
              by court type to find exactly what you're looking for.
            </p>
          </div>
        </div>
      )}
      {isMyReservationsPage && (
        <div className="w-full bg-[#001845] text-white px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center mb-4">
              <button
                onClick={() => navigate("/dashboard/user/courts")}
                className="flex items-center gap-2 text-white/90 hover:text-white hover:underline focus:underline underline-offset-2 mr-8 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Courts
              </button>
              <div className="flex-grow text-center">
                <h1 className="text-4xl font-bold sm:text-5xl mb-2">
                  My Reservations
                </h1>
                <p className="text-lg max-w-2xl mx-auto opacity-90">
                  View and manage your court reservations.
                </p>
              </div>
              {/* Spacer div to help center the title when the button is on the left */}
              <div className="w-[110px] mr-8 hidden sm:block"></div> 
            </div>
          </div>
        </div>
      )}
      {isCampusEventsPage && (
        <div className="w-full bg-[#001845] text-white px-6 py-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl font-bold sm:text-5xl mb-4">
              Campus Events
            </h1>
            <p className="text-lg max-w-2xl mx-auto opacity-90">
              Explore all upcoming events happening on campus.
            </p>
          </div>
        </div>
      )}
      {isCreateWorkshopPage && (
        <div className="w-full bg-[#001845] text-white px-6 py-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl font-bold sm:text-5xl mb-4">
              Create Workshop
            </h1>
            <p className="text-lg max-w-2xl mx-auto opacity-90">
              Plan and organize a new workshop for students.
            </p>
          </div>
        </div>
      )}
      {isMyWorkshopsPage && (
        <div className="w-full bg-[#001845] text-white px-6 py-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl font-bold sm:text-5xl mb-4">
              My Workshops
            </h1>
            <p className="text-lg max-w-2xl mx-auto opacity-90">
              Manage and view the workshops you have created.
            </p>
          </div>
        </div>
      )}
      <main
        className={`w-full px-4 ${
          isFavouriteEventsPage ||
          isRegisteredEventsPage ||
          isGymSchedulePage ||
          isLoyaltyProgramPage ||
          isVendorsPollPage
            ? "mt-8"
            : "mt-6"
        }`}
      >
        <Routes>
          <Route index element={<AllEvents />} />
          <Route path="/all-events" element={<AllEvents />} />
          <Route path="/favourite-events" element={<FavouriteEvents />} />
          <Route path="/registered-events" element={<RegisteredEvents />} />
          <Route path="/loyalty-program" element={<LoyaltyProgram />} />
          <Route path="/vendors-poll" element={<VendorsPoll />} />
          <Route path="/gym-schedule" element={<GymSchedule />} />

          {user && user.role === "Student" && (
            <>
              <Route path="/courts" element={<Courts />} />
              <Route path="/my-reservations" element={<MyReservations />} />
            </>
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
