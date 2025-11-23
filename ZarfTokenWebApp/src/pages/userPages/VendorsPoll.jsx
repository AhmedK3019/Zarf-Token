import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, MapPin, X } from "lucide-react";
import api from "../../services/api";

// Counts votes per booth for a poll
const countVotes = (poll) => {
  const counts = {};
  for (const b of poll.booths || []) counts[b._id] = 0;
  for (const v of poll.votes || []) {
    const id = typeof v.booth === "string" ? v.booth : v.booth?._id || v.booth;
    if (id && counts.hasOwnProperty(id)) counts[id] += 1;
  }
  return counts;
};

export default function VendorsPoll() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [polls, setPolls] = useState([]); // active polls only
  const [selection, setSelection] = useState({}); // pollId -> boothId
  const [toast, setToast] = useState(null);

  const refresh = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await api.get("/polls/active");
      const active = res.data || [];
      setPolls(active);
      // derive current user selections if votes include this user
      // Fallback: do nothing (user-specific highlight only after they vote)
    } catch (e) {
      setError(
        e?.response?.data?.error || e?.message || "Failed to load polls"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const totalVotesForPoll = (poll) => {
    const counts = countVotes(poll);
    return Object.values(counts).reduce((a, b) => a + b, 0);
  };

  const shareForBooth = (poll, boothId) => {
    const counts = countVotes(poll);
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    if (!total) return 0;
    return Math.round(((counts[boothId] || 0) / total) * 100);
  };

  const vote = async (pollId, boothId) => {
    try {
      await api.post("/polls/vote", { pollId, boothId });
      setSelection((prev) => ({ ...prev, [pollId]: boothId }));
      await refresh();
      setToast({ type: "success", message: "Vote recorded." });
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Failed to vote");
      setToast({ type: "error", message: "Could not submit vote." });
    }
  };

  return (
    <div className="w-full bg-[#F8FAFC] text-[#0F172A]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-gray-600">Loading active polls...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : polls.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-gray-600">No active polls available.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {polls.map((poll, idx) => {
              const counts = countVotes(poll);
              const total = totalVotesForPoll(poll);
              return (
                <section key={poll._id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-[#1F2937]">
                      Poll {idx + 1}
                    </h2>
                    <span className="text-xs font-medium text-gray-500">
                      {total} total vote{total === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="grid gap-6 lg:grid-cols-2">
                    {(poll.booths || []).map((booth) => {
                      const boothId = booth._id;
                      const votedFor = selection[poll._id] === boothId;
                      const votes = counts[boothId] || 0;
                      const share = shareForBooth(poll, boothId);
                      return (
                        <article
                          key={boothId}
                          className={`overflow-hidden rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition ${
                            votedFor
                              ? "ring-2 ring-emerald-200"
                              : "hover:shadow-md"
                          }`}
                        >
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                <span className="rounded-full bg-indigo-50 px-3 py-1 text-[#4338CA]">
                                  {booth.boothSize || "Size"}
                                </span>
                                {booth.location ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                                    <MapPin className="h-3 w-3 text-[#4C3BCF]" />
                                    {booth.location}
                                  </span>
                                ) : null}
                                {booth.duration ? (
                                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                                    {booth.duration} wk
                                    {booth.duration === 1 ? "" : "s"}
                                  </span>
                                ) : null}
                              </div>
                              <h3 className="text-2xl font-bold text-[#1F2937]">
                                {booth.boothname || "Unnamed Booth"}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {booth.startdate && booth.enddate
                                  ? `${new Date(
                                      booth.startdate
                                    ).toLocaleDateString()} - ${new Date(
                                      booth.enddate
                                    ).toLocaleDateString()}`
                                  : "Dates TBD"}
                              </p>
                              {typeof booth.price === "number" ? (
                                <p className="text-sm font-semibold text-emerald-600">
                                  Price: {booth.price} EGP
                                </p>
                              ) : null}
                            </div>
                            <div className="flex flex-col items-end gap-3 md:w-56">
                              <button
                                type="button"
                                onClick={() => vote(poll._id, boothId)}
                                className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                                  votedFor
                                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-200/60"
                                    : "border border-gray-200 bg-white text-[#1F2937] hover:bg-gray-50"
                                }`}
                              >
                                {votedFor ? "Voted" : "Vote for this booth"}
                              </button>
                              <div className="w-full rounded-2xl bg-gray-50 p-3 text-xs text-gray-600">
                                <div className="flex items-center justify-between text-gray-700">
                                  <span>{votes} votes</span>
                                  <span>{share}%</span>
                                </div>
                                <div className="mt-2 h-2 rounded-full bg-gray-200">
                                  <div
                                    className="h-2 rounded-full bg-emerald-500"
                                    style={{ width: `${share}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-lg ${
            toast.type === "error"
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {toast.type === "error" ? (
            <X className="h-4 w-4" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
