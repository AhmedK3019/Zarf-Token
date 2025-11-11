import React, { useState, useEffect, useMemo } from "react";
import api from "../../services/api"; // Corrected import path

// --- Helper Functions ---

/**
 * Normalizes event objects so filter/sort logic can use them.
 * Based on the Mongoose models provided (booth uses 'goLiveAt', others use 'startdate').
 */
const getEventDetails = (rawEvent) => {
  if (!rawEvent) return {};
  return {
    type: rawEvent.type,
    // Normalize the start date
    startDate: rawEvent.startdate || rawEvent.goLiveAt,
  };
};

// Helper function to format currency
const formatCurrency = (value) => {
  return `EGP ${Number(value || 0).toFixed(2)}`;
};

// Helper function to get consistent event revenue as a number
const getEventRevenue = (rawEvent) => {
  if (!rawEvent) return 0;
  const revenueString =
    rawEvent.revenue?.$numberDecimal || rawEvent.revenue || "0";
  return parseFloat(revenueString);
};

// Helper function to get consistent event name
const getEventName = (event) => {
  return (
    event.bazaarname ||
    event.tripname ||
    event.workshopname ||
    event.boothname ||
    "Unnamed Event"
  );
};

// Helper function to get consistent event start date
const getEventStartDate = (event) => {
  const dateStr = event.startdate || event.goLiveAt;
  return dateStr
    ? new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "N/A";
};

// --- Main Report Component ---

export default function EventsSalesReport() {
  // --- State Definitions ---

  // Data State
  const [events, setEvents] = useState([]); // Master list
  const [processedEvents, setProcessedEvents] = useState([]); // Filtered/sorted list
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter State
  const [filterType, setFilterType] = useState(""); // "all", "workshop", "trip", etc.
  const [filterDate, setFilterDate] = useState(""); // Specific date
  const [startDateFilter, setStartDateFilter] = useState(""); // Range start
  const [endDateFilter, setEndDateFilter] = useState(""); // Range end
  const [showFilters, setShowFilters] = useState(false); // State for filter toggle

  // Sorting State
  const [revenueSort, setRevenueSort] = useState(""); // "greatest", "least"

  // --- Data Fetching ---

  // Fetch all events on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const response = await api.get("/allEvents/getAllEvents");
        setEvents(response.data || []);
        setProcessedEvents(response.data || []); // Initialize processed list
      } catch (err) {
        setError("Failed to fetch event data. Please try again.");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // --- Filtering and Sorting Logic ---
  useEffect(() => {
    // 1. Get all filter values
    const lowercasedType = filterType.toLowerCase();
    const hasTypeFilter = lowercasedType !== "" && lowercasedType !== "all";

    const hasDateFilter = filterDate.trim() !== "";
    const hasStartDateFilter = startDateFilter.trim() !== "";
    const hasEndDateFilter = endDateFilter.trim() !== "";

    // 2. Apply all filters EXCEPT type filter
    let baseFiltered = events.filter((rawEvent) => {
      const event = getEventDetails(rawEvent); // Use helper

      // Filter 2: Specific Date Filter (exact match)
      let matchesDate = true;
      if (hasDateFilter && event.startDate) {
        const filterParts = filterDate.split("-").map(Number);
        const filterYear = filterParts[0];
        const filterMonth = filterParts[1] - 1;
        const filterDay = filterParts[2];

        const eventStartDate = new Date(event.startDate);
        const eventYear = eventStartDate.getFullYear();
        const eventMonth = eventStartDate.getMonth();
        const eventDay = eventStartDate.getDate();

        matchesDate =
          eventYear === filterYear &&
          eventMonth === filterMonth &&
          eventDay === filterDay;
      }

      // Filter 3: Start Date Range Filter (INCLUSIVE - on or after)
      let matchesStartDate = true;
      if (hasStartDateFilter && event.startDate) {
        const filterStartDate = new Date(startDateFilter);
        const eventStartDate = new Date(event.startDate);
        filterStartDate.setHours(0, 0, 0, 0);
        eventStartDate.setHours(0, 0, 0, 0);
        matchesStartDate = eventStartDate >= filterStartDate;
      }

      // Filter 4: End Date Range Filter (INCLUSIVE - on or before)
      let matchesEndDate = true;
      if (hasEndDateFilter && event.startDate) {
        const filterEndDate = new Date(endDateFilter);
        const eventStartDate = new Date(event.startDate);
        filterEndDate.setHours(0, 0, 0, 0);
        eventStartDate.setHours(0, 0, 0, 0);
        matchesEndDate = eventStartDate <= filterEndDate;
      }

      // Must match ALL date filters
      return matchesDate && matchesStartDate && matchesEndDate;
    });

    // 3. Define the reusable sorting function
    const sortEvents = (eventList) => {
      if (!revenueSort) return eventList; // No sorting needed

      return [...eventList].sort((a, b) => {
        // Sort by revenue
        const revenueA = getEventRevenue(a);
        const revenueB = getEventRevenue(b);

        if (revenueSort === "greatest") return revenueB - revenueA; // Greatest to least
        if (revenueSort === "least") return revenueA - revenueB; // Least to greatest
        return 0;
      });
    };

    // 4. Apply type filtering and sorting logic
    let finalEvents = [];
    if (hasTypeFilter) {
      // Case 1: User selected a specific type (e.g., "workshop")
      finalEvents = baseFiltered.filter(
        (event) => event.type?.toLowerCase() === lowercasedType
      );
      finalEvents = sortEvents(finalEvents);
    } else {
      // Case 2: User selected "All Types"
      finalEvents = sortEvents(baseFiltered);
    }

    setProcessedEvents(finalEvents); // Update the state that the report reads from
  }, [
    events,
    filterType,
    filterDate,
    startDateFilter,
    endDateFilter,
    revenueSort,
  ]);

  // --- Revenue Calculation ---
  const reportData = useMemo(() => {
    let totalRevenue = 0;
    const revenueByType = {
      bazaar: 0,
      trip: 0,
      workshop: 0,
      booth: 0,
    };

    const eventsWithRevenue = processedEvents
      .map((event) => {
        const revenue = getEventRevenue(event); // Use helper

        if (revenue > 0) {
          totalRevenue += revenue;
          const type = event.type || "other";
          if (revenueByType.hasOwnProperty(type)) {
            revenueByType[type] += revenue;
          }
          return {
            ...event,
            parsedRevenue: revenue,
          };
        }
        return null;
      })
      .filter(Boolean); // Remove null entries

    return { totalRevenue, revenueByType, eventsWithRevenue };
  }, [processedEvents]);

  // --- Render Loading/Error States ---

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4a4ae6]"></div>
        <p className="ml-4 text-gray-600">Loading sales report...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  // --- Main Render ---

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-[#4C3BCF] mb-8">
        Events Sales Report
      </h1>

      {/* --- Detailed Revenue Table --- */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        {/* --- Table header with title and filter button --- */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center p-6 border-b gap-4">
          <h2 className="text-xl font-semibold text-[#4C3BCF]">
            Revenue Breakdown per Event
          </h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4a4ae6] focus:border-transparent shadow-sm flex items-center justify-center gap-2 text-sm font-medium"
          >
            <svg
              className="h-5 w-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <span>{showFilters ? "Hide Filters" : "Filters"}</span>
          </button>
        </div>

        {/* --- Conditionally Rendered Filter Controls --- */}
        {showFilters && (
          <div className="p-6 bg-gray-50 border-b">
            {/* Row 1: 3 items */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Type Filter */}
              <div>
                <label
                  htmlFor="filter-type"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Event Type
                </label>
                <select
                  id="filter-type"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#4a4ae6] focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="bazaar">Bazaar</option>
                  <option value="trip">Trip</option>
                  <option value="workshop">Workshop</option>
                  <option value="booth">Booth</option>
                </select>
              </div>

              {/* Revenue Sort */}
              <div>
                <label
                  htmlFor="revenue-sort"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Sort by Revenue
                </label>
                <select
                  id="revenue-sort"
                  value={revenueSort}
                  onChange={(e) => setRevenueSort(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#4a4ae6] focus:border-transparent"
                >
                  <option value="">No Sorting</option>
                  <option value="greatest">Greatest to least</option>
                  <option value="least">Least to greatest</option>
                </select>
              </div>

              {/* Specific Date Filter */}
              <div>
                <label
                  htmlFor="filter-date"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Specific Date
                </label>
                <input
                  type="date"
                  id="filter-date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4a4ae6] focus:border-transparent"
                />
              </div>

              {/* Date Range Filter */}
              <div className="md:col-span-2 lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Range
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex-1">
                    <input
                      type="date"
                      value={startDateFilter}
                      onChange={(e) => setStartDateFilter(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4a4ae6] focus:border-transparent"
                      placeholder="Start"
                    />
                  </div>
                  <span className="text-gray-500 text-center sm:text-left">
                    to
                  </span>
                  <div className="flex-1">
                    <input
                      type="date"
                      value={endDateFilter}
                      onChange={(e) => setEndDateFilter(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4a4ae6] focus:border-transparent"
                      placeholder="End"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* --- NEW: Clear Filters Button Row --- */}
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {/* Using reportData.eventsWithRevenue for the count */}
                {reportData.eventsWithRevenue.length} event
                {reportData.eventsWithRevenue.length !== 1 ? "s" : ""} found
              </div>
              <button
                onClick={() => {
                  setFilterType("");
                  setFilterDate("");
                  setStartDateFilter("");
                  setEndDateFilter("");
                  setRevenueSort("");
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}

        {/* --- Table Content --- */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Event Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.eventsWithRevenue.length > 0 ? (
                reportData.eventsWithRevenue.map((event) => (
                  <tr key={event._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {getEventName(event)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {event.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getEventStartDate(event)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-right font-medium">
                      {formatCurrency(event.parsedRevenue)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-12 text-center text-sm text-gray-500"
                  >
                    No events with revenue found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
            {/* Table Footer with Total */}
            <tfoot className="bg-gray-50 border-t-2 border-gray-300">
              <tr>
                <td colSpan="3" className="px-6 py-4">
                  {/* Empty spacer cell */}
                  &nbsp;
                </td>
                <td className="px-6 py-4 text-right text-sm font-bold">
                  <span className="text-gray-800 uppercase mr-4">
                    Total:
                  </span>
                  {/* Emphasized Total */}
                  <span className="text-[#4C3BCF] text-lg">
                    {formatCurrency(reportData.totalRevenue)}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}