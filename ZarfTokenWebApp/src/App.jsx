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
import ForgetPassword from "./pages/forgetPassword";
import ResetPassword from "./pages/resetPassword";
import InvalidLink from "./pages/linkIsInvalid";
import NotFound from "./pages/notFound";
import "./App.css";
import { useAuthUser } from "./hooks/auth";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancelled from "./pages/PaymentCancelled";
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
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-cancelled" element={<PaymentCancelled />} />
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
        <Route path="/404" element={<NotFound />} />
        <Route path="/invalid-link" element={<InvalidLink />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
