import { Link } from "react-router-dom";
import { useAuthUser } from "../hooks/auth";
import logo from "../assets/logo.png";

export default function NotFound() {
  const { user } = useAuthUser();

  // Determine dashboard route based on role
  const getDashboardPath = () => {
    if (!user) return "/";
    switch (user.role?.toLowerCase()) {
      case "admin":
        return "/dashboard/admin/all-events";
      case "vendor":
        return "/dashboard/vendor/upcoming-bazaars";
      case "event office":
      case "eventsoffice":
        return "/dashboard/eventsOffice/all-events";
      case "student":
      case "staff":
      case "ta":
      case "professor":
        return "/dashboard/user/all-events";
      default:
        return "/";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted text-primary">
      <div className="bg-white rounded-2xl shadow-lg p-10 text-center w-[90%] max-w-lg">
        <div className="flex justify-center mb-4">
          <img
            src={logo}
            alt="Zarf Token Logo"
            className="h-14 w-14 rounded-full bg-primary/10 p-2"
          />
        </div>

        <h1 className="text-5xl font-bold text-primary mb-2">404</h1>
        <h2 className="text-xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-gray-500 mb-6">
          The page you’re looking for doesn’t exist or was moved.
        </p>

        <Link
          to={getDashboardPath()}
          className="inline-block bg-[#001845] text-white px-6 py-2 rounded-full shadow-md transition-all hover:bg-primary/90 hover:scale-105"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
