import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, MapPin, Send, X } from "lucide-react";

const STORAGE_KEY = "vendors-poll-selection";

const POLL_OPTIONS = [
  {
    id: "espresso-lab",
    name: "Campus Espresso Lab",
    tagline: "Specialty coffee, quick bites, and quiet study corners.",
    category: "Food & Beverage",
    location: "Student Union - Ground Floor",
    incentive: "Early bird: 15% off before 10 AM",
    votes: 182,
    lastMonthVotes: 133,
    tags: ["Wi-Fi lounge", "Breakfast", "Vegan"],
  },
  {
    id: "falafel-hub",
    name: "Falafel Hub",
    tagline: "Fresh wraps, shawarma bowls, and grab-and-go salads.",
    category: "Food & Beverage",
    location: "Food Court - Side Wing",
    incentive: "Loyalty card: 1 free wrap after 6 orders",
    votes: 151,
    lastMonthVotes: 140,
    tags: ["Budget friendly", "Protein", "Late hours"],
  },
  {
    id: "tech-stop",
    name: "Tech Stop Mini",
    tagline: "Adapters, chargers, keyboards, and on-the-spot fixes.",
    category: "Tech & Utilities",
    location: "Engineering Building - Lobby",
    incentive: "Bundle: 10% off cables when you buy chargers",
    votes: 129,
    lastMonthVotes: 92,
    tags: ["Repairs", "Accessories", "Warranty help"],
  },
  {
    id: "fit-bites",
    name: "Fit Bites",
    tagline: "Protein smoothies, healthy snacks, and hydration refills.",
    category: "Health",
    location: "Sports Complex - Entrance",
    incentive: "Refill: 50% off on water refills with own bottle",
    votes: 118,
    lastMonthVotes: 88,
    tags: ["Vegan", "Gluten free", "High protein"],
  },
];

const formatDelta = (current, previous) => {
  const delta = current - previous;
  if (!previous) return "+ New";
  const sign = delta >= 0 ? "+" : "-";
  return `${sign}${Math.abs(delta)}`;
};

export default function VendorsPoll() {
  const [selection, setSelection] = useState("");
  const [options, setOptions] = useState(POLL_OPTIONS);
  const [suggestion, setSuggestion] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSelection(stored);
    } catch (e) {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const totalVotes = useMemo(
    () => options.reduce((sum, option) => sum + option.votes, 0),
    [options]
  );

  const voteShare = (votes) => {
    if (!totalVotes) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  const handleVote = (id) => {
    setOptions((prev) => {
      return prev
        .map((opt) => {
          // remove previous vote before adding the new one
          if (selection && opt.id === selection) {
            return { ...opt, votes: Math.max(0, opt.votes - 1) };
          }
          return opt;
        })
        .map((opt) => {
          if (opt.id === id) {
            return { ...opt, votes: opt.votes + 1 };
          }
          return opt;
        });
    });
    setSelection(id);
    setToast({ type: "success", message: "Vote recorded. Thanks for weighing in!" });
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch (e) {
      // ignore storage errors
    }
  };

  const handleSubmitSuggestion = (e) => {
    e.preventDefault();
    if (!suggestion.trim()) {
      setToast({ type: "error", message: "Add a vendor name or link before submitting." });
      return;
    }
    setToast({ type: "success", message: "Thanks! We saved your vendor suggestion." });
    setSuggestion("");
  };

  return (
    <div className="w-full bg-[#F8FAFC] text-[#0F172A]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[2fr,1.05fr]">
          <div className="space-y-4">
            {options.map((option) => {
              const share = voteShare(option.votes);
              const delta = formatDelta(option.votes, option.lastMonthVotes);
              const isSelected = selection === option.id;
              return (
                <article
                  key={option.id}
                  className={`overflow-hidden rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition ${
                    isSelected ? "ring-2 ring-emerald-200" : "hover:shadow-md"
                  }`}
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-[#4338CA]">
                          {option.category}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                          <MapPin className="h-3 w-3 text-[#4C3BCF]" />
                          {option.location}
                        </span>
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                          {delta} votes vs last month
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-[#1F2937]">{option.name}</h3>
                      <p className="text-sm text-gray-600">{option.tagline}</p>
                      <p className="text-sm font-semibold text-emerald-600">
                        {option.incentive}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {option.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3 md:w-56">
                      <button
                        type="button"
                        onClick={() => handleVote(option.id)}
                        className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                          isSelected
                            ? "bg-emerald-500 text-white shadow-md shadow-emerald-200/60"
                            : "border border-gray-200 bg-white text-[#1F2937] hover:bg-gray-50"
                        }`}
                      >
                        {isSelected ? "Voted" : "Vote for this vendor"}
                      </button>
                      <div className="w-full rounded-2xl bg-gray-50 p-3 text-xs text-gray-600">
                        <div className="flex items-center justify-between text-gray-700">
                          <span>{option.votes} votes</span>
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

          <aside className="space-y-4 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-[#1F2937]">Have a vendor in mind?</h2>
              <p className="text-sm text-gray-600">
                Drop a name or link. We will shortlist suggestions that get repeated and invite them to the next bazaar round.
              </p>
            </div>
            <form className="space-y-3" onSubmit={handleSubmitSuggestion}>
              <textarea
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                rows={4}
                placeholder="Example: Urban Eats (Instagram: @urbaneats) - great for lunch bowls and smoothies."
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#4C3BCF] focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#4C3BCF] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3728a6]"
              >
                <Send className="h-4 w-4" />
                Send suggestion
              </button>
            </form>

            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700">
              <p className="flex items-center gap-2 font-semibold text-[#1F2937]">
                How voting works
              </p>
              <ul className="mt-2 space-y-2 text-gray-600">
                <li>Votes reset monthly so new vendors get a fair chance.</li>
                <li>Top 2 vendors get fast-tracked invitations to the bazaar.</li>
                <li>We will announce results on the dashboard and via email.</li>
              </ul>
            </div>
          </aside>
        </section>
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
