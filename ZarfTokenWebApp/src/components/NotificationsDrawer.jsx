import React, { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import { useAuthUser } from "../hooks/auth";
import { Bell } from "lucide-react";

export default function NotificationsDrawer() {
  const { user } = useAuthUser();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const fetchNotifications = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/allUsers/${user._id}`);
      const data = res?.data?.notifications || res?.data || [];
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    // fetch when drawer opens
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  // Proactively fetch notifications when component mounts or user changes
  useEffect(() => {
    if (!user) return;
    // initial background fetch so the unread badge shows even before opening
    fetchNotifications();

    // refresh notifications when the window regains focus
    const onFocus = () => fetchNotifications();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [user, fetchNotifications]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handleRefresh = () => fetchNotifications();
    window.addEventListener("notifications:refresh", handleRefresh);
    return () => window.removeEventListener("notifications:refresh", handleRefresh);
  }, [fetchNotifications]);

  const markAsRead = async (id) => {
    if (!user?._id) return;
    try {
      await api.put(`/allUsers/${user._id}/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const deleteNotification = async (id) => {
    if (!user?._id) return;
    try {
      await api.delete(`/allUsers/${user._id}/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error("Error clearing notifications:", err);
    }
  };

  if (!user) return null;

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => setOpen((s) => !s)}
        aria-label="Notifications"
        className="relative px-4 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
        title="Notifications"
      >
        <Bell className="h-5 w-5" />
        <span className="hidden sm:inline">Notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          {/* Left drawer */}
          <aside className="w-full max-w-sm bg-white shadow-2xl p-4 overflow-y-auto rounded-r-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#001233]">
                Notifications
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOpen(false)}
                  className="text-sm text-gray-500 hover:text-gray-800 transition"
                >
                  Close
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12 text-[#736CED]">Loading...</div>
            ) : error ? (
              <div className="text-red-600">{error}</div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 text-[#736CED]/70">
                No notifications
              </div>
            ) : (
              <ul className="space-y-3">
                {notifications.map((note) => (
                  <li
                    key={note._id}
                    className={`p-3 rounded-2xl border ${
                      note.isRead
                        ? "bg-gray-50 border-gray-200"
                        : "bg-[#F8F5FF] border-[#E9DEFF]"
                    }`}
                  >
                    <p className="text-sm text-[#312A68]">{note.message}</p>
                    {!note.isRead && (
                      <button
                        onClick={() => markAsRead(note._id)}
                        className="w-full text-left hover:underline hover:cursor-pointer rounded-md"
                      >
                        <p className="text-sm text-[#736CED]">mark as read</p>
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(note._id)}
                      className="w-full text-left hover:underline hover:cursor-pointer rounded-md"
                    >
                      <p className="text-sm text-[#FF0000]">delete message</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </aside>

          {/* Clickable overlay: clicking anywhere here closes the drawer */}
          <div className="flex-1" onClick={() => setOpen(false)} aria-hidden />
        </div>
      )}
    </div>
  );
}
