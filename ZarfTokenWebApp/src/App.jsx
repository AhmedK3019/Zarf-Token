import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landingPage";
import MainDashboardStudent from "./pages/mainDashboardStudent";
import MainDashboardFaculty from "./pages/mainDashboardFaculty";
import MainDashboardStaff from "./pages/mainDashboardStaff";
import MainDashboardVendor from "./pages/mainDashboardVendor";
import MainDashboardAdmin from "./pages/mainDashboardAdmin";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard/student" element={<MainDashboardStudent />} />
        <Route path="/dashboard/faculty" element={<MainDashboardFaculty />} />
        <Route path="/dashboard/staff" element={<MainDashboardStaff />} />
        <Route path="/dashboard/vendor" element={<MainDashboardVendor />} />
        <Route path="/dashboard/admin" element={<MainDashboardAdmin />} />
      </Routes>
    </Router>
  );
}

export default App;

