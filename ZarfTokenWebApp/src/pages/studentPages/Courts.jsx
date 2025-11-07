import { useState, useEffect } from 'react';
import api from '../../services/api';

const Courts = () => {
  const [courts, setCourts] = useState([]);
  const [filteredCourts, setFilteredCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [showSlotsModal, setShowSlotsModal] = useState(false);

  const courtCategories = [
    { id: "all", name: "All Courts" },
    { id: "basketball", name: "Basketball" },
    { id: "tennis", name: "Tennis" },
    { id: "football", name: "Football" },
    { id: "volleyball", name: "Volleyball" },
    { id: "badminton", name: "Badminton" },
  ];

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    const options = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleDateString('en-US', options); 
  };

  const fetchCourts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/courts');
      setCourts(response.data);
      setFilteredCourts(response.data);
    } catch (err) {
      setError('Failed to fetch courts. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourts();
  }, []);

  // Filter courts by category
  useEffect(() => {
    let filtered = courts;
    
    if (selectedCategory !== "all") {
      filtered = courts.filter(court => 
        court.type?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(court => 
        court.name?.toLowerCase().includes(searchLower) ||
        court.type?.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredCourts(filtered);
  }, [courts, selectedCategory, searchTerm]);

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const getAvailableSlots = (court) => {
    return court.freeSlots?.filter(slot => 
      !slot.isReserved && new Date(slot.dateTime) > new Date()
    ) || [];
  };

  const handleViewAllSlots = (court) => {
    setSelectedCourt(court);
    setShowSlotsModal(true);
  };

  const closeSlotsModal = () => {
    setShowSlotsModal(false);
    setSelectedCourt(null);
  };

  const formatFullDateTime = (isoString) => {
    const date = new Date(isoString);
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <div className="min-h-screen w-full overflow-hidden bg-muted text-[#1F1B3B]">
      <div className="relative flex min-h-screen w-full flex-col items-center">
        <main className="relative z-10 flex w-full flex-1 flex-col items-center px-6 py-8">
          <div className="w-full ">
            {/* Header */}
            <div className="mb-12 text-center">
              <h1 className="text-4xl font-bold text-[#736CED] sm:text-5xl mb-4">
                Campus Courts
              </h1>
              <p className="text-lg text-[#312A68] max-w-2xl mx-auto">
                Discover available court times for your sports activities.
                Filter by court type to find exactly what you're looking for.
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {courtCategories.map((cat) => (
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

            {/* Search Bar */}
            <div className="mb-12">
              <div className="relative max-w-2xl mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by court name or type..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full px-6 py-4 pr-12 rounded-full border border-[#736CED] bg-white/70 text-[#312A68] placeholder-[#312A68]/60 focus:outline-none focus:ring-2 focus:ring-[#736CED] focus:border-transparent shadow-sm"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {searchTerm ? (
                      <button
                        onClick={clearSearch}
                        className="text-[#736CED] hover:text-[#5A4BBA] transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    ) : (
                      <svg
                        className="w-5 h-5 text-[#736CED]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                {searchTerm && (
                  <p className="text-sm text-[#312A68]/70 mt-2 text-center">
                    Found {filteredCourts.length} result
                    {filteredCourts.length !== 1 ? "s" : ""} for "{searchTerm}"
                  </p>
                )}
              </div>
            </div>

            {/* Courts Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#736CED]"></div>
                <p className="mt-4 text-[#312A68]">
                  Loading courts...
                </p>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">{error}</div>
            ) : filteredCourts.length === 0 ? (
              <div className="text-center py-12">
                {searchTerm ? (
                  <div>
                    <p className="text-[#312A68] text-lg mb-4">
                      No courts found matching "{searchTerm}"
                    </p>
                    <button
                      onClick={clearSearch}
                      className="text-[#736CED] hover:text-[#5A4BBA] underline"
                    >
                      Clear search
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="text-[#736CED] text-4xl">🏟️</span>
                    </div>
                    <p className="text-[#312A68] text-lg mb-2">
                      No {selectedCategory === "all" ? "courts" : selectedCategory + " courts"} found.
                    </p>
                    <p className="text-[#312A68]/70">
                      Check back later for available court bookings.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {filteredCourts.map((court) => {
                  const availableSlots = getAvailableSlots(court);
                  return (
                    <div
                      key={court._id}
                      className="bg-white rounded-2xl p-6 shadow-[0_10px_25px_rgba(165,148,249,0.2)] border border-white/50 hover:shadow-[0_15px_35px_rgba(165,148,249,0.3)] transition-all hover:-translate-y-1"
                    >
                      {/* Court Type Badge */}
                      <div className="inline-flex items-center gap-2 rounded-full bg-[#EEE9FF] px-3 py-1 text-xs font-medium text-[#5A4BBA] mb-4">
                        <span className="h-2 w-2 rounded-full bg-[#6DD3CE]" />
                        <span className="capitalize">{court.type || 'Court'}</span>
                      </div>

                      {/* Court Name */}
                      <h3 className="text-xl font-bold text-[#4C3BCF] mb-3">
                        {court.name}
                      </h3>

                      {/* Available Slots Count */}
                      <div className="mb-4">
                        <p className="flex items-center gap-2 text-sm text-[#312A68]">
                          <span>📅</span>
                          {availableSlots.length} available slot{availableSlots.length !== 1 ? 's' : ''}
                        </p>
                      </div>

                      {/* Available Slots */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-[#312A68] mb-3">
                          Upcoming Available Times:
                        </h4>
                        
                        {availableSlots.length > 0 ? (
                          <div className="max-h-48 overflow-y-auto space-y-2">
                            {availableSlots.slice(0, 5).map((slot) => (
                              <div
                                key={slot._id}
                                className="bg-[#F8F6FF] p-3 rounded-lg text-xs text-[#312A68] border border-[#E7E1FF] hover:bg-[#EEE9FF] transition-colors"
                              >
                                <span className="font-medium">
                                  {formatDateTime(slot.dateTime)}
                                </span>
                              </div>
                            ))}
                            {availableSlots.length > 5 && (
                              <p className="text-xs text-[#312A68]/70 text-center pt-2">
                                +{availableSlots.length - 5} more slots available
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <div className="w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-2">
                              <span className="text-[#736CED] text-lg">📅</span>
                            </div>
                            <p className="text-[#312A68]/70 text-xs">
                              No available slots at the moment
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      {availableSlots.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <button 
                            onClick={() => handleViewAllSlots(court)}
                            className="w-full text-xs bg-[#736CED] text-white px-4 py-2 rounded-full hover:bg-[#5A4BBA] transition-colors"
                          >
                            View All Available Times ({availableSlots.length})
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Available Slots Modal */}
      {showSlotsModal && selectedCourt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[#4C3BCF]">
                    {selectedCourt.name}
                  </h2>
                  <div className="inline-flex items-center gap-2 mt-2">
                    <span className="h-2 w-2 rounded-full bg-[#6DD3CE]" />
                    <span className="text-sm text-[#5A4BBA] capitalize font-medium">
                      {selectedCourt.type || 'Court'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={closeSlotsModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 min-h-0">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-[#312A68] mb-4">
                  All Available Time Slots
                </h3>
                <p className="text-sm text-[#312A68]/70 mb-6">
                  {getAvailableSlots(selectedCourt).length} available slots
                </p>
              </div>

              {getAvailableSlots(selectedCourt).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {getAvailableSlots(selectedCourt).map((slot) => (
                    <div
                      key={slot._id}
                      className="bg-[#F8F6FF] p-4 rounded-xl border border-[#E7E1FF] hover:bg-[#EEE9FF] hover:border-[#736CED] transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-[#6DD3CE] rounded-full flex-shrink-0"></div>
                        <div>
                          <p className="font-medium text-[#312A68] group-hover:text-[#4C3BCF]">
                            {formatFullDateTime(slot.dateTime)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-[#736CED] text-2xl">📅</span>
                  </div>
                  <p className="text-[#312A68] text-lg mb-2">No Available Slots</p>
                  <p className="text-[#312A68]/70 text-sm">
                    All slots are currently reserved or unavailable.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex-shrink-0">
              <div className="flex justify-end gap-3">
                <button
                  onClick={closeSlotsModal}
                  className="px-6 py-2 text-[#736CED] border border-[#736CED] rounded-full hover:bg-[#E7E1FF] transition-colors"
                >
                  Close
                </button>
                <button
                  className="px-6 py-2 bg-[#736CED] text-white rounded-full hover:bg-[#5A4BBA] transition-colors"
                  disabled
                >
                  Book Slot (Coming Soon)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courts;
