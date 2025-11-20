import { Routes, Route, useLocation } from "react-router-dom";
import NavbarEventsOffice from "./navbarEventsOffice";

import AllEvents from "../AllEvents";
import CreateEvent from "./CreateEvent";
import WorkshopRequests from "./WorkshopRequests";
import ArchivedEvents from "./ArchivedEvents";
import GenerateQR from "./GenerateQR";
import LoyaltyVendors from "../adminPages/LoyaltyVendors";
import LoyaltyPartnersDirectory from "./LoyaltyPartnersDirectory";
import VendorRequests from "../adminPages/VendorRequests";
import VendorPoll from "./VendorPoll";
import GymSchedule from "../userPages/GymSchedule";
import NotFound from "../NotFoundPage";
import EditEvent from "./EditEvents";
import EventsSalesReport from "../adminPages/EventsSalesReport";
import EventAttendeesReport from "../adminPages/EventAttendeesReport";
const MainDashboardEventsOffice = () => {
  const location = useLocation();
  const isCreateEventPage =
    location.pathname === "/dashboard/eventsOffice/create-event";
  const isEventsSalesReportPage =
    location.pathname === "/dashboard/eventsOffice/events-sales-report";
  const isEventAttendeesReportPage =
    location.pathname === "/dashboard/eventsOffice/event-attendees-report";
  const isWorkshopRequestsPage =
    location.pathname === "/dashboard/eventsOffice/workshop-requests";
  const isLoyaltyProgramPage =
    location.pathname === "/dashboard/eventsOffice/loyalty-program";
  const isVendorRequestsPage =
    location.pathname === "/dashboard/eventsOffice/vendor-requests";
  const isLoyaltyVendorsPage =
    location.pathname === "/dashboard/eventsOffice/loyalty-vendors";
  const isAllEventsPage =
    location.pathname === "/dashboard/eventsOffice/all-events" ||
    location.pathname === "/dashboard/eventsOffice";
  const isGenerateQrPage =
    location.pathname === "/dashboard/eventsOffice/generate-qr";
  return (
    <div>
      <NavbarEventsOffice />
      {isCreateEventPage && (
        <div className="w-full bg-[#001233] text-white px-6 py-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl font-bold sm:text-5xl mb-4">
              Create Events
            </h1>
          </div>
        </div>
      )}
      {isEventsSalesReportPage && (
        <div className="w-full bg-[#001233] text-white px-6 py-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl font-bold sm:text-5xl mb-4">
              Events Sales Report
            </h1>
          </div>
        </div>
      )}
      {isEventAttendeesReportPage && (
        <div className="w-full bg-[#001233] text-white px-6 py-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl font-bold sm:text-5xl mb-4">
              Event Attendees Report
            </h1>
          </div>
        </div>
      )}
      {isWorkshopRequestsPage && (
        <div className="w-full bg-[#001233] text-white px-6 py-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl font-bold sm:text-5xl mb-2">
              Workshops & Approvals
            </h1>
            <p className="text-sm max-w-2xl mx-auto opacity-90">
              Review, approve, or reject workshops in one place.
            </p>
            <p className="text-sm max-w-2xl mx-auto opacity-90">
              Streamlined. Fast. Organized. Effortless.
            </p>
          </div>
        </div>
      )}
      {isLoyaltyProgramPage && (
        <div className="w-full bg-[#001233] text-white px-6 py-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl font-bold sm:text-5xl mb-4">
              GUC Loyalty Program Partners
            </h1>
          </div>
        </div>
      )}
      {isVendorRequestsPage && (
        <div className="w-full bg-[#001233] text-white px-6 py-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl font-bold sm:text-5xl mb-4">
              Vendor Requests
            </h1>
          </div>
        </div>
      )}
      {isLoyaltyVendorsPage && (
        <div className="w-full bg-[#001233] text-white px-6 py-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl font-bold sm:text-5xl mb-4">
              Vendor Loyalty Applications
            </h1>
          </div>
        </div>
      )}
      {isAllEventsPage && (
        <div className="w-full bg-[#001233] text-white px-6 py-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl font-bold sm:text-5xl mb-4">
              All Events
            </h1>
          </div>
        </div>
      )}
      {isGenerateQrPage && (
        <div className="w-full bg-[#001233] text-white px-6 py-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl font-bold sm:text-5xl mb-2">
              Generate QR Code
            </h1>
            <p className="text-sm max-w-2xl mx-auto opacity-90">
              Create downloadable QR codes for vendors or reps.
            </p>
          </div>
        </div>
      )}
      <main
        className={`w-full px-4 ${
          isCreateEventPage ||
          isEventsSalesReportPage ||
          isEventAttendeesReportPage ||
          isWorkshopRequestsPage ||
          isLoyaltyProgramPage ||
          isVendorRequestsPage ||
          isLoyaltyVendorsPage ||
          isAllEventsPage ||
          isGenerateQrPage
            ? "mt-8"
            : "mt-6"
        }`}
      >
        <Routes>
          <Route index element={<AllEvents />} />
          <Route path="all-events" element={<AllEvents />} />
          <Route path="events-sales-report" element={<EventsSalesReport />} />
          <Route path="event-attendees-report" element={<EventAttendeesReport />} />
          <Route path="create-event" element={<CreateEvent />} />
          <Route path="workshop-requests" element={<WorkshopRequests />} />
          <Route path="archived-events" element={<ArchivedEvents />} />
          <Route path="generate-qr" element={<GenerateQR />} />
          <Route path="loyalty-vendors" element={<LoyaltyVendors />} />
          <Route path="loyalty-program" element={<LoyaltyPartnersDirectory />} />
          <Route path="vendor-requests" element={<VendorRequests />} />
          <Route path="vendor-poll" element={<VendorPoll />} />
          <Route path="gym-schedule" element={<GymSchedule />} />
          <Route path="edit-event/:type/:id" element={<EditEvent />} />
          <Route path="*" element={<NotFound />}></Route>
        </Routes>
      </main>
    </div>
  );
};

export default MainDashboardEventsOffice;
