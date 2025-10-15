/**
 * Combines a date object and a time string (e.g., "14:00") into a single JS Date object.
 * @param {Date | string} date - The date object or string.
 * @param {string} time - The time string in HH:mm format.
 * @returns {Date | null} A combined Date object or null if inputs are invalid.
 */
const combineDateTime = (date, time) => {
  if (!date || !time) return null;
  const dateObj = new Date(date);
  const [hours, minutes] = time.split(":").map(Number);
  if (!isNaN(hours) && !isNaN(minutes)) {
    dateObj.setHours(hours, minutes, 0, 0);
  }
  return dateObj;
};

/**
 * Normalizes an event object from the backend to have a consistent structure for the frontend.
 * This acts as an adapter between the raw API data and the UI components.
 * @param {object} event - The raw event object from the API.
 * @returns {object} A normalized event object.
 */
export const getEventDetails = (event) => {
  if (!event) return {};

  // Correctly map the field names based on the Mongoose schemas
  return {
    id: event._id,
    type: event.type,
    name:
      event.bazaarname ||
      event.workshopname ||
      event.tripname ||
      event.conferencename ||
      event.boothname ||
      "Unnamed Event",
    location: event.location,
    price: event.price,
    startDate: combineDateTime(event.startdate, event.starttime),
    endDate: combineDateTime(event.enddate, event.endtime),
    registrationDeadline:
      event.registrationdeadline || event.registerationdeadline,
    description: event.shortdescription,
    faculty: event.facultyresponsibilty,
    professors: event.professorsparticipating || [],
    vendor: event.vendorId?.name || event.vendor,
    website: event.conferencelink,
    booths: event.booths || [],
    attendees: event.attendees || [],
    capacity: event.capacity,
    original: event,
    // Booth specific fields
    duration: event.duration,
    boothSize: event.boothSize,
  };
};

/**
 * Formats a date object into a more readable string.
 * @param {Date} dateObj - The date object to format.
 * @returns {string | null} The formatted date string or null if input is invalid.
 */
export const formatDate = (dateObj) => {
  if (!dateObj || !(dateObj instanceof Date)) return null;
  return dateObj.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
