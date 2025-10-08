import { useEffect } from "react";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landingPage";
import EventsPage from "./pages/AllEvents";
import MainDashboardEventsOffice from "./pages/eventsOfficePages/mainDashboardEventsOffice";
import MainDashboardUser from "./pages/userPages/mainDashboardUser";
import MainDashboardVendor from "./pages/vendorPages/mainDashboardVendor";
import MainDashboardAdmin from "./pages/adminPages/mainDashboardAdmin";
import SignUp from "./pages/signUp";
import "./App.css";

function App() {
  useEffect(() => {
    document.title = "ZarfToken";
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:category" element={<EventsPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard/user" element={<MainDashboardUser />} />
        <Route
          path="/dashboard/eventsOffice/*"
          element={<MainDashboardEventsOffice />}
        />
        <Route path="/dashboard/vendor" element={<MainDashboardVendor />} />
        <Route path="/dashboard/admin" element={<MainDashboardAdmin />} />
      </Routes>
    </Router>
  );
}

export default App;

