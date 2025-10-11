import { useState, useEffect } from 'react';
import api from '../../services/api';

const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(213, 207, 225, 0.2);
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, #736CED, #4C3BCF);
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(to bottom, #4C3BCF, #312A68);
  }
`;

  const styleSheet = document.createElement('style');
  styleSheet.innerText = scrollbarStyles;
  document.head.appendChild(styleSheet);

const Courts = () => {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleDateString('en-EG', options); 
  };

  useEffect(() => {
    const fetchCourts = async () => {
      try {
        const response = await api.get('/courts');
        setCourts(response.data);
      } catch (err) {
        setError('Failed to fetch courts. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourts();
  }, []);

  const groupCourtsByType = (courtsList) => {
    return courtsList.reduce((acc, court) => {
      const { type } = court;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(court);
      return acc;
    }, {});
  };

  const groupedCourts = groupCourtsByType(courts);
  const courtTypes = Object.keys(groupedCourts);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-[#D5CFE1] to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#736CED] border-t-transparent mx-auto mb-4"></div>
          <p className="text-[#4C3BCF] font-semibold">Loading courts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#D5CFE1] to-white flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-red-200">
          <p className="text-red-600 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-[#4C3BCF] to-[#736CED] bg-clip-text text-transparent mb-6 pb-2">
            Campus Courts
          </h1>
          <p className="text-[#312A68] text-lg mb-6">Discover available court times for your activities</p>
        </div>
        
        {courtTypes.length > 0 ? (
          <div className="space-y-12">
            {courtTypes.map((type) => (
              <div key={type} className="relative">
                <div className="flex items-center mb-8">
                  <div className="h-1 bg-gradient-to-r from-[#736CED] to-transparent flex-1"></div>
                  <h2 className="text-3xl font-bold text-[#4C3BCF] capitalize mx-6 bg-white px-4 py-2 rounded-full shadow-lg border border-[#D5CFE1]">
                    {type} Courts
                  </h2>
                  <div className="h-1 bg-gradient-to-l from-[#736CED] to-transparent flex-1"></div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                  {groupedCourts[type].map((court) => (
                    <div key={court._id} className="group bg-white rounded-2xl shadow-[0_10px_25px_rgba(165,148,249,0.15)] border border-[#D5CFE1]/30 p-8 hover:shadow-[0_20px_40px_rgba(165,148,249,0.25)] hover:-translate-y-2 transition-all duration-300">
                      <div className="flex items-center mb-6">
                        <div className="w-3 h-3 bg-gradient-to-r from-[#736CED] to-[#4C3BCF] rounded-full mr-3"></div>
                        <h3 className="text-2xl font-bold text-[#4C3BCF] group-hover:text-[#312A68] transition-colors">
                          {court.name}
                        </h3>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="font-semibold text-[#312A68] mb-4 flex items-center">
                          <span className="w-2 h-2 bg-[#736CED] rounded-full mr-2"></span>
                          Upcoming Available Slots:
                        </h4>
                      </div>
                      
                      <div className="max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                        <ul className="space-y-3">
                          {court.freeSlots
                            .filter(slot => !slot.isReserved && new Date(slot.dateTime) > new Date())
                            .map((slot) => (
                              <li key={slot._id} className="bg-gradient-to-r from-[#D5CFE1]/20 to-transparent p-4 rounded-xl text-[#312A68] hover:from-[#736CED] hover:to-[#4C3BCF] hover:text-white transition-all duration-300 cursor-pointer border border-[#D5CFE1]/30 hover:border-[#736CED] hover:shadow-md">
                                <span className="font-medium">{formatDateTime(slot.dateTime)}</span>
                              </li>
                            ))}
                        </ul>
                        {court.freeSlots.filter(slot => !slot.isReserved && new Date(slot.dateTime) > new Date()).length === 0 && (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 bg-[#D5CFE1]/30 rounded-full flex items-center justify-center mx-auto mb-3">
                              <span className="text-[#736CED] text-2xl">📅</span>
                            </div>
                            <p className="text-[#312A68]/70 text-sm">No available slots in the coming month.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-[#D5CFE1]/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-[#736CED] text-4xl">🏟️</span>
            </div>
            <p className="text-[#312A68] text-xl font-medium">No courts have been added yet.</p>
            <p className="text-[#312A68]/70 mt-2">Check back later for available court bookings.</p>
          </div>
        )}
      </div>
    
  );
};

export default Courts;