import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { FileText, X } from "lucide-react";

const initialFormState = {
  attendees: [{ name: "", email: "" }],
  boothSize: "2x2",
  duration: 1,
  location: "Platform Area - Main Entrance",
};

export default function ApplyBooth() {
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  // const { user } = useUserContext(); // REMOVED
  const navigate = useNavigate();

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAttendeeChange = (index, field, value) => {
    const newAttendees = [...formData.attendees];
    newAttendees[index][field] = value;
    setFormData({ ...formData, attendees: newAttendees });
  };

  const addAttendee = () => {
    if (formData.attendees.length < 5) {
      setFormData({
        ...formData,
        attendees: [...formData.attendees, { name: "", email: "" }],
      });
    }
  };

  const removeAttendee = (index) => {
    const newAttendees = formData.attendees.filter((_, i) => i !== index);
    setFormData({ ...formData, attendees: newAttendees });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    alert("Form submission is currently disabled. Please implement user authentication.");
  };

  return (
    <div className="min-h-screen w-full overflow-hidden bg-[#D5CFE1] text-[#1F1B3B]">
      <div className="relative flex min-h-screen w-full flex-col items-center">
        <main className="relative z-10 flex w-full flex-1 flex-col items-center px-6 py-8">
          <div className="w-full max-w-4xl">
            {/* Header */}
            <div className="mb-12 text-center">
              <h1 className="text-4xl font-bold text-[#736CED] sm:text-5xl mb-4">
                Request a Platform Booth
              </h1>
              <p className="text-lg text-[#312A68] max-w-2xl mx-auto">
                Apply for a standalone booth in the main student activity area and showcase your business.
              </p>
            </div>

            {/* Form Container */}
            <div className="bg-white rounded-2xl p-8 shadow-[0_25px_50px_rgba(115,108,237,0.3)] border border-white/50">
        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-[#4C3BCF] mb-2">
                  Location
                </label>
                <select id="location" name="location" value={formData.location} onChange={handleFormChange} className="w-full rounded-lg border-2 border-gray-200 shadow-sm focus:border-[#736CED] focus:ring-[#736CED] text-[#312A68]">
                  <option>Platform Area - Main Entrance</option>
                  <option>Platform Area - Near Food Stalls</option>
                </select>
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-[#4C3BCF] mb-2">
                  Duration (in weeks)
                </label>
                <select id="duration" name="duration" value={formData.duration} onChange={handleFormChange} className="w-full rounded-lg border-2 border-gray-200 shadow-sm focus:border-[#736CED] focus:ring-[#736CED] text-[#312A68]">
                  <option value="1">1 Week</option>
                  <option value="2">2 Weeks</option>
                  <option value="3">3 Weeks</option>
                  <option value="4">4 Weeks</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="boothSize" className="block text-sm font-medium text-[#4C3BCF] mb-2">
                Booth Size
              </label>
              <select id="boothSize" name="boothSize" value={formData.boothSize} onChange={handleFormChange} className="w-full rounded-lg border-2 border-gray-200 shadow-sm focus:border-[#736CED] focus:ring-[#736CED] text-[#312A68]">
                <option value="2x2">2x2</option>
                <option value="4x4">4x4</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4C3BCF] mb-2">
                Attendees (Max 5)
              </label>
              <div className="space-y-4">
                {formData.attendees.map((attendee, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <input type="text" placeholder={`Attendee ${index + 1} Name`} value={attendee.name} onChange={(e) => handleAttendeeChange(index, "name", e.target.value)} className="flex-1 rounded-lg border-2 border-gray-200 shadow-sm focus:border-[#736CED] focus:ring-[#736CED] text-[#312A68]" required />
                    <input type="email" placeholder={`Attendee ${index + 1} Email`} value={attendee.email} onChange={(e) => handleAttendeeChange(index, "email", e.target.value)} className="flex-1 rounded-lg border-2 border-gray-200 shadow-sm focus:border-[#736CED] focus:ring-[#736CED] text-[#312A68]" required />
                    {formData.attendees.length > 1 && (
                       <button type="button" onClick={() => removeAttendee(index)} className="text-red-500 hover:text-red-700 font-bold p-1 rounded-full transition-colors"><X size={18}/></button>
                    )}
                  </div>
                ))}
              </div>
              {formData.attendees.length < 5 && (
                <button type="button" onClick={addAttendee} className="mt-4 text-sm font-semibold text-[#736CED] hover:text-[#5A4BBA] transition-colors">
                  + Add Attendee
                </button>
              )}
            </div>
            
            {error && (
              <div className="p-4 bg-red-100 border-2 border-red-300 rounded-lg">
                <p className="text-red-700 font-semibold flex items-center gap-2">
                  <span className="text-red-500">⚠️</span>
                  {error}
                </p>
              </div>
            )}
            
            <div className="pt-6 border-t border-gray-200 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#736CED] text-white font-semibold py-3 px-8 rounded-lg hover:bg-[#5A4BBA] transition-all hover:shadow-[0_8px_20px_rgba(115,108,237,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}