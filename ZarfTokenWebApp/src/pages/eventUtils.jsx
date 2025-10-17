const combineDateTime = (date, time) => {
  if (!date || !time) return null;
  const dateObj = new Date(date);
  const [hours, minutes] = time.split(":").map(Number);
  if (!isNaN(hours) && !isNaN(minutes)) {
    dateObj.setHours(hours, minutes, 0, 0);
  }
  return dateObj;
};

export const getEventDetails = (event) => {
  if (!event) return {};

  // Calculate duration for workshops based on start and end dates
  let duration = event.duration; // For booths that already have duration
  
  // For workshops, calculate duration from start and end dates
  if (event.type === 'workshop' && event.startdate && event.enddate) {
    const start = new Date(event.startdate);
    const end = new Date(event.enddate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
    duration = diffDays;
  }

  // Handle registration deadline - check all possible field names
  const registrationDeadline = 
    event.registrationDeadline || 
    event.registrationdeadline || 
    event.registerationDeadline || 
    event.registerationdeadline;

  // Handle professors
  let professors = [];
  if (event.professorsparticipating && event.professorsparticipating.length > 0) {
    professors = event.professorsparticipating.map(prof => {
      if (typeof prof === 'object' && prof.firstname) {
        return prof;
      } else {
        return { firstname: 'Professor', lastname: 'Unavailable', email: '' };
      }
    });
  }

  const result = {
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
    price: event.price || 0,
    startDate: combineDateTime(event.startdate, event.starttime),
    endDate: combineDateTime(event.enddate, event.endtime),
    registrationDeadline: registrationDeadline,
    description: event.shortdescription,
    faculty: event.facultyresponsibilty,
    professors: professors,
    vendor: event.vendorId?.name || event.vendor,
    website: event.conferencelink,
    booths: event.booths || [],
    attendees: event.attendees || [],
    capacity: event.capacity,
    original: event,
    duration: duration,
    boothSize: event.boothSize,
    fullagenda: event.fullagenda,
    fundingsource: event.fundingsource || event.sourceoffunding,
    requiredFunding: event.requiredFunding || event.requiredbudget,
    extrarequiredfunding: event.extrarequiredfunding,
    extrarequiredresources: event.extrarequiredresources,
  };
  return result;
};

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

// Use this simpler format for the card display
export const formatSimpleDate = (dateObj) => {
  if (!dateObj || !(dateObj instanceof Date)) return "Date TBD";
  return dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};