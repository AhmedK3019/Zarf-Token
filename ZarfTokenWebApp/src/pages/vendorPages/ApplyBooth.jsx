import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { X } from "lucide-react";
import { useAuthUser } from "../../context/UserContext";
import InteractiveMap from "./InteractiveMap"; // Corrected import path for InteractiveMap

const boothLocations = [
  {
    id: "North West Platform Entrance",
    label: "North West Platform",
    x: 17,
    y: 40,
    width: 8,
    height: 8,
  },
  {
    id: "West Platform Entrance",
    label: "West Platform Entrance",
    x: 17,
    y: 57,
    width: 8,
    height: 8,
  },
  {
    id: "West Platform Alley",
    label: "West Entrance Alley",
    x: 17,
    y: 65,
    width: 8,
    height: 8,
  },
  {
    id: "East Platform Alley",
    label: "East PLatform Alley",
    x: 85,
    y: 62,
    width: 8,
    height: 8,
  },
];

// Set the initial form state, defaulting to the first available location.
const initialFormState = {
  boothname: "",
  attendees: [{ name: "", email: "", idDocument: null }],
  boothSize: "2x2",
  duration: 1,
  location: boothLocations[0].id,
  startdate: "",
};

export default function ApplyBooth() {
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const { user } = useAuthUser();

  const minDate = new Date().toISOString().split("T")[0];

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationSelect = (locationId) => {
    setFormData((prev) => ({ ...prev, location: locationId }));
  };

  const handleAttendeeChange = (index, field, value) => {
    const newAttendees = formData.attendees.map((attendee, i) => {
      if (i === index) {
        return { ...attendee, [field]: value };
      }
      return attendee;
    });
    setFormData({ ...formData, attendees: newAttendees });
  };

  const handleIdDocumentChange = (index, file) => {
    const newAttendees = formData.attendees.map((attendee, i) => {
      if (i === index) {
        return { ...attendee, idDocument: file };
      }
      return attendee;
    });
    setFormData({ ...formData, attendees: newAttendees });
  };

  const addAttendee = () => {
    if (formData.attendees.length < 5) {
      setFormData({
        ...formData,
        attendees: [
          ...formData.attendees,
          { name: "", email: "", idDocument: null },
        ],
      });
    }
  };

  const removeAttendee = (index) => {
    const newAttendees = formData.attendees.filter((_, i) => i !== index);
    setFormData({ ...formData, attendees: newAttendees });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validate that all attendees have ID documents uploaded
    const missingIds = formData.attendees.filter(
      (attendee) => !attendee.idDocument
    );
    if (missingIds.length > 0) {
      setError(
        `Please upload ID documents for all attendees. ${missingIds.length} attendee(s) missing ID documents.`
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError(
          "You need to be logged in to submit an application. Please log in and try again."
        );
        setIsSubmitting(false);
        return;
      }

      // Upload ID documents for each attendee
      const attendeesWithUploadedIds = await Promise.all(
        formData.attendees.map(async (attendee) => {
          if (attendee.idDocument) {
            const idFormData = new FormData();
            idFormData.append("file", attendee.idDocument);

            const uploadResponse = await api.post("/uploads", idFormData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            });

            return {
              name: attendee.name,
              email: attendee.email,
              DocumentId: uploadResponse.data._id, // Reference to uploaded file
            };
          }
          return attendee;
        })
      );
      let start = new Date(formData.startdate);
      let enddate = new Date(start); // clone

      enddate.setDate(start.getDate() + formData.duration * 7);

      const payload = {
        boothname: formData.boothname,
        people: attendeesWithUploadedIds,
        boothSize: formData.boothSize,
        duration: formData.duration,
        location: formData.location,
        vendorId: user._id,
        startdate: formData.startdate,
        enddate: enddate,
      };

      const response = await api.post(`/vendorRequests/platform`, payload);

      setSuccessMessage(`Platform booth application submitted successfully!`);
      setShowSuccess(true);
      setFormData(initialFormState);
      setTimeout(() => {
        setShowSuccess(false);
      }, 4000);
    } catch (err) {
      console.error("Application submission failed:", err);
      const errorMessage =
        err.response?.data?.message ||
        "There was an error submitting your application. Please try again.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full overflow-hidden bg-muted text-[#1F1B3B]">
      <div className="relative flex min-h-screen w-full flex-col items-center">
        <main className="relative z-10 flex w-full flex-1 flex-col items-center px-6 py-8">
          <div className="w-full max-w-4xl">
            {/* Form Container */}
            <div className="bg-white rounded-2xl p-8 shadow-[0_25px_50px_rgba(115,108,237,0.3)] border border-white/50">
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Interactive Map */}
                    <div className="md:col-span-1">
                      <InteractiveMap
                        locations={boothLocations}
                        selectedLocation={formData.location}
                        onLocationSelect={handleLocationSelect}
                      />
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-6 md:col-span-1 mt-23">
                      <div>
                        <label
                          htmlFor="boothname"
                          className="block text-sm font-medium text-[#4C3BCF] mb-2"
                        >
                          Booth Name *
                        </label>
                        <input
                          type="text"
                          id="boothname"
                          name="boothname"
                          value={formData.boothname}
                          onChange={handleFormChange}
                          placeholder="e.g., Tech Solutions, Food Corner"
                          required
                          className="w-full rounded-lg border-2 border-gray-200 shadow-sm focus:border-[#736CED] focus:ring-[#736CED] text-[#312A68] px-4 py-3"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="duration"
                          className="block text-sm font-medium text-[#4C3BCF] mb-2"
                        >
                          Duration (in weeks)
                        </label>
                        <select
                          id="duration"
                          name="duration"
                          value={formData.duration}
                          onChange={handleFormChange}
                          className="w-full rounded-lg border-2 border-gray-200 shadow-sm focus:border-[#736CED] focus:ring-[#736CED] text-[#312A68]"
                        >
                          <option value="1">1 Week</option>
                          <option value="2">2 Weeks</option>
                          <option value="3">3 Weeks</option>
                          <option value="4">4 Weeks</option>
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="startdate"
                          className="block text-sm font-medium text-[#4C3BCF] mb-1"
                        >
                          Start date
                        </label>
                        <input
                          type="date"
                          id="startdate"
                          name="startdate"
                          value={formData.startdate}
                          onChange={handleFormChange}
                          min={minDate}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#736CED]"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="boothSize"
                          className="block text-sm font-medium text-[#4C3BCF] mb-2"
                        >
                          Booth Size
                        </label>
                        <select
                          id="boothSize"
                          name="boothSize"
                          value={formData.boothSize}
                          onChange={handleFormChange}
                          className="w-full rounded-lg border-2 border-gray-200 shadow-sm focus:border-[#736CED] focus:ring-[#736CED] text-[#312A68]"
                        >
                          <option value="2x2">2x2</option>
                          <option value="4x4">4x4</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#4C3BCF] mb-2">
                      Attendees (Max 5)
                    </label>
                    <div className="space-y-4">
                      {formData.attendees.map((attendee, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center gap-4">
                            <input
                              type="text"
                              placeholder={`Attendee ${index + 1} Name`}
                              value={attendee.name}
                              onChange={(e) =>
                                handleAttendeeChange(
                                  index,
                                  "name",
                                  e.target.value
                                )
                              }
                              className="flex-1 rounded-lg border-2 border-gray-200 shadow-sm focus:border-[#736CED] focus:ring-[#736CED] text-[#312A68]"
                              required
                            />
                            <input
                              type="email"
                              placeholder={`Attendee ${index + 1} Email`}
                              value={attendee.email}
                              onChange={(e) =>
                                handleAttendeeChange(
                                  index,
                                  "email",
                                  e.target.value
                                )
                              }
                              className="flex-1 rounded-lg border-2 border-gray-200 shadow-sm focus:border-[#736CED] focus:ring-[#736CED] text-[#312A68]"
                              required
                            />
                            {formData.attendees.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeAttendee(index)}
                                className="text-red-500 hover:text-red-700 font-bold p-1 rounded-full transition-colors"
                              >
                                <X size={18} />
                              </button>
                            )}
                          </div>
                          <div>
                            <div className="relative">
                              <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={(e) =>
                                  handleIdDocumentChange(
                                    index,
                                    e.target.files[0]
                                  )
                                }
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                required
                                id={`id-upload-${index}`}
                              />
                              <label
                                htmlFor={`id-upload-${index}`}
                                className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-[#EEE9FF] to-[#F8F6FF] border-2 border-dashed border-[#736CED]/30 hover:border-[#736CED]/50 rounded-lg cursor-pointer transition-all hover:shadow-md group"
                              >
                                <div className="flex items-center justify-center w-8 h-8 bg-[#736CED]/10 rounded-full group-hover:bg-[#736CED]/20 transition-colors">
                                  <svg
                                    className="w-4 h-4 text-[#736CED]"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                    />
                                  </svg>
                                </div>
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-[#4C3BCF]">
                                    {attendee.idDocument
                                      ? "Change ID Document"
                                      : "Upload ID Document"}
                                  </div>
                                  <div className="text-xs text-[#312A68]/70">
                                    PNG, JPG, PDF • Max 10MB
                                  </div>
                                </div>
                                {attendee.idDocument && (
                                  <div className="flex items-center gap-1 text-green-600">
                                    <svg
                                      className="w-4 h-4"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    <span className="text-xs font-medium">
                                      Uploaded
                                    </span>
                                  </div>
                                )}
                              </label>
                            </div>
                            {attendee.idDocument && (
                              <div className="mt-2 text-xs text-green-600 font-medium flex items-center gap-1">
                                <svg
                                  className="w-3 h-3"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                {attendee.idDocument.name}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {formData.attendees.length < 5 && (
                      <button
                        type="button"
                        onClick={addAttendee}
                        className="mt-4 text-sm font-semibold text-[#736CED] hover:text-[#5A4BBA] transition-colors"
                      >
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

      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white rounded-2xl p-8 shadow-[0_25px_50px_rgba(115,108,237,0.4)] border border-muted max-w-md mx-4 pointer-events-auto animate-fade-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#736CED] to-[#4C3BCF] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-[#4C3BCF] text-xl mb-2">
                Submission Successful!
              </h3>
              <p className="text-[#312A68] mb-4 leading-relaxed">
                {successMessage}
              </p>
              <p className="text-[#736CED] text-sm">
                This message will close automatically in a few seconds.
              </p>
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
