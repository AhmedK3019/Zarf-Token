import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuthUser } from "../../hooks/auth";
import { Calendar, Clock, ArrowLeft, Trash2 } from "lucide-react";

const MyReservations = () => {
  const { user } = useAuthUser();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingSlot, setCancellingSlot] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isUpcoming = (dateTime) => {
    return new Date(dateTime) > new Date();
  };

  const isPast = (dateTime) => {
    return new Date(dateTime) <= new Date();
  };

  const fetchReservations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch user's reservations
      const response = await api.get(`/courts/my-reservations/${user._id}`);

      setReservations(response.data || []);
    } catch (err) {
      console.error("Failed to fetch reservations:", err);
      setError("Failed to load your reservations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (courtId, slotId) => {
    if (!user || cancellingSlot) return;

    setCancellingSlot(slotId);

    try {
      await api.delete(`/courts/${courtId}/cancel-reservation`, {
        data: {
          studentId: user._id,
          slotId: slotId,
        },
      });

      // Remove the cancelled reservation from the list
      setReservations((prev) =>
        prev.filter((reservation) => reservation.slotId !== slotId)
      );

      // Show success toast
      setToastMessage("Reservation cancelled successfully!");
      setShowSuccessToast(true);

      // Auto-hide success toast after 3 seconds
      setTimeout(() => {
        setShowSuccessToast(false);
      }, 3000);
    } catch (err) {
      console.error("Failed to cancel reservation:", err);
      setToastMessage("Failed to cancel reservation. Please try again.");
      setShowSuccessToast(true);

      // Auto-hide error toast after 4 seconds
      setTimeout(() => {
        setShowSuccessToast(false);
      }, 4000);
    } finally {
      setCancellingSlot(null);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen w-full overflow-hidden bg-muted text-[#1F1B3B] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#736CED] mx-auto mb-4"></div>
          <p className="text-lg text-[#312A68]">Loading your reservations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full overflow-hidden bg-muted text-[#1F1B3B] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
            {error}
          </p>
          <button
            onClick={fetchReservations}
            className="bg-[#736CED] text-white px-6 py-2 rounded-lg hover:bg-[#5A4BBA] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const upcomingReservations = reservations.filter((res) =>
    isUpcoming(res.dateTime)
  );
  const pastReservations = reservations.filter((res) => isPast(res.dateTime));

  return (
    <div className="min-h-screen w-full overflow-hidden bg-muted text-[#1F1B3B]">
      <div className="relative flex min-h-screen w-full flex-col items-center">
        <main className="relative z-10 flex w-full flex-1 flex-col items-center px-6 py-8">
          <div className="w-full max-w-6xl">
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={() => navigate("/dashboard/user/courts")}
                className="flex items-center gap-2 text-[#736CED] hover:text-[#5A4BBA] mb-4 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Courts
              </button>

              <div className="text-center">
                <h1 className="text-3xl font-bold text-[#736CED] sm:text-4xl mb-2">
                  My Reservations
                </h1>
                <p className="text-[#312A68] opacity-80">
                  View and manage your court reservations
                </p>
              </div>
            </div>

            {reservations.length === 0 ? (
              <div className="text-center py-16 bg-white/50 rounded-3xl">
                <Calendar className="w-16 h-16 text-[#736CED] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#312A68] mb-2">
                  No Reservations Found
                </h3>
                <p className="text-[#312A68]/70 mb-6">
                  You haven't made any court reservations yet.
                </p>
                <button
                  onClick={() => navigate("/dashboard/user/courts")}
                  className="bg-[#736CED] text-white px-6 py-3 rounded-lg hover:bg-[#5A4BBA] transition-colors"
                >
                  Book a Court
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Upcoming Reservations */}
                {upcomingReservations.length > 0 && (
                  <section>
                    <h2 className="text-2xl font-bold text-[#312A68] mb-6 flex items-center gap-3">
                      <Calendar className="w-6 h-6 text-[#736CED]" />
                      Upcoming Reservations ({upcomingReservations.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {upcomingReservations.map((reservation, index) => (
                        <div
                          key={`upcoming-${index}`}
                          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-[#736CED]/20 hover:border-[#736CED]/40 transition-all duration-300 shadow-sm"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-bold text-[#312A68] capitalize">
                                {reservation.courtType} Court
                              </h3>
                              <p className="text-sm text-[#312A68]/70">
                                {reservation.courtName}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                              <Clock className="w-3 h-3" />
                              Upcoming
                            </div>
                          </div>

                          <div className="space-y-3 mb-4">
                            <div className="flex items-center gap-3 text-[#312A68]/80">
                              <Calendar className="w-4 h-4 text-[#736CED]" />
                              <span className="text-sm font-medium">
                                {formatDate(reservation.dateTime)}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[#312A68]/80">
                              <Clock className="w-4 h-4 text-[#736CED]" />
                              <span className="text-sm font-medium">
                                {formatTime(reservation.dateTime)}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() =>
                              handleCancelReservation(
                                reservation.courtId,
                                reservation.slotId
                              )
                            }
                            disabled={cancellingSlot === reservation.slotId}
                            className="w-full bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {cancellingSlot === reservation.slotId ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700"></div>
                                Cancelling...
                              </>
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4" />
                                Cancel Reservation
                              </>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Past Reservations */}
                {pastReservations.length > 0 && (
                  <section>
                    <h2 className="text-2xl font-bold text-[#312A68] mb-6 flex items-center gap-3">
                      <Calendar className="w-6 h-6 text-gray-500" />
                      Past Reservations ({pastReservations.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {pastReservations.map((reservation, index) => (
                        <div
                          key={`past-${index}`}
                          className="bg-gray-50/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 opacity-75"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-bold text-gray-600 capitalize">
                                {reservation.courtType} Court
                              </h3>
                              <p className="text-sm text-gray-500">
                                {reservation.courtName}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                              <Clock className="w-3 h-3" />
                              Completed
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center gap-3 text-gray-500">
                              <Calendar className="w-4 h-4" />
                              <span className="text-sm font-medium">
                                {formatDate(reservation.dateTime)}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-500">
                              <Clock className="w-4 h-4" />
                              <span className="text-sm font-medium">
                                {formatTime(reservation.dateTime)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div
            className={`text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] ${
              toastMessage.includes("Failed") ? "bg-red-500" : "bg-orange-500"
            }`}
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {toastMessage.includes("Failed") ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              )}
            </svg>
            <div className="flex-1">
              <h4 className="font-semibold">
                {toastMessage.includes("Failed")
                  ? "Cancellation Failed"
                  : "Cancellation Successful!"}
              </h4>
              <p className="text-sm opacity-90">{toastMessage}</p>
            </div>
            <button
              onClick={() => setShowSuccessToast(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default MyReservations;
