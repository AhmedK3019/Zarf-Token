import React, { useEffect, useState, useMemo } from "react";
import { MapPin, X } from "lucide-react";
import api from "../../services/api";

function formatDate(d) {
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return "";
  }
}

function buildOverlapGroups(requests) {
  const items = requests
    .filter(
      (r) =>
        !r.isBazarBooth &&
        r.status === "Pending" &&
        r.startdate &&
        r.enddate &&
        new Date(r.startdate) < new Date(r.enddate)
    )
    .sort((a, b) => new Date(a.startdate) - new Date(b.startdate));

  const groups = [];
  let current = [];
  let currentEnd = null;
  for (const r of items) {
    const rStart = new Date(r.startdate).getTime();
    const rEnd = new Date(r.enddate).getTime();
    if (!current.length) {
      current.push(r);
      currentEnd = rEnd;
      continue;
    }
    if (rStart <= currentEnd) {
      current.push(r);
      currentEnd = Math.max(currentEnd, rEnd);
    } else {
      if (current.length >= 2) groups.push(current);
      current = [r];
      currentEnd = rEnd;
    }
  }
  if (current.length >= 2) groups.push(current);
  return groups;
}

function countVotesPerBooth(poll) {
  const counts = {};
  (poll.votes || []).forEach((v) => {
    if (v.booth) counts[v.booth] = (counts[v.booth] || 0) + 1;
  });
  return counts;
}

export default function VendorPoll() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requests, setRequests] = useState([]);
  const [activePolls, setActivePolls] = useState([]);
  const [pastPolls, setPastPolls] = useState([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createGroup, setCreateGroup] = useState([]);
  const [selectedBooths, setSelectedBooths] = useState({});
  const [resultsModalPoll, setResultsModalPoll] = useState(null);
  const [detailsModalPoll, setDetailsModalPoll] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [reqRes, activeRes, allRes] = await Promise.all([
          api.get("/vendorRequests"),
          api.get("/polls/active"),
          api.get("/polls"),
        ]);
        const allPolls = allRes.data || [];
        const active = activeRes.data || [];
        const past = allPolls.filter((p) => p.ended);
        const usedBoothIds = new Set();
        allPolls.forEach((p) =>
          (p.booths || []).forEach((b) => usedBoothIds.add(b._id))
        );
        const vendorRequests = (reqRes.data || []).filter(
          (r) => !usedBoothIds.has(r._id)
        );
        setRequests(vendorRequests);
        setActivePolls(active);
        setPastPolls(past);
      } catch (e) {
        setError(
          e?.response?.data?.error || e.message || "Failed to load data"
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const overlapGroups = useMemo(() => buildOverlapGroups(requests), [requests]);

  function openCreatePoll(group) {
    setCreateGroup(group);
    const initial = {};
    group.forEach((r) => (initial[r._id] = true));
    setSelectedBooths(initial);
    setCreateModalOpen(true);
  }

  async function submitCreatePoll() {
    const boothIds = Object.entries(selectedBooths)
      .filter(([, v]) => v)
      .map(([id]) => id);
    if (boothIds.length < 2) {
      setError("Select at least two booths to create a poll.");
      return;
    }
    try {
      await api.post("/polls", { booths: boothIds });
      setCreateModalOpen(false);
      setSelectedBooths({});
      const [activeRes, allRes] = await Promise.all([
        api.get("/polls/active"),
        api.get("/polls"),
      ]);
      const allPolls = allRes.data || [];
      setActivePolls(activeRes.data || []);
      setPastPolls(allPolls.filter((p) => p.ended));
      const usedBoothIds = new Set();
      allPolls.forEach((p) =>
        (p.booths || []).forEach((b) => usedBoothIds.add(b._id))
      );
      setRequests((prev) => prev.filter((r) => !usedBoothIds.has(r._id)));
    } catch (e) {
      setError(
        e?.response?.data?.error || e.message || "Failed to create poll"
      );
    }
  }

  async function endPoll(id) {
    try {
      await api.post(`/polls/${id}/end`);
      const [activeRes, allRes] = await Promise.all([
        api.get("/polls/active"),
        api.get("/polls"),
      ]);
      const allPolls = allRes.data || [];
      setActivePolls(activeRes.data || []);
      setPastPolls(allPolls.filter((p) => p.ended));
    } catch (e) {
      setError(e?.response?.data?.error || e.message || "Failed to end poll");
    }
  }

  async function deletePoll(id) {
    try {
      await api.delete(`/polls/${id}`);
      const [activeRes, allRes] = await Promise.all([
        api.get("/polls/active"),
        api.get("/polls"),
      ]);
      const allPolls = allRes.data || [];
      setActivePolls(activeRes.data || []);
      setPastPolls(allPolls.filter((p) => p.ended));
    } catch (e) {
      setError(
        e?.response?.data?.error || e.message || "Failed to delete poll"
      );
    }
  }

  return (
    <div className="w-full bg-[#F8FAFC] text-[#0F172A]">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8 space-y-12">
        {error ? (
          <div className="flex items-center justify-center py-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : null}

        <section className="space-y-6">
          <h1 className="text-2xl font-bold">
            Overlapping Pending Platform Booth Requests
          </h1>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-gray-600">
                Loading overlapping requests...
              </p>
            </div>
          ) : overlapGroups.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-gray-600 text-center">
                No overlapping pending platform vendor requests found.
              </p>
            </div>
          ) : (
            overlapGroups.map((group, idx) => (
              <div key={idx} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[#1F2937]">
                    Conflict Group {idx + 1}
                  </h2>
                  <button
                    onClick={() => openCreatePoll(group)}
                    className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                  >
                    Create Poll
                  </button>
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
                  {group.map((r) => (
                    <article
                      key={r._id}
                      className="overflow-hidden rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            <span className="rounded-full bg-indigo-50 px-3 py-1 text-[#4338CA]">
                              {r.boothSize || "Size"}
                            </span>
                            {r.location ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                                <MapPin className="h-3 w-3 text-[#4C3BCF]" />
                                {r.location}
                              </span>
                            ) : null}
                            {r.duration ? (
                              <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                                {r.duration} wk{r.duration === 1 ? "" : "s"}
                              </span>
                            ) : null}
                          </div>
                          <h3 className="text-2xl font-bold text-[#1F2937]">
                            {r.boothname || "Unnamed Booth"}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {r.startdate && r.enddate
                              ? `${formatDate(r.startdate)} - ${formatDate(
                                  r.enddate
                                )}`
                              : "Dates TBD"}
                          </p>
                          {typeof r.price === "number" ? (
                            <p className="text-sm font-semibold text-emerald-600">
                              Price: {r.price} EGP
                            </p>
                          ) : null}
                        </div>
                        <div className="flex flex-col items-end gap-3 md:w-56">
                          <div className="w-full rounded-2xl bg-gray-50 p-3 text-xs text-gray-600">
                            <div className="flex items-center justify-between text-gray-700">
                              <span className="font-mono text-[10px]">
                                {r._id.slice(-8)}
                              </span>
                              <span>{r.status}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))
          )}
        </section>

        <section className="space-y-8">
          <h1 className="text-2xl font-bold">Active Polls</h1>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-gray-600">Loading active polls...</p>
            </div>
          ) : activePolls.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-gray-600">No active polls.</p>
            </div>
          ) : (
            activePolls.map((poll, idx) => {
              const counts = countVotesPerBooth(poll);
              const total = Object.values(counts).reduce((a, b) => a + b, 0);
              return (
                <div key={poll._id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-[#1F2937]">
                      Active Poll {idx + 1}
                    </h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setResultsModalPoll(poll)}
                        className="rounded-2xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-200"
                      >
                        View Results
                      </button>
                      <button
                        onClick={() => endPoll(poll._id)}
                        className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
                      >
                        End Poll
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-6 lg:grid-cols-2">
                    {(poll.booths || []).map((b) => {
                      const votes = counts[b._id] || 0;
                      const share = total
                        ? Math.round((votes / total) * 100)
                        : 0;
                      return (
                        <article
                          key={b._id}
                          className="overflow-hidden rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
                        >
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                <span className="rounded-full bg-indigo-50 px-3 py-1 text-[#4338CA]">
                                  {b.boothSize || "Size"}
                                </span>
                                {b.location ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                                    <MapPin className="h-3 w-3 text-[#4C3BCF]" />
                                    {b.location}
                                  </span>
                                ) : null}
                                {b.duration ? (
                                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                                    {b.duration} wk{b.duration === 1 ? "" : "s"}
                                  </span>
                                ) : null}
                              </div>
                              <h3 className="text-2xl font-bold text-[#1F2937]">
                                {b.boothname || "Unnamed Booth"}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {b.startdate && b.enddate
                                  ? `${formatDate(b.startdate)} - ${formatDate(
                                      b.enddate
                                    )}`
                                  : "Dates TBD"}
                              </p>
                              {typeof b.price === "number" ? (
                                <p className="text-sm font-semibold text-emerald-600">
                                  Price: {b.price} EGP
                                </p>
                              ) : null}
                            </div>
                            <div className="flex flex-col items-end gap-3 md:w-56">
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
                </div>
              );
            })
          )}
        </section>

        <section className="space-y-8">
          <h1 className="text-2xl font-bold">Past Polls</h1>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-gray-600">Loading past polls...</p>
            </div>
          ) : pastPolls.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-gray-600">No past polls.</p>
            </div>
          ) : (
            pastPolls.map((poll, idx) => {
              const counts = countVotesPerBooth(poll);
              const total = Object.values(counts).reduce((a, b) => a + b, 0);
              return (
                <div key={poll._id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-[#1F2937]">
                      Past Poll {idx + 1}
                    </h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDetailsModalPoll(poll)}
                        className="rounded-2xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-200"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => deletePoll(poll._id)}
                        className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-6 lg:grid-cols-2">
                    {(poll.booths || []).map((b) => {
                      const votes = counts[b._id] || 0;
                      const share = total
                        ? Math.round((votes / total) * 100)
                        : 0;
                      return (
                        <article
                          key={b._id}
                          className="overflow-hidden rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
                        >
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                <span className="rounded-full bg-indigo-50 px-3 py-1 text-[#4338CA]">
                                  {b.boothSize || "Size"}
                                </span>
                                {b.location ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                                    <MapPin className="h-3 w-3 text-[#4C3BCF]" />
                                    {b.location}
                                  </span>
                                ) : null}
                                {b.duration ? (
                                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                                    {b.duration} wk{b.duration === 1 ? "" : "s"}
                                  </span>
                                ) : null}
                              </div>
                              <h3 className="text-2xl font-bold text-[#1F2937]">
                                {b.boothname || "Unnamed Booth"}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {b.startdate && b.enddate
                                  ? `${formatDate(b.startdate)} - ${formatDate(
                                      b.enddate
                                    )}`
                                  : "Dates TBD"}
                              </p>
                              {typeof b.price === "number" ? (
                                <p className="text-sm font-semibold text-emerald-600">
                                  Price: {b.price} EGP
                                </p>
                              ) : null}
                            </div>
                            <div className="flex flex-col items-end gap-3 md:w-56">
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
                </div>
              );
            })
          )}
        </section>
      </div>

      {createModalOpen ? (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-lg w-full max-w-2xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">Create Poll</h4>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Select the conflicting requests to include in this poll.
            </p>
            <div className="max-h-72 overflow-auto grid gap-4 sm:grid-cols-2">
              {createGroup.map((r) => (
                <label
                  key={r._id}
                  className={`cursor-pointer rounded-2xl border p-4 text-xs space-y-1 transition ${
                    selectedBooths[r._id]
                      ? "border-emerald-400 bg-emerald-50"
                      : "border-gray-200 bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-700">
                      {r.boothname || r.location || r._id.slice(-6)}
                    </span>
                    <input
                      type="checkbox"
                      checked={!!selectedBooths[r._id]}
                      onChange={(e) =>
                        setSelectedBooths((prev) => ({
                          ...prev,
                          [r._id]: e.target.checked,
                        }))
                      }
                      className="h-4 w-4"
                    />
                  </div>
                  <div className="text-gray-600">
                    {r.startdate && r.enddate
                      ? `${formatDate(r.startdate)} - ${formatDate(r.enddate)}`
                      : "Dates TBD"}
                  </div>
                  {r.location ? (
                    <div className="flex items-center gap-1 text-gray-600">
                      <MapPin className="h-3 w-3 text-[#4C3BCF]" />
                      <span>{r.location}</span>
                    </div>
                  ) : null}
                  {typeof r.price === "number" ? (
                    <div className="text-emerald-600 font-semibold">
                      {r.price} EGP
                    </div>
                  ) : null}
                </label>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setCreateModalOpen(false)}
                className="px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitCreatePoll}
                className="px-4 py-2 text-sm rounded-2xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
              >
                Create Poll
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {resultsModalPoll ? (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-lg w-full max-w-2xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">Poll Results</h4>
              <button
                onClick={() => setResultsModalPoll(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            {(() => {
              const counts = countVotesPerBooth(resultsModalPoll);
              const total = Object.values(counts).reduce((a, b) => a + b, 0);
              return (
                <div className="overflow-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500">
                        <th className="pr-4 py-1">Booth</th>
                        <th className="pr-4 py-1">Votes</th>
                        <th className="pr-4 py-1">Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(resultsModalPoll.booths || []).map((b) => {
                        const c = counts[b._id] || 0;
                        const share = total ? Math.round((c / total) * 100) : 0;
                        return (
                          <tr key={b._id} className="border-t">
                            <td className="pr-4 py-1">
                              {b.boothname || b.location || b._id.slice(-6)}
                            </td>
                            <td className="pr-4 py-1">{c}</td>
                            <td className="pr-4 py-1">{share}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })()}
            <div className="mt-6 flex items-center justify-end">
              <button
                onClick={() => setResultsModalPoll(null)}
                className="rounded-2xl bg-gray-800 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {detailsModalPoll ? (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-lg w-full max-w-2xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">Poll Details</h4>
              <button
                onClick={() => setDetailsModalPoll(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            {(() => {
              const counts = countVotesPerBooth(detailsModalPoll);
              const total = Object.values(counts).reduce((a, b) => a + b, 0);
              return (
                <div className="overflow-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500">
                        <th className="pr-4 py-1">Booth</th>
                        <th className="pr-4 py-1">Votes</th>
                        <th className="pr-4 py-1">Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(detailsModalPoll.booths || []).map((b) => {
                        const c = counts[b._id] || 0;
                        const share = total ? Math.round((c / total) * 100) : 0;
                        return (
                          <tr key={b._id} className="border-t">
                            <td className="pr-4 py-1">
                              {b.boothname || b.location || b._id.slice(-6)}
                            </td>
                            <td className="pr-4 py-1">{c}</td>
                            <td className="pr-4 py-1">{share}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })()}
            <div className="mt-6 flex items-center justify-end">
              <button
                onClick={() => setDetailsModalPoll(null)}
                className="rounded-2xl bg-gray-800 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {error && !loading ? (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 shadow-lg">
          <X className="h-4 w-4" />
          <span>{error}</span>
        </div>
      ) : null}
    </div>
  );
}
