import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthUser } from "../hooks/auth";

export default function PaymentCancelled() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");
  const id = searchParams.get("id");
  const { user } = useAuthUser();

  const resolveDashboardPath = () => {
    if (user.role.toLowerCase() === "vendor") {
      return `/dashboard/${user.role.toLowerCase()}`;
    }
    return `/dashboard/user`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted text-center p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-red-600 mb-2">
          Payment Cancelled
        </h1>
        <p className="text-gray-700 mb-4">
          Your payment was cancelled or failed. You can try again anytime.
        </p>
        <div className="text-sm text-gray-500 mb-6">
          <p>Event type: {type || "N/A"}</p>
          <p>Event id: {id || "N/A"}</p>
        </div>
        <button
          onClick={() => navigate(resolveDashboardPath())}
          className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
