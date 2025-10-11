import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuthUser } from "../hooks/auth";

export default function Notifications() {
  const { user } = useAuthUser();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get(`/allUsers/${user._id}`);
        setNotifications(res.data.notifications || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load notifications.");
      } finally {
        setLoading(false);
      }
    };
    if (user?._id) fetchNotifications();
  }, [user]);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/allUsers/${user._id}/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const handleClearAll = async () => {
    try {
      await api.delete(`/user/${user._id}/notifications`);
      setNotifications([]);
    } catch (err) {
      console.error("Error clearing notifications:", err);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-[60vh] text-primary">
        Loading notifications...
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white rounded-3xl shadow-[0_10px_25px_rgba(115,108,237,0.15)] p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-primary">Notifications</h2>
        {notifications.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-sm text-accent hover:text-red-600 transition"
          >
            Clear all
          </button>
        )}
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-100 text-red-800 rounded">{error}</div>
      )}

      {notifications.length === 0 ? (
        <div className="text-primary/60 text-center py-12">
          No notifications yet 🎉
        </div>
      ) : (
        <ul className="space-y-3">
          {notifications.map((note) => (
            <li
              key={note.id}
              className={`p-4 rounded-2xl border ${
                note.isRead
                  ? "bg-gray-50 border-gray-200"
                  : "bg-secondary/10 border-secondary/40"
              } hover:shadow-[0_4px_14px_rgba(115,108,237,0.15)] transition`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-primary/80">{note.message}</p>
                </div>

                {!note.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(note.id)}
                    className="ml-3 text-xs text-white bg-primary/80 px-3 py-1 rounded-full hover:bg-primary transition"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
