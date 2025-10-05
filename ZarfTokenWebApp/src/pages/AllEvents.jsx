import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const EventsPage = () => {
  const { category } = useParams();
  const [selectedCategory, setSelectedCategory] = useState(category || "all");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const eventCategories = [
    { id: "all", name: "All Events" },
    { id: "workshops", name: "Workshops" },
    { id: "bazaars", name: "Bazaars" },
    { id: "trips", name: "Trips" },
    { id: "conferences", name: "Conferences" },
  ];

  // Mock API data - replace with your actual API calls
  const mockEvents = {
    workshops: [
      {
        id: 1,
        name: "Web Development Workshop",
        location: "Tech Building Room 101",
        startdateandtime: "2024-03-15T10:00:00",
        enddateandtime: "2024-03-15T16:00:00",
        shortdescription: "Learn modern web development techniques",
        fullagenda: "HTML, CSS, JavaScript, React, and more...",
        facultyresponsible: "Dr. Smith",
        professorsparticipating: ["Dr. Smith", "Prof. Johnson"],
        registrationdeadline: "2024-03-10T23:59:00",
        type: "workshops"
      },
      {
        id: 2,
        name: "AI & Machine Learning",
        location: "Science Center Lab 3",
        startdateandtime: "2024-03-20T14:00:00",
        enddateandtime: "2024-03-20T18:00:00",
        shortdescription: "Introduction to AI and ML concepts",
        fullagenda: "Neural networks, deep learning, practical applications",
        facultyresponsible: "Dr. Brown",
        professorsparticipating: ["Dr. Brown", "Prof. Davis"],
        registrationdeadline: "2024-03-15T23:59:00",
        type: "workshops"
      }
    ],
    bazaars: [
      {
        id: 1,
        name: "Spring Bazaar",
        location: "Student Union Courtyard",
        startdateandtime: "2024-03-25T09:00:00",
        enddateandtime: "2024-03-25T17:00:00",
        shortdescription: "Annual spring festival with food and crafts",
        registrationdeadline: "2024-03-20T23:59:00",
        type: "bazaars"
      },
      {
        id: 2,
        name: "Artisan Market",
        location: "Main Quad",
        startdateandtime: "2024-04-05T10:00:00",
        enddateandtime: "2024-04-05T16:00:00",
        shortdescription: "Local artisans showcasing their work",
        registrationdeadline: "2024-03-30T23:59:00",
        type: "bazaars"
      }
    ],
    trips: [
      {
        id: 1,
        name: "Mountain Hiking Trip",
        price: "$25",
        location: "Blue Ridge Mountains",
        startdateandtime: "2024-03-30T07:00:00",
        enddateandtime: "2024-03-30T19:00:00",
        shortdescription: "Day trip to explore scenic mountain trails",
        registrationdeadline: "2024-03-25T23:59:00",
        type: "trips"
      },
      {
        id: 2,
        name: "Museum Tour",
        price: "$15",
        location: "City Art Museum",
        startdateandtime: "2024-04-12T09:00:00",
        enddateandtime: "2024-04-12T15:00:00",
        shortdescription: "Guided tour of the city's premier art museum",
        registrationdeadline: "2024-04-07T23:59:00",
        type: "trips"
      }
    ],
    conferences: [
      {
        id: 1,
        name: "Tech Innovation Summit 2024",
        startdateandtime: "2024-04-18T09:00:00",
        enddateandtime: "2024-04-19T17:00:00",
        shortdescription: "Exploring the future of technology and innovation",
        fullagenda: "Keynotes, panels, workshops, and networking sessions",
        conferencewebsitelink: "https://example.com/tech-summit",
        type: "conferences"
      },
      {
        id: 2,
        name: "Sustainability Conference",
        startdateandtime: "2024-05-05T10:00:00",
        enddateandtime: "2024-05-05T16:00:00",
        shortdescription: "Discussing sustainable practices for the future",
        fullagenda: "Expert talks, case studies, and solution workshops",
        conferencewebsitelink: "https://example.com/sustainability-conf",
        type: "conferences"
      }
    ]
  };

  // Simulate API call
  const fetchEvents = async (category) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (category === "all") {
        // Combine all events
        const allEvents = Object.values(mockEvents).flat();
        setEvents(allEvents);
      } else {
        setEvents(mockEvents[category] || []);
      }
    } catch (err) {
      setError("Failed to fetch events. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(selectedCategory);
  }, [selectedCategory]);

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen w-full overflow-hidden bg-[#D5CFE1] text-[#1F1B3B]">
      <div className="relative flex min-h-screen w-full flex-col items-center">
        
        <main className="relative z-10 flex w-full flex-1 flex-col items-center px-6 py-8">
          <div className="w-full max-w-6xl">
            {/* Header */}
            <div className="mb-12 text-center">
              <h1 className="text-4xl font-bold text-[#736CED] sm:text-5xl mb-4">
                Campus Events
              </h1>
              <p className="text-lg text-[#312A68] max-w-2xl mx-auto">
                Discover amazing events happening across campus. Filter by category to find exactly what you're looking for.
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {eventCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`px-6 py-3 rounded-full font-semibold transition-all ${
                    selectedCategory === cat.id
                      ? "bg-[#736CED] text-white shadow-[0_10px_25px_rgba(115,108,237,0.3)]"
                      : "bg-white/70 text-[#736CED] border border-[#736CED] hover:bg-[#E7E1FF]"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Events Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#736CED]"></div>
                <p className="mt-4 text-[#312A68]">Loading events...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">
                {error}
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#312A68] text-lg">No events found for this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {events.map((event) => (
                  <div
                    key={`${event.type}-${event.id}`}
                    className="bg-white rounded-2xl p-6 shadow-[0_10px_25px_rgba(165,148,249,0.2)] border border-white/50 hover:shadow-[0_15px_35px_rgba(165,148,249,0.3)] transition-all hover:-translate-y-1"
                  >
                    {/* Event Type Badge */}
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#EEE9FF] px-3 py-1 text-xs font-medium text-[#5A4BBA] mb-4">
                      <span className="h-2 w-2 rounded-full bg-[#6DD3CE]" />
                      <span className="capitalize">{event.type}</span>
                    </div>

                    {/* Event Name */}
                    <h3 className="text-xl font-bold text-[#4C3BCF] mb-3">
                      {event.name}
                    </h3>

                    {/* Event Details */}
                    <div className="space-y-2 text-sm text-[#312A68]">
                      {event.location && (
                        <p className="flex items-center gap-2">
                          <span>📍</span>
                          {event.location}
                        </p>
                      )}
                      
                      {event.price && (
                        <p className="flex items-center gap-2">
                          <span>💰</span>
                          Price: {event.price}
                        </p>
                      )}

                      <p className="flex items-center gap-2">
                        <span>🕐</span>
                        {formatDate(event.startdateandtime)}
                      </p>

                      {event.registrationdeadline && (
                        <p className="flex items-center gap-2 text-[#E53E3E]">
                          <span>⏰</span>
                          Register by: {formatDate(event.registrationdeadline)}
                        </p>
                      )}
                    </div>

                    {/* Short Description */}
                    <p className="mt-4 text-[#312A68] text-sm leading-relaxed">
                      {event.shortdescription}
                    </p>

                    {/* Additional Info based on event type */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      {event.type === 'workshops' && event.facultyresponsible && (
                        <p className="text-xs text-[#312A68]/70">
                          Faculty: {event.facultyresponsible}
                        </p>
                      )}
                      
                      {event.type === 'conferences' && event.conferencewebsitelink && (
                        <a
                          href={event.conferencewebsitelink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#736CED] hover:underline"
                        >
                          Conference Website →
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        <footer className="relative z-10 w-full px-6 py-6 text-center text-sm text-[#312A68]/80">
          {new Date().getFullYear()} Zarf Token. All rights reserved.
        </footer>
        
        <div className="pointer-events-none absolute bottom-[-12%] left-1/2 h-64 w-[130%] -translate-x-1/2 rounded-[50%] bg-gradient-to-r from-[#736CED] via-[#A594F9] to-[#6DD3CE] opacity-70 -z-10" />
      </div>
    </div>
  );
};

export default EventsPage;