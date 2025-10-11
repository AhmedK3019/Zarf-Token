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
import CreateTrip from "./pages/tripPages/createTrip";
import "./App.css";
import { useAuthUser } from "./hooks/auth";

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
            <ProtectedRoute>
              <MainDashboardUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/eventsOffice/*"
          element={
            <ProtectedRoute allowedRoles={["EventsOffice", "Admin"]}>
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

        <Route path="/createTrip" element={<CreateTrip />} />
      </Routes>
    </Router>
  );
}

export default App;
