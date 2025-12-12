import { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, Save, X } from "lucide-react";
import api from "../../services/api";
import Football from "../../assets/FootBall.jpg";
import Tennis from "../../assets/Tennis.jpg";
import Basketball from "../../assets/Basketball.jpg";

const ManageCourts = () => {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [failedImages, setFailedImages] = useState(new Set());

  const [formData, setFormData] = useState({
    name: "",
    type: "basketball",
    image: null,
  });

  const [editFormData, setEditFormData] = useState({
    name: "",
    type: "",
    image: null,
    removeImage: false,
  });

  useEffect(() => {
    fetchCourts();
  }, []);

  const fetchCourts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/courts");
      setCourts(response.data);
    } catch (err) {
      setError("Failed to fetch courts. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  const handleImageError = (courtId) => {
    setFailedImages((prev) => new Set([...prev, courtId]));
  };

  const handleCreateCourt = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("type", formData.type);
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      const response = await api.post("/courts", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setCourts([...courts, response.data]);
      setFormData({ name: "", type: "basketball", image: null });
      setShowCreateForm(false);
      showToast("Court created successfully!");
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to create court", "error");
      console.error(err);
    }
  };

  const handleDeleteCourt = async (courtId) => {
    if (!window.confirm("Are you sure you want to delete this court? All associated reservations will also be deleted.")) {
      return;
    }
    try {
      await api.delete(`/courts/${courtId}`);
      setCourts(courts.filter((court) => court._id !== courtId));
      showToast("Court deleted successfully!");
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to delete court", "error");
      console.error(err);
    }
  };

  const handleEditClick = (court) => {
    setEditingId(court._id);
    setEditFormData({
      name: court.name,
      type: court.type,
      image: null,
      removeImage: false,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({ name: "", type: "", image: null, removeImage: false });
  };

  const handleUpdateCourt = async (courtId) => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", editFormData.name);
      formDataToSend.append("type", editFormData.type);
      if (editFormData.removeImage) {
        formDataToSend.append("removeImage", "true");
      } else if (editFormData.image) {
        formDataToSend.append("image", editFormData.image);
      }

      const response = await api.put(`/courts/${courtId}`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setCourts(courts.map((court) => (court._id === courtId ? response.data : court)));
      setEditingId(null);
      setEditFormData({ name: "", type: "", image: null, removeImage: false });
      showToast("Court updated successfully!");
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to update court", "error");
      console.error(err);
    }
  };

  const getAvailableSlots = (court) => {
    return (
      court.freeSlots?.filter(
        (slot) => !slot.isReserved && new Date(slot.dateTime) > new Date()
      ) || []
    );
  };

  const getReservedSlots = (court) => {
    return (
      court.freeSlots?.filter(
        (slot) => slot.isReserved && new Date(slot.dateTime) > new Date()
      ) || []
    );
  };

  const getPastSlots = (court) => {
    return (
      court.freeSlots?.filter(
        (slot) => new Date(slot.dateTime) <= new Date()
      ) || []
    );
  };

  const getCourtTypeColor = (type) => {
    const colors = {
      basketball: "#F59E0B",
      tennis: "#10B981",
      football: "#1F1B3B",
    };
    return colors[type?.toLowerCase()] || "#736CED";
  };

  return (
    <div className="min-h-screen w-full bg-muted p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#001845] mb-2">Manage Courts</h1>
            <p className="text-gray-600">Create and manage courts for students to reserve</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#001845] text-white rounded-full hover:bg-[#002855] transition-colors shadow-lg"
          >
            {showCreateForm ? <X size={20} /> : <Plus size={20} />}
            {showCreateForm ? "Cancel" : "Create Court"}
          </button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8 border border-gray-200">
            <h2 className="text-xl font-semibold text-[#001845] mb-4">Create New Court</h2>
            <form onSubmit={handleCreateCourt} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Court Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001845] focus:border-transparent"
                  placeholder="e.g., Court A, Main Basketball Court"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Court Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001845] focus:border-transparent"
                  required
                >
                  <option value="basketball">Basketball</option>
                  <option value="tennis">Tennis</option>
                  <option value="football">Football</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Court Image <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="court-image-upload"
                  />
                  <label
                    htmlFor="court-image-upload"
                    className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#EEE9FF] to-[#F8F6FF] border-2 border-dashed border-[#001845]/30 hover:border-[#001845]/50 rounded-lg cursor-pointer transition-all hover:shadow-md group"
                  >
                    <div className="flex items-center justify-center w-10 h-10 bg-[#001845]/10 rounded-full group-hover:bg-[#001845]/20 transition-colors">
                      <svg
                        className="w-5 h-5 text-[#001845]"
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
                      <div className="text-sm font-medium text-[#001845]">
                        {formData.image ? "Change Image" : "Upload Court Image"}
                      </div>
                      <div className="text-xs text-gray-500">
                        JPG, PNG, WebP • Defaults to type-based image if not uploaded
                      </div>
                    </div>
                    {formData.image && (
                      <div className="flex items-center gap-1 text-green-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-xs font-medium">Selected</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#001845] text-white rounded-lg hover:bg-[#002855] transition-colors"
                >
                  Create Court
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setFormData({ name: "", type: "basketball", image: null });
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Courts List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#001845]"></div>
            <p className="mt-4 text-gray-600">Loading courts...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        ) : courts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus size={40} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Courts Yet</h3>
            <p className="text-gray-500 mb-4">Create your first court to get started</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#001845] text-white rounded-full hover:bg-[#002855] transition-colors"
            >
              <Plus size={20} />
              Create Court
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courts.map((court) => {
              const isEditing = editingId === court._id;
              const availableSlots = getAvailableSlots(court);
              const reservedSlots = getReservedSlots(court);
              const pastSlots = getPastSlots(court);
              const color = getCourtTypeColor(court.type);
              const courtImages = {
                football: Football,
                tennis: Tennis,
                basketball: Basketball,
              };
              const courtTypeLower = court.type?.toLowerCase();
              // Use custom image if available and not failed, otherwise use default type-based image
              const hasCustomImage = court.image && !failedImages.has(court._id);
              const imageSrc = hasCustomImage
                ? `url(http://localhost:3000/uploads/${court.image})`
                : courtImages[courtTypeLower] 
                ? `url(${courtImages[courtTypeLower]})` 
                : "none";

              return (
                <div
                  key={court._id}
                  className="relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
                >
                  {/* Background Image Layer */}
                  <div
                    className="absolute inset-0 z-0 opacity-90 bg-cover bg-center bg-no-repeat pointer-events-none"
                    style={{
                      backgroundImage: imageSrc,
                    }}
                  />
                  <div className="absolute inset-0 z-0 bg-white/60 pointer-events-none" />
                  {/* Hidden img to detect custom image load failures */}
                  {court.image && !failedImages.has(court._id) && (
                    <img
                      src={`http://localhost:3000/uploads/${court.image}`}
                      onError={() => handleImageError(court._id)}
                      style={{ display: 'none' }}
                      alt=""
                    />
                  )}
                  {/* Content Layer */}
                  <div className="relative z-10">
                  {isEditing ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={editFormData.name}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, name: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001845]"
                        placeholder="Court name"
                      />
                      <select
                        value={editFormData.type}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, type: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001845]"
                      >
                        <option value="basketball">Basketball</option>
                        <option value="tennis">Tennis</option>
                        <option value="football">Football</option>
                      </select>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Update Image
                        </label>
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/jpg,image/webp"
                            onChange={(e) => {
                              setEditFormData({ ...editFormData, image: e.target.files[0], removeImage: false });
                            }}
                            disabled={editFormData.removeImage}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                            id={`edit-image-${court._id}`}
                          />
                          <label
                            htmlFor={`edit-image-${court._id}`}
                            className={`flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#EEE9FF] to-[#F8F6FF] border-2 border-dashed border-[#001845]/30 rounded-lg cursor-pointer transition-all group ${
                              editFormData.removeImage ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#001845]/50 hover:shadow-sm'
                            }`}
                          >
                            <div className="flex items-center justify-center w-7 h-7 bg-[#001845]/10 rounded-full group-hover:bg-[#001845]/20 transition-colors">
                              <svg className="w-3.5 h-3.5 text-[#001845]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <div className="text-xs font-medium text-[#001845]">
                                {editFormData.image ? "Change Image" : "Upload New Image"}
                              </div>
                            </div>
                            {editFormData.image && (
                              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </label>
                        </div>
                        {court.image && (
                          <label className="flex items-center gap-2 mt-2 text-xs">
                            <input
                              type="checkbox"
                              checked={editFormData.removeImage}
                              onChange={(e) => {
                                setEditFormData({ ...editFormData, removeImage: e.target.checked, image: null });
                              }}
                              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                            />
                            <span className="text-red-600 font-medium">Remove custom image</span>
                          </label>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateCourt(court._id)}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          title="Save changes"
                        >
                          <Save size={16} />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                          title="Cancel"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-2"
                            style={{
                              backgroundColor: `${color}20`,
                              color: color,
                            }}
                          >
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                            <span className="capitalize">{court.type}</span>
                          </div>
                          <h3 className="text-xl font-bold text-[#001845]">{court.name}</h3>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditClick(court)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit court"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteCourt(court._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete court"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Available (Future):</span>
                          <span className="font-semibold text-green-600">
                            {availableSlots.length}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Reserved (Future):</span>
                          <span className="font-semibold text-orange-600">
                            {reservedSlots.length}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Past/Expired:</span>
                          <span className="font-semibold text-gray-500">
                            {pastSlots.length}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200">
                          <span className="text-gray-600 font-medium">Total Slots:</span>
                          <span className="font-bold text-[#001845]">
                            {court.freeSlots?.length || 0}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          Created: {court.createdAt && !isNaN(new Date(court.createdAt).getTime()) 
                            ? new Date(court.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                            : 'N/A'}
                        </p>
                      </div>
                    </>
                  )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div
            className={`${
              toast.type === "error" ? "bg-red-500" : "bg-green-500"
            } text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]`}
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {toast.type === "error" ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              )}
            </svg>
            <div className="flex-1">
              <p className="text-sm font-semibold">{toast.message}</p>
            </div>
            <button
              onClick={() => setToast({ show: false, message: "", type: "" })}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ManageCourts;
