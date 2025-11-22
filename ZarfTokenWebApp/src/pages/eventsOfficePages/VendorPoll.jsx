import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

function formatDate(d) {
  try {
    return new Date(d).toLocaleDateString();
  } catch (e) {
    return "";
  }
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  const aS = new Date(aStart).getTime();
  const aE = new Date(aEnd).getTime();
  const bS = new Date(bStart).getTime();
  const bE = new Date(bEnd).getTime();
  if (isNaN(aS) || isNaN(aE) || isNaN(bS) || isNaN(bE)) return false;
  return aS <= bE && bS <= aE;
}

function buildOverlapGroups(requests) {
  const items = requests
    .filter(
      (r) =>
        !r.isBazarBooth && r.status === "Pending" && r.startdate && r.enddate
    )
    .sort((a, b) => new Date(a.startdate) - new Date(b.startdate));

  const groups = [];
  let current = [];
  let currentEnd = null;

  for (const r of items) {
    const rEnd = new Date(r.enddate).getTime();
    if (current.length === 0) {
      current.push(r);
      currentEnd = rEnd;
      continue;
    }
    const lastEnd = currentEnd;
    const rStart = new Date(r.startdate).getTime();
    if (rStart <= lastEnd) {
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

  const overlapGroups = useMemo(() => buildOverlapGroups(requests), [requests]);

  const refreshAll = async () => {
    setError("");
    setLoading(true);
    try {
      const [reqRes, actRes, allRes] = await Promise.all([
        api.get("/vendorRequests"),
        api.get("/polls/active"),
        api.get("/polls"),
      ]);
      setRequests(reqRes.data || []);
      setActivePolls(actRes.data || []);
      const allPolls = allRes.data || [];
      setPastPolls((allPolls || []).filter((p) => p.ended));
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const openCreatePoll = (group) => {
    const initial = {};
    for (const r of group) initial[r._id] = true;
    setSelectedBooths(initial);
    setCreateGroup(group);
    setCreateModalOpen(true);
  };

  const submitCreatePoll = async () => {
    const booths = Object.keys(selectedBooths).filter(
      (id) => selectedBooths[id]
    );
    if (booths.length < 2) {
      setError("Select at least two conflicting requests to create a poll.");
      return;
    }
    try {
      await api.post("/polls", { booths });
      setCreateModalOpen(false);
      setCreateGroup([]);
      await refreshAll();
    } catch (e) {
      setError(
        e?.response?.data?.error || e?.message || "Failed to create poll"
      );
    }
  };

  const endPoll = async (pollId) => {
    try {
      await api.post(`/polls/${pollId}/end`);
      await refreshAll();
      const ended = (activePolls || []).find((p) => p._id === pollId);
      if (ended) setResultsModalPoll(ended);
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Failed to end poll");
    }
  };

  const deletePoll = async (pollId) => {
    try {
      await api.delete(`/polls/${pollId}`);
      await refreshAll();
    } catch (e) {
      setError(
        e?.response?.data?.error || e?.message || "Failed to delete poll"
      );
    }
  };

  const countVotesPerBooth = (poll) => {
    const counts = {};
    for (const b of poll.booths || []) counts[b._id] = 0;
    for (const v of poll.votes || []) {
      const id =
        typeof v.booth === "string" ? v.booth : v.booth?._id || v.booth;
      if (id && counts.hasOwnProperty(id)) counts[id] += 1;
    }
    return counts;
  };

  return (
    <div className="p-4 space-y-8">
      <div>
        <h2 className="text-2xl font-semibold">Vendor Polls</h2>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      </div>

      {/* Overlap detection */}
      <section>
        <h3 className="text-lg font-semibold mb-2">
          Overlapping Pending Platform Requests
        </h3>
        {loading ? (
          <p className="text-gray-600 text-sm">Loading...</p>
        ) : overlapGroups.length === 0 ? (
          <p className="text-gray-600 text-sm">
            No overlapping pending platform vendor requests found.
          </p>
        ) : (
          <div className="space-y-4">
            {overlapGroups.map((group, idx) => (
              <div key={idx} className="border rounded p-3 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">Conflict Group #{idx + 1}</div>
                  <button
                    onClick={() => openCreatePoll(group)}
                    className="px-3 py-1.5 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    Create Poll
                  </button>
                </div>
                <div className="overflow-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500">
                        <th className="pr-4 py-1">Booth</th>
                        <th className="pr-4 py-1">Vendor Request ID</th>
                        <th className="pr-4 py-1">Start</th>
                        <th className="pr-4 py-1">End</th>
                        <th className="pr-4 py-1">Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.map((r) => (
                        <tr key={r._id} className="border-t">
                          <td className="pr-4 py-1">
                            {r.boothname || r.location || r._id.slice(-6)}
                          </td>
                          <td className="pr-4 py-1 font-mono">{r._id}</td>
                          <td className="pr-4 py-1">
                            {formatDate(r.startdate)}
                          </td>
                          <td className="pr-4 py-1">{formatDate(r.enddate)}</td>
                          <td className="pr-4 py-1">{r.location || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Active polls */}
      <section>
        <h3 className="text-lg font-semibold mb-2">Active Polls</h3>
        {loading ? (
          <p className="text-gray-600 text-sm">Loading...</p>
        ) : (activePolls || []).length === 0 ? (
          <p className="text-gray-600 text-sm">No active polls.</p>
        ) : (
          <div className="space-y-3">
            {activePolls.map((poll) => {
              const counts = countVotesPerBooth(poll);
              const total = Object.values(counts).reduce((a, b) => a + b, 0);
              return (
                <div
                  key={poll._id}
                  className="border rounded p-3 bg-white shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Poll {poll._id.slice(-6)}</div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setResultsModalPoll(poll)}
                        className="px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50"
                      >
                        View Results
                      </button>
                      <button
                        onClick={() => endPoll(poll._id)}
                        className="px-3 py-1.5 text-sm rounded bg-red-600 text-white hover:bg-red-700"
                      >
                        End Poll
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 overflow-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500">
                          <th className="pr-4 py-1">Booth</th>
                          <th className="pr-4 py-1">Votes</th>
                          <th className="pr-4 py-1">Share</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(poll.booths || []).map((b) => {
                          const c = counts[b._id] || 0;
                          const share = total
                            ? Math.round((c / total) * 100)
                            : 0;
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
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Past polls */}
      <section>
        <h3 className="text-lg font-semibold mb-2">Past Polls</h3>
        {loading ? (
          <p className="text-gray-600 text-sm">Loading...</p>
        ) : (pastPolls || []).length === 0 ? (
          <p className="text-gray-600 text-sm">No past polls.</p>
        ) : (
          <div className="space-y-3">
            {pastPolls.map((poll) => {
              const counts = countVotesPerBooth(poll);
              const total = Object.values(counts).reduce((a, b) => a + b, 0);
              return (
                <div
                  key={poll._id}
                  className="border rounded p-3 bg-white shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Poll {poll._id.slice(-6)}</div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDetailsModalPoll(poll)}
                        className="px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => deletePoll(poll._id)}
                        className="px-3 py-1.5 text-sm rounded bg-gray-800 text-white hover:bg-gray-900"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 overflow-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500">
                          <th className="pr-4 py-1">Booth</th>
                          <th className="pr-4 py-1">Votes</th>
                          <th className="pr-4 py-1">Share</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(poll.booths || []).map((b) => {
                          const c = counts[b._id] || 0;
                          const share = total
                            ? Math.round((c / total) * 100)
                            : 0;
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
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Create Poll Modal */}
      {createModalOpen ? (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg w-full max-w-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold">Create Poll</h4>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Select the conflicting requests to include in this poll.
            </p>
            <div className="max-h-64 overflow-auto border rounded">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="pr-4 py-1">Include</th>
                    <th className="pr-4 py-1">Booth</th>
                    <th className="pr-4 py-1">Start</th>
                    <th className="pr-4 py-1">End</th>
                  </tr>
                </thead>
                <tbody>
                  {createGroup.map((r) => (
                    <tr key={r._id} className="border-t">
                      <td className="pr-4 py-1">
                        <input
                          type="checkbox"
                          checked={!!selectedBooths[r._id]}
                          onChange={(e) =>
                            setSelectedBooths((prev) => ({
                              ...prev,
                              [r._id]: e.target.checked,
                            }))
                          }
                        />
                      </td>
                      <td className="pr-4 py-1">
                        {r.boothname || r.location || r._id.slice(-6)}
                      </td>
                      <td className="pr-4 py-1">{formatDate(r.startdate)}</td>
                      <td className="pr-4 py-1">{formatDate(r.enddate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setCreateModalOpen(false)}
                className="px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitCreatePoll}
                className="px-3 py-1.5 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Results Modal (after end or on-demand) */}
      {resultsModalPoll ? (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg w-full max-w-2xl p-4">
            <div className="flex items-center justify-between mb-3">
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
            <div className="mt-4 flex items-center justify-end">
              <button
                onClick={() => setResultsModalPoll(null)}
                className="px-3 py-1.5 text-sm rounded bg-gray-800 text-white hover:bg-gray-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Past Poll Details Modal */}
      {detailsModalPoll ? (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg w-full max-w-2xl p-4">
            <div className="flex items-center justify-between mb-3">
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
            <div className="mt-4 flex items-center justify-end">
              <button
                onClick={() => setDetailsModalPoll(null)}
                className="px-3 py-1.5 text-sm rounded bg-gray-800 text-white hover:bg-gray-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
