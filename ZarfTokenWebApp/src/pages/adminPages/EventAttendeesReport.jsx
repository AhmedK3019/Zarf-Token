import React, { useState, useEffect, useMemo } from "react";
import api from "../../services/api";
import { getEventDetails, formatSimpleDate } from "../eventUtils";

// --- Helper Functions ---

// Helper function to get attendee count for an event
const getAttendeeCount = (rawEvent) => {
  if (!rawEvent) return 0;
  
  // For workshops and trips, count attendees array
  if (rawEvent.attendees && Array.isArray(rawEvent.attendees)) {
    return rawEvent.attendees.length;
  }
  return 0;
};

// Palette aligned with the dashboard's deep blue tones
const chartPalette = ["#001233", "#33415c", "#5c677d", "#7d8597", "#c0d6df"];


export default function EventAttendeesReport() {

  const [events, setEvents] = useState([]);
  const [processedEvents, setProcessedEvents] = useState([]); // Filtered/sorted list
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter State
  const [filterType, setFilterType] = useState(""); 
  const [filterName, setFilterName] = useState(""); 
  const [filterDate, setFilterDate] = useState(""); 
  const [startDateFilter, setStartDateFilter] = useState(""); 
  const [endDateFilter, setEndDateFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false); 



  // Fetch all events on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const response = await api.get("/allEvents/getAllEvents");
        setEvents(response.data || []);
        setProcessedEvents(response.data || []);
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
    const hasNameFilter = filterName.trim() !== "";
    const hasDateFilter = filterDate.trim() !== "";
    const hasStartDateFilter = startDateFilter.trim() !== "";
    const hasEndDateFilter = endDateFilter.trim() !== "";


    let baseFiltered = events
      .filter((rawEvent) => {
        return rawEvent.type === "workshop" || rawEvent.type === "trip";
      })
      .filter((rawEvent) => {
        const event = getEventDetails(rawEvent); 

        // Filter by event name
        let matchesName = true;
        if (hasNameFilter) {
          const eventName = event.name.toLowerCase();
          matchesName = eventName.includes(filterName.toLowerCase());
        }

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

        // Must match ALL filters
        return matchesName && matchesDate && matchesStartDate && matchesEndDate;
      });

    // 3. Sort events by newest date first
    const sortEventsByDate = (eventList) => {
      return [...eventList].sort((a, b) => {
        const eventA = getEventDetails(a);
        const eventB = getEventDetails(b);
        
        const dateA = eventA.startDate || new Date(0);
        const dateB = eventB.startDate || new Date(0);
        return new Date(dateB) - new Date(dateA); // Newest first
      });
    };

    // 4. Apply type filtering and sort by date
    let finalEvents = [];
    if (hasTypeFilter) {
      finalEvents = baseFiltered.filter(
        (event) => event.type?.toLowerCase() === lowercasedType
      );
      finalEvents = sortEventsByDate(finalEvents);
    } else {
      finalEvents = sortEventsByDate(baseFiltered);
    }

    setProcessedEvents(finalEvents);
  }, [
    events,
    filterType,
    filterName,
    filterDate,
    startDateFilter,
    endDateFilter,
  ]);

  // --- Attendee Calculation ---
  const reportData = useMemo(() => {
    let totalAttendees = 0;
    const attendeesByType = {
      trip: 0,
      workshop: 0,
    };

    const eventsWithAttendees = processedEvents
      .map((event) => {
        const attendeeCount = getAttendeeCount(event);
        
        totalAttendees += attendeeCount;
        const type = event.type || "other";
        if (attendeesByType.hasOwnProperty(type)) {
          attendeesByType[type] += attendeeCount;
        }
        
        return {
          ...event,
          attendeeCount: attendeeCount,
        };
      })
      .filter(Boolean); // Remove null entries

    return { totalAttendees, attendeesByType, eventsWithAttendees };
  }, [processedEvents]);

  // --- Render Loading/Error States ---

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#001233]"></div>
        <p className="ml-4 text-gray-600">Loading attendees report...</p>
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

  const barChartData = reportData.eventsWithAttendees.map((event, index) => {
    const details = getEventDetails(event);
    return {
      id: event._id || index,
      label: details.name,
      value: event.attendeeCount,
      color: chartPalette[index % chartPalette.length],
    };
  });

  const maxBarValue = Math.max(...barChartData.map((item) => item.value), 0);

  let cumulative = 0;
  const pieChartSegments = reportData.eventsWithAttendees.map(
    (event, index) => {
      const percent = reportData.totalAttendees
        ? (event.attendeeCount / reportData.totalAttendees) * 100
        : 0;
      const details = getEventDetails(event);
      const segment = {
        id: event._id || index,
        label: details.name,
        value: event.attendeeCount,
        percent,
        start: cumulative,
        end: cumulative + percent,
        color: chartPalette[index % chartPalette.length],
      };
      cumulative += percent;
      return segment;
    }
  );

  const pieBackground = pieChartSegments
    .map((segment) => `${segment.color} ${segment.start}% ${segment.end}%`)
    .join(", ");

  

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* --- Detailed Attendees Table --- */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        {/* --- Table header with title and filter button --- */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center p-6 border-b gap-4">
          <h2 className="text-xl font-semibold text-[#001233]">
            Attendee Breakdown per Event
          </h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 rounded-lg border border-[#001233] text-[#001233] bg-white hover:bg-[#001233] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#001233] focus:border-transparent shadow-sm flex items-center justify-center gap-2 text-sm font-medium transition-colors"
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
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#001233] focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="trip">Trip</option>
                  <option value="workshop">Workshop</option>
                </select>
              </div>

              {/* Event Name Filter */}
              <div>
                <label
                  htmlFor="filter-name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Event Name
                </label>
                <input
                  type="text"
                  id="filter-name"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  placeholder="Search by event name..."
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#001233] focus:border-transparent"
                />
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
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#001233] focus:border-transparent"
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
                      onChange={(e) => {
                        setStartDateFilter(e.target.value);
                        // Clear end date if it's before the new start date
                        if (endDateFilter && e.target.value && new Date(endDateFilter) < new Date(e.target.value)) {
                          setEndDateFilter("");
                        }
                      }}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#001233] focus:border-transparent"
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
                      min={startDateFilter || undefined}
                      onChange={(e) => setEndDateFilter(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#001233] focus:border-transparent"
                      placeholder="End"
                    />
                  </div>
                </div>
              </div>
            </div>

            
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {reportData.eventsWithAttendees.length} event
                {reportData.eventsWithAttendees.length !== 1 ? "s" : ""} found
              </div>
              <button
                onClick={() => {
                  setFilterType("");
                  setFilterName("");
                  setFilterDate("");
                  setStartDateFilter("");
                  setEndDateFilter("");
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
                  Attendees
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.eventsWithAttendees.length > 0 ? (
                reportData.eventsWithAttendees.map((event) => {
                  const eventDetails = getEventDetails(event);
                  return (
                    <tr key={event._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {eventDetails.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                        {event.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {eventDetails.startDate ? formatSimpleDate(eventDetails.startDate) : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-right font-medium">
                        {event.attendeeCount}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-12 text-center text-sm text-gray-500"
                  >
                    No events found matching your filters.
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
                  
                  <span className="text-[#001233] text-lg">
                    {reportData.totalAttendees}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* --- Analytics Charts --- */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
        {/* Bar Chart */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-[#001233]">
                Attendees by Event
              </h3>
              <p className="text-sm text-gray-500">
                Mirrors the filtered table data
              </p>
            </div>
            <span className="text-xs text-gray-400 uppercase tracking-wide">
              Bar Chart
            </span>
          </div>

          {barChartData.length > 0 ? (
            <div className="mt-6 h-72 overflow-x-auto">
              <div className="flex items-end h-full gap-4 min-w-full">
                {barChartData.map((item) => {
                  const heightPercent = maxBarValue
                    ? (item.value / maxBarValue) * 100
                    : 0;
                  return (
                    <div
                      key={item.id}
                      className="flex flex-col items-center justify-end min-w-[120px]"
                    >
                      <div className="flex items-end h-48 w-full">
                        <div
                          className="w-full rounded-t-md transition-transform duration-200 hover:scale-[1.02]"
                          style={{
                            height: `${heightPercent}%`,
                            background: item.color,
                          }}
                          title={`${item.label}: ${item.value} attendees`}
                        />
                      </div>
                      <div className="mt-2 text-center">
                        <div className="text-sm font-semibold text-[#001233]">
                          {item.value} attendees
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-[110px]">
                          {item.label}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mt-8 text-center text-gray-500 text-sm">
              No chart data available. Adjust filters to see insights.
            </div>
          )}
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-[#001233]">
                Attendance Contribution
              </h3>
              <p className="text-sm text-gray-500">
                Share of total attendees per event
              </p>
            </div>
            <span className="text-xs text-gray-400 uppercase tracking-wide">
              Pie Chart
            </span>
          </div>

          {pieChartSegments.length > 0 ? (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 items-center">
              <div className="flex justify-center">
                <div className="relative w-48 h-48">
                  <div
                    className="w-48 h-48 rounded-full shadow-inner"
                    style={{
                      background: `conic-gradient(${pieBackground})`,
                    }}
                  />
                  <div className="absolute inset-8 bg-white rounded-full flex flex-col items-center justify-center text-center shadow">
                    <p className="text-xs text-gray-500">Total Attendees</p>
                    <p className="text-base font-semibold text-[#001233] mt-1">
                      {reportData.totalAttendees}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {pieChartSegments.map((segment) => (
                  <div
                    key={segment.id}
                    className="flex items-center justify-between gap-3 border border-gray-100 rounded-lg px-3 py-2"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="w-3 h-3 rounded-sm flex-shrink-0"
                        style={{ backgroundColor: segment.color }}
                      ></span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#001233] truncate">
                          {segment.label}
                        </p>
                        <p className="text-xs text-gray-500">
                          {segment.value} attendees
                        </p>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-[#001233]">
                      {segment.percent.toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-8 text-center text-gray-500 text-sm">
              No pie data available. Adjust filters to see insights.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
