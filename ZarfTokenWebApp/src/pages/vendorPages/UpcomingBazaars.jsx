import {React, useState, useEffect } from "react";
import api from "../../services/api";
import { Calendar, MapPin, Clock, FileText, X } from "lucide-react";
import { useAuthUser } from "../../context/UserContext";

// Helper functions (formatDateTime, formatDate) remain the same...
const formatDateTime = (dateStr, timeStr) => {
  const date = new Date(dateStr);
  const dateOptions = { year: "numeric", month: "long", day: "numeric" };
  return `${date.toLocaleDateString("en-US", dateOptions)} at ${timeStr}`;
};

const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
    });
};

const initialFormState = {
  attendees: [{ name: "", email: "" }],
  boothSize: "2x2",
};


function SkeletonCard() {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-[#FDFBFF] border border-white/40 shadow-lg animate-pulse">
        <div className="bg-gray-300 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-400 rounded w-1/4"></div>
              <div className="h-6 bg-gray-400 rounded w-3/4"></div>
            </div>
            <div className="h-6 bg-gray-400 rounded-full w-24"></div>
          </div>
        </div>
        <div className="px-6 py-6 space-y-4">
          <div className="h-7 bg-gray-300 rounded w-5/6"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
          <div className="flex items-center justify-between gap-4 pt-2">
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="h-10 bg-gray-300 rounded-full w-32"></div>
          </div>
        </div>
      </div>
    );
}

export default function UpcomingBazars() {
  const [bazaars, setBazaars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBazaar, setSelectedBazaar] = useState(null);
  const [applicationData, setApplicationData] = useState(initialFormState);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { user } = useAuthUser();
  
  

  useEffect(() => {
    const fetchBazaars = async () => {
      setLoading(true);
      setError(null);
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        const response = await api.get("/bazaars/getAllBazaars");
        setBazaars(response.data.bazaar || []);
      } catch (err) {
        console.error("Failed to fetch bazaars:", err);
        setError("Failed to fetch upcoming bazaars. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchBazaars();
  }, []);

  const handleOpenModal = (bazaar) => {
    setSelectedBazaar(bazaar);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBazaar(null);
    setApplicationData(initialFormState);
  };

  const handleAttendeeChange = (index, field, value) => {
    const newAttendees = [...applicationData.attendees];
    newAttendees[index][field] = value;
    setApplicationData({ ...applicationData, attendees: newAttendees });
  };

  const addAttendee = () => {
    if (applicationData.attendees.length < 5) {
      setApplicationData({
        ...applicationData,
        attendees: [...applicationData.attendees, { name: "", email: "" }],
      });
    }
  };

  const removeAttendee = (index) => {
    const newAttendees = applicationData.attendees.filter((_, i) => i !== index);
    setApplicationData({ ...applicationData, attendees: newAttendees });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setApplicationData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    
    const payload = {
        people: applicationData.attendees,
        boothSize: applicationData.boothSize,
        vendorId: user._id,
    };
    
    try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert("You need to be logged in to submit an application. Please log in and try again.");
          return;
        }
        
        const url = `/vendorRequests/bazar/${selectedBazaar._id}`;
        await api.post(url, payload);

        
        setSuccessMessage(`Application for ${selectedBazaar.bazaarname} submitted successfully!`);
        setShowSuccess(true);
        handleCloseModal();
        
        setTimeout(() => {
          setShowSuccess(false);
        }, 4000);
    } catch (err) {
        console.error("Application submission failed:", err);
        console.error("Error details:", err.response?.data || err.message);
        
        const errorMessage = err.response?.data?.message || "There was an error submitting your application. Please try again.";
        alert(`Error: ${errorMessage}`);
    }
  };

  return (
    <div className="min-h-screen w-full overflow-hidden bg-[#D5CFE1] text-[#1F1B3B]">
      <div className="relative flex min-h-screen w-full flex-col items-center">
        <main className="relative z-10 flex w-full flex-1 flex-col items-center px-6 py-8">
          <div className="w-full max-w-6xl">
            {/* Header */}
            <div className="mb-12 text-center">
              <h1 className="text-4xl font-bold text-[#736CED] sm:text-5xl mb-4">
                Bazaar Opportunities
              </h1>
              <p className="text-lg text-[#312A68] max-w-2xl mx-auto">
                Explore upcoming bazaars and find the perfect opportunity for your business.
              </p>
            </div>
            
            {/* Bazaars Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#736CED]"></div>
                <p className="mt-4 text-[#312A68]">Loading bazaars...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">{error}</div>
            ) : bazaars.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-[#736CED]/30 mx-auto mb-4" />
                <p className="text-[#312A68] text-lg">No upcoming bazaars found.</p>
                <p className="text-sm text-[#312A68]/70 mt-2">Please check back later for new opportunities.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {bazaars.map((bazaar) => (
                  <div
                    key={bazaar._id}
                    className="bg-white rounded-2xl p-6 shadow-[0_10px_25px_rgba(165,148,249,0.2)] border border-white/50 hover:shadow-[0_15px_35px_rgba(165,148,249,0.3)] transition-all hover:-translate-y-1"
                  >
                    {/* Bazaar Type Badge */}
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#EEE9FF] px-3 py-1 text-xs font-medium text-[#5A4BBA] mb-4">
                      <span className="h-2 w-2 rounded-full bg-[#6DD3CE]" />
                      <span>Bazaar</span>
                    </div>

                    {/* Bazaar Name */}
                    <h3 className="text-xl font-bold text-[#4C3BCF] mb-3">
                      {bazaar.bazaarname}
                    </h3>

                    {/* Bazaar Details */}
                    <div className="space-y-2 text-sm text-[#312A68]">
                      <p className="flex items-center gap-2">
                        <MapPin size={14} className="text-[#736CED]" />
                        {bazaar.location}
                      </p>

                      <p className="flex items-center gap-2">
                        <Calendar size={14} className="text-[#736CED]" />
                        {formatDateTime(bazaar.startdate, bazaar.starttime)}
                      </p>

                      <p className="flex items-center gap-2">
                        <Calendar size={14} className="text-[#736CED]" />
                        Ends: {formatDateTime(bazaar.enddate, bazaar.endtime)}
                      </p>

                      <p className="flex items-center gap-2 text-[#E53E3E]">
                        <Clock size={14} />
                        Apply by: {formatDate(bazaar.registerdeadline)}
                      </p>
                    </div>

                    {/* Short Description */}
                    <p className="mt-4 text-[#312A68] text-sm leading-relaxed">
                      {bazaar.shortdescription}
                    </p>

                    {/* Apply Button */}
                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={() => handleOpenModal(bazaar)}
                        className="w-full px-4 py-2 bg-[#736CED] text-white rounded-lg font-semibold hover:bg-[#5A4BBA] transition-all hover:shadow-[0_8px_20px_rgba(115,108,237,0.3)]"
                      >
                        Apply for Booth
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Application Modal */}
      {isModalOpen && selectedBazaar && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[0_25px_50px_rgba(115,108,237,0.3)]">
            <form onSubmit={handleSubmitApplication} className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#4C3BCF]">
                    Apply to {selectedBazaar.bazaarname}
                  </h2>
                  <p className="text-sm text-[#312A68] mt-1">Fill in your booth details below.</p>
                </div>
                <button type="button" onClick={handleCloseModal} className="text-gray-400 hover:text-[#736CED] text-2xl transition-colors"><X size={24} /></button>
              </div>

              <div className="mb-6">
                <label htmlFor="boothSize" className="block text-sm font-medium text-[#4C3BCF] mb-2">
                  Booth Size
                </label>
                <select id="boothSize" name="boothSize" value={applicationData.boothSize} onChange={handleFormChange} className="w-full rounded-lg border-2 border-gray-200 shadow-sm focus:border-[#736CED] focus:ring-[#736CED] text-[#312A68]">
                  <option value="2x2">2x2</option>
                  <option value="4x4">4x4</option>
                </select>
              </div>
              
              <div className="mb-6">
                 <label className="block text-sm font-medium text-[#4C3BCF] mb-2">
                  Attendees (Max 5)
                </label>
                <div className="space-y-4">
                  {applicationData.attendees.map((attendee, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <input type="text" placeholder={`Attendee ${index + 1} Name`} value={attendee.name} onChange={(e) => handleAttendeeChange(index, "name", e.target.value)} className="flex-1 rounded-lg border-2 border-gray-200 shadow-sm focus:border-[#736CED] focus:ring-[#736CED] text-[#312A68]" required />
                      <input type="email" placeholder={`Attendee ${index + 1} Email`} value={attendee.email} onChange={(e) => handleAttendeeChange(index, "email", e.target.value)} className="flex-1 rounded-lg border-2 border-gray-200 shadow-sm focus:border-[#736CED] focus:ring-[#736CED] text-[#312A68]" required />
                      {applicationData.attendees.length > 1 && (
                         <button type="button" onClick={() => removeAttendee(index)} className="text-red-500 hover:text-red-700 font-bold p-1 rounded-full transition-colors"><X size={18}/></button>
                      )}
                    </div>
                  ))}
                </div>
                {applicationData.attendees.length < 5 && (
                  <button type="button" onClick={addAttendee} className="mt-4 text-sm font-semibold text-[#736CED] hover:text-[#5A4BBA] transition-colors">
                    + Add Attendee
                  </button>
                )}
              </div>

              <div className="mt-8 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="bg-gray-200 text-[#312A68] font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#736CED] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#5A4BBA] transition-all hover:shadow-[0_8px_20px_rgba(115,108,237,0.3)]"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white rounded-2xl p-8 shadow-[0_25px_50px_rgba(115,108,237,0.4)] border border-[#D5CFE1] max-w-md mx-4 pointer-events-auto animate-fade-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#736CED] to-[#4C3BCF] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-bold text-[#4C3BCF] text-xl mb-2">Submission Successful!</h3>
              <p className="text-[#312A68] mb-4 leading-relaxed">{successMessage}</p>
              <p className="text-[#736CED] text-sm">This message will close automatically in a few seconds.</p>
              <button 
                onClick={() => setShowSuccess(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-[#736CED] transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}