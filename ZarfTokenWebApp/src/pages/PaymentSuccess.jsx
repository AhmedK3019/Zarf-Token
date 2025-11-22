import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuthUser } from "../hooks/auth";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const type = searchParams.get("type");
  const id = searchParams.get("id");
  const sessionId = searchParams.get("session_id");
  const { user } = useAuthUser();

  useEffect(() => {
    let cancelled = false;
    const confirm = async () => {
      try {
        if (!sessionId) return; // nothing to confirm
        await api.post("/stripe/confirm", { sessionId });
      } catch (e) {
        // non-fatal; webhook may still complete
      } finally {
        if (!cancelled) {
          const dashboardPath =
            user.role.toLowerCase() === "vendor"
              ? `/dashboard/${user.role.toLowerCase()}`
              : `/dashboard/user`;
          setTimeout(() => navigate(dashboardPath), 1200);
        }
      }
    };
    confirm();
    return () => {
      cancelled = true;
    };
  }, [navigate, user]);

  const resolveDashboardPath = () => {
    if (user.role.toLowerCase() === "vendor") {
      return `/dashboard/${user.role.toLowerCase()}`;
    }
    return `/dashboard/user`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted text-center p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-emerald-600 mb-2">
          Payment Successful
        </h1>
        <p className="text-gray-700 mb-4">
          Thank you! Your payment was completed.
        </p>
        <div className="text-sm text-gray-500 mb-6">
          <p>Event type: {type || "N/A"}</p>
          <p>Event id: {id || "N/A"}</p>
          <p>Session: {sessionId?.slice(0, 12) || "N/A"}...</p>
        </div>
        <button
          onClick={() => navigate(resolveDashboardPath())}
          className="px-4 py-2 rounded-lg bg-[#4C3BCF] text-white hover:bg-[#3730A3]"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
