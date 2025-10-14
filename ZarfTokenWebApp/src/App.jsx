import { useEffect } from "react";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landingPage";
import EventsPage from "./pages/AllEvents";
import MainDashboardEventsOffice from "./pages/eventsOfficePages/mainDashboardEventsOffice";
import MainDashboardUser from "./pages/userPages/mainDashboardUser";
import MainDashboardVendor from "./pages/vendorPages/mainDashboardVendor";
import MainDashboardAdmin from "./pages/adminPages/mainDashboardAdmin";
import ProtectedRoute from "./components/ProtectedRoute";
import SignUp from "./pages/signUp";
import "./App.css";
import { useAuthUser } from "./hooks/auth";
// import EditBazaar from "./pages/bazaarPages/EditBazaar";
// import EditTrip from "./pages/tripPages/EditTrip";
// import EditConference from "./pages/conferencePages/EditConference";
function App() {
  useEffect(() => {
    document.title = "ZarfToken";
  }, []);
  const { user, logout } = useAuthUser();
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:category" element={<EventsPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/dashboard/user/*"
          element={
            <ProtectedRoute
              allowedRoles={["Student", "Professor", "Staff", "TA"]}
            >
              <MainDashboardUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/eventsOffice/*"
          element={
            <ProtectedRoute allowedRoles={["Event office", "Admin"]}>
              <MainDashboardEventsOffice />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/vendor/*"
          element={
            <ProtectedRoute allowedRoles={["Vendor"]}>
              <MainDashboardVendor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/*"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <MainDashboardAdmin />
            </ProtectedRoute>
          }
        />
        {/* <Route path="/editConference/:id" element={<EditConference />} />
        <Route path="/editBazaar/:id" element={<EditBazaar />} />
        <Route path="/editTrip/:id" element={<EditTrip />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
