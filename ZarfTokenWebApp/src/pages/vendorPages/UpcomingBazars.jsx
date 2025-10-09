import {React, useState, useEffect } from "react";
import api from "../../services/api";
import { Calendar, MapPin, Clock, FileText, X } from "lucide-react";

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
    };
    try {
        const url = `/api/vendorRequests/bazar/${selectedBazaar._id}`;
        await api.post(url, payload);
        alert(`Application for ${selectedBazaar.bazaarname} submitted successfully!`);
        handleCloseModal();
    } catch (err) {
        console.error("Application submission failed:", err);
        alert("There was an error submitting your application. Please try again.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-muted px-6 py-10">
      <div className="mx-auto w-full max-w-7xl">
        <header className="text-center space-y-3 mb-12 animate-fade-in">
          <h1 className="text-5xl sm:text-6xl font-black leading-tight text-primary">
            Bazaar Opportunities
          </h1>
          <div className="h-1 w-32 mx-auto rounded-full bg-gradient-to-r from-primary to-secondary animate-pulse"></div>
          <p className="text-base text-gray-600 max-w-2xl mx-auto leading-relaxed pt-2">
            Explore upcoming bazaars and find the perfect opportunity for your business.
          </p>
        </header>
        
        <section className="grid gap-6 lg:grid-cols-2">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : error ? (
            <div className="col-span-full text-center bg-accent/10 border border-accent/20 text-accent p-6 rounded-2xl">
              {error}
            </div>
          ) : bazaars.length > 0 ? (
            bazaars.map((bazaar) => (
              <article
                key={bazaar._id}
                className="relative overflow-hidden rounded-2xl bg-[#FDFBFF] border border-white/40 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl animate-fade-in border-l-4 border-primary"
                style={{ animationDelay: `${Math.random() * 200}ms` }}
              >
                <div className="relative bg-gradient-to-r from-primary via-primary/90 to-secondary px-6 py-5 text-white">
                  <div className="relative flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-wider text-black/70 font-semibold flex items-center gap-1.5"><MapPin size={14} /> Location</p>
                      <h3 className="text-lg text-black font-bold mt-1">{bazaar.location}</h3>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide bg-white/20 text-black border border-white/30 shadow-sm">
                        <Clock size={12} /> Apply by {formatDate(bazaar.registerdeadline)}
                    </span>
                  </div>
                </div>
                <div className="px-6 py-6 space-y-4">
                    <h4 className="text-xl font-bold text-primary flex-1 leading-tight">{bazaar.bazaarname}</h4>
                    <p className="text-sm leading-relaxed text-gray-700 line-clamp-2">{bazaar.shortdescription}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 pt-2">
                        <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-primary"/> <strong>Starts:</strong> {formatDateTime(bazaar.startdate, bazaar.starttime)}
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-primary"/> <strong>Ends:</strong> {formatDateTime(bazaar.enddate, bazaar.endtime)}
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 pt-4 border-t border-gray-200/80">
                         <button
                            type="button"
                            onClick={() => handleOpenModal(bazaar)}
                            className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-base font-semibold transition-all duration-200 bg-white text-primary border-2 border-primary/40 shadow-sm hover:-translate-y-0.5 hover:bg-primary/10"
                        >
                            Apply for Booth
                        </button>
                    </div>
                </div>
              </article>
            ))
          ) : (
             <div className="col-span-full rounded-3xl border-2 border-dashed border-primary/30 bg-[#FDFBFF] px-8 py-16 text-center">
              <div className="flex flex-col items-center gap-3">
                <FileText className="w-16 h-16 text-primary/30" />
                <p className="text-lg font-semibold text-primary/70">No Upcoming Bazaars Found</p>
                <p className="text-sm text-gray-500">Please check back later for new opportunities.</p>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Application Modal */}
      {isModalOpen && selectedBazaar && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmitApplication} className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-primary">
                    Apply to {selectedBazaar.bazaarname}
                  </h2>
                  <p className="text-sm text-primary/70 mt-1">Fill in your booth details below.</p>
                </div>
                <button type="button" onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 text-2xl"><X size={24} /></button>
              </div>

              <div className="mb-6">
                <label htmlFor="boothSize" className="block text-sm font-medium text-primary mb-2">
                  Booth Size
                </label>
                <select id="boothSize" name="boothSize" value={applicationData.boothSize} onChange={handleFormChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary">
                  <option value="2x2">2x2</option>
                  <option value="4x4">4x4</option>
                </select>
              </div>
              
              <div className="mb-6">
                 <label className="block text-sm font-medium text-primary mb-2">
                  Attendees (Max 5)
                </label>
                <div className="space-y-4">
                  {applicationData.attendees.map((attendee, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <input type="text" placeholder={`Attendee ${index + 1} Name`} value={attendee.name} onChange={(e) => handleAttendeeChange(index, "name", e.target.value)} className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" required />
                      <input type="email" placeholder={`Attendee ${index + 1} Email`} value={attendee.email} onChange={(e) => handleAttendeeChange(index, "email", e.target.value)} className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" required />
                      {applicationData.attendees.length > 1 && (
                         <button type="button" onClick={() => removeAttendee(index)} className="text-red-500 hover:text-red-700 font-bold p-1 rounded-full"><X size={18}/></button>
                      )}
                    </div>
                  ))}
                </div>
                {applicationData.attendees.length < 5 && (
                  <button type="button" onClick={addAttendee} className="mt-4 text-sm font-semibold text-primary hover:text-secondary">
                    + Add Attendee
                  </button>
                )}
              </div>

              <div className="mt-8 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-full hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-full hover:bg-gray-300"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}