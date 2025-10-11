import React, { useState } from "react";
import { Clock, MapPin, Calendar, Users, X, Building, Info, Globe } from "lucide-react";

// --- MOCK DATA ---
// This would typically be passed in as a prop, but is included here for standalone functionality.
const MOCK_DATA = [
  {
    id: "bth_001",
    boothName: "Cairo Crafts Collective",
    boothNumber: "C15",
    boothSize: "4x4",
    boothMapLocation: "Artisan's Alley, Section C",
    status: "Accepted",
    applicationDate: "2025-09-20T11:00:00.000Z",
    assignedStaff: [
      { name: "Yara Mahmoud", email: "yara.m@example.com" },
      { name: "Karim Adel", email: "karim.a@example.com" },
    ],
    duration: null, // Bazaar booths don't have a separate duration
    bazaar: {
      id: "bzr_winter25",
      name: "Nile Winter Festival",
      startDate: "2025-12-12T00:00:00.000Z",
      startTime: "12:00",
      endDate: "2025-12-14T00:00:00.000Z",
      endTime: "22:00",
      location: "GUC Campus, Main Plaza, New Cairo",
      description: "A festive celebration at the GUC campus featuring local artisans, food, and live entertainment."
    }
  },
  {
    id: "bth_002",
    boothName: "Modern Home Goods",
    boothNumber: "A7",
    boothSize: "2x2",
    boothMapLocation: "Main Pavilion, near entrance",
    status: "Accepted",
    applicationDate: "2025-10-05T18:30:00.000Z",
    assignedStaff: [
      { name: "Fatima Al-Sayed", email: "fatima.as@example.com" },
    ],
    duration: null,
    bazaar: {
      id: "bzr_spring26",
      name: "Zamalek Spring Market",
      startDate: "2026-03-20T00:00:00.000Z",
      startTime: "10:00",
      endDate: "2026-03-22T00:00:00.000Z",
      endTime: "21:00",
      location: "GUC Campus, Green Court, New Cairo",
      description: "Discover unique designs, fashion, and decor from Egypt's top creators right here on campus."
    }
  },
  {
    id: "bth_003",
    boothName: "The Digital Souk",
    boothNumber: "P-101",
    boothSize: "4x4",
    boothMapLocation: "Central Area",
    status: "Active",
    applicationDate: "2025-10-01T10:00:00.000Z",
    assignedStaff: [
       { name: "Ali Hassan", email: "ali.h@example.com" },
    ],
    duration: 4, // Duration in weeks
    bazaar: null, // This is the key differentiator for a platform booth
  },
  {
    id: "bth_004",
    boothName: "Gourmet Corner",
    boothNumber: "P-205",
    boothSize: "2x2",
    boothMapLocation: "Near Food Stalls",
    status: "Active",
    applicationDate: "2025-09-15T14:00:00.000Z",
    assignedStaff: [
       { name: "Layla Mansour", email: "layla.m@example.com" },
    ],
    duration: 2, // Duration in weeks
    bazaar: null,
  }
];


// --- UTILITY FUNCTIONS ---
function formatDate(dateStr) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch (e) {
    return dateStr;
  }
}

function formatDateTime(dateStr, timeStr) {
    try {
        const d = new Date(dateStr);
        if (timeStr) {
            const [hours, minutes] = timeStr.split(':');
            d.setHours(parseInt(hours, 10), parseInt(minutes, 10));
        }
        return d.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        });
    } catch(e) {
        return `${formatDate(dateStr)} ${timeStr || ''}`;
    }
}

// --- MODAL COMPONENT (Handles both Bazaar and Platform Booths) ---
function DetailsModal({ booth, onClose, getPlatformBoothEndDate }) {
  if (!booth) return null;

  // Render for Bazaar Booths
  if (booth.bazaar) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl m-4 max-h-[90vh] overflow-y-auto transform animate-slide-up">
          <div className="sticky top-0 bg-white/80 backdrop-blur-lg border-b border-gray-200 p-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-[#4C3BCF]">{booth.bazaar.name}</h2>
              <p className="text-sm text-[#312A68] flex items-center gap-2 mt-1">
                <MapPin size={14} /> {booth.bazaar.location}
              </p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors" aria-label="Close modal">
              <X size={24} />
            </button>
          </div>
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-[#1F1B3B] border-b pb-2">Your Booth Details</h3>
              <div className="space-y-4 text-sm text-[#312A68]">
                <div className="flex items-start gap-3"><Building size={16} className="mt-1 text-[#736CED] flex-shrink-0" /><div><span className="font-semibold">Booth Name:</span> {booth.boothName}</div></div>
                <div className="flex items-start gap-3"><Info size={16} className="mt-1 text-[#736CED] flex-shrink-0" /><div><span className="font-semibold">Number & Size:</span> Booth {booth.boothNumber} ({booth.boothSize})</div></div>
                <div className="flex items-start gap-3"><MapPin size={16} className="mt-1 text-[#736CED] flex-shrink-0" /><div><span className="font-semibold">Location in Bazaar:</span> {booth.boothMapLocation}</div></div>
              </div>
            </div>
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-[#1F1B3B] border-b pb-2">Event Information</h3>
              <div className="space-y-4 text-sm text-[#312A68]">
                <div className="flex items-start gap-3"><Calendar size={16} className="mt-1 text-[#736CED] flex-shrink-0" /><div><span className="font-semibold">Starts:</span> {formatDateTime(booth.bazaar.startDate, booth.bazaar.startTime)}</div></div>
                <div className="flex items-start gap-3"><Clock size={16} className="mt-1 text-[#736CED] flex-shrink-0" /><div><span className="font-semibold">Ends:</span> {formatDateTime(booth.bazaar.endDate, booth.bazaar.endTime)}</div></div>
              </div>
            </div>
          </div>
          <div className="p-6 md:px-8">
            <h3 className="text-lg font-semibold text-[#1F1B3B] border-b pb-2">Assigned Staff</h3>
            <div className="mt-3 space-y-2 text-sm text-[#312A68]">
              {booth.assignedStaff.map(staff => (<div key={staff.email} className="flex items-center gap-3 p-2 rounded-md bg-gray-50"><Users size={16} className="text-[#736CED] flex-shrink-0" /><div><span className="font-semibold">{staff.name}</span> ({staff.email})</div></div>))}
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50 border-t text-xs text-gray-500 text-center">Application Submitted: {formatDate(booth.applicationDate)}</div>
        </div>
      </div>
    );
  }

  // Render for Platform Booths
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl m-4 max-h-[90vh] overflow-y-auto transform animate-slide-up">
        <div className="sticky top-0 bg-white/80 backdrop-blur-lg border-b border-gray-200 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-[#4C3BCF]">{booth.boothName}</h2>
            <p className="text-sm text-[#312A68] flex items-center gap-2 mt-1">
              <Globe size={14} /> Platform Storefront
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors" aria-label="Close modal">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-[#1F1B3B] border-b pb-2">Storefront Details</h3>
            <div className="space-y-4 text-sm text-[#312A68]">
              <div className="flex items-start gap-3"><Info size={16} className="mt-1 text-[#736CED] flex-shrink-0" /><div><span className="font-semibold">Size:</span> {booth.boothSize}</div></div>
              <div className="flex items-start gap-3"><MapPin size={16} className="mt-1 text-[#736CED] flex-shrink-0" /><div><span className="font-semibold">Platform Location:</span> {booth.boothMapLocation}</div></div>
            </div>
          </div>
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-[#1F1B3B] border-b pb-2">Subscription Details</h3>
            <div className="space-y-4 text-sm text-[#312A68]">
              <div className="flex items-start gap-3"><Calendar size={16} className="mt-1 text-[#736CED] flex-shrink-0" /><div><span className="font-semibold">Duration:</span> {booth.duration} week{booth.duration > 1 ? 's' : ''}</div></div>
              <div className="flex items-start gap-3"><Clock size={16} className="mt-1 text-[#736CED] flex-shrink-0" /><div><span className="font-semibold">Active Until:</span> {getPlatformBoothEndDate(booth.applicationDate, booth.duration)}</div></div>
            </div>
          </div>
        </div>
         <div className="p-6 md:px-8">
            <h3 className="text-lg font-semibold text-[#1F1B3B] border-b pb-2">Assigned Staff</h3>
            <div className="mt-3 space-y-2 text-sm text-[#312A68]">
              {booth.assignedStaff.map(staff => (<div key={staff.email} className="flex items-center gap-3 p-2 rounded-md bg-gray-50"><Users size={16} className="text-[#736CED] flex-shrink-0" /><div><span className="font-semibold">{staff.name}</span> ({staff.email})</div></div>))}
            </div>
          </div>
        <div className="px-6 py-4 bg-gray-50 border-t text-xs text-gray-500 text-center">Application Submitted: {formatDate(booth.applicationDate)}</div>
      </div>
    </div>
  );
}


// --- MAIN COMPONENT ---
export default function AcceptedBooths({ acceptedBooths: acceptedProp = null }) {
  const [items] = useState(() => acceptedProp || MOCK_DATA);
  const [selectedBooth, setSelectedBooth] = useState(null);
  const [view, setView] = useState('bazaar'); // 'bazaar' or 'platform'

  const filteredItems = items.filter(item => {
    if (view === 'bazaar') return !!item.bazaar;
    if (view === 'platform') return !item.bazaar;
    return false;
  });

  const getPlatformBoothEndDate = (startDate, durationWeeks) => {
      const d = new Date(startDate);
      d.setDate(d.getDate() + durationWeeks * 7);
      return formatDate(d.toISOString());
  };

  return (
    <>
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        @keyframes slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.4s ease-out forwards; }
      `}</style>
      <div className="min-h-screen w-full overflow-x-hidden bg-[#D5CFE1] text-[#1F1B3B] font-sans">
        <div className="relative flex min-h-screen w-full flex-col items-center">
          <main className="relative z-10 flex w-full flex-1 flex-col items-center px-4 sm:px-6 py-8">
            <div className="w-full max-w-6xl">
              <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-[#736CED]">My Booths</h1>
                <p className="text-md text-[#312A68] mt-2">Manage your upcoming event booths and permanent platform storefronts.</p>
              </div>

              {/* View Toggle */}
              <div className="mb-6 flex justify-center bg-white/50 p-1 rounded-full w-fit mx-auto shadow-inner">
                <button onClick={() => setView('bazaar')} className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${view === 'bazaar' ? 'bg-[#736CED] text-white shadow' : 'text-[#312A68] hover:bg-white/70'}`}>Bazaar Booths</button>
                <button onClick={() => setView('platform')} className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${view === 'platform' ? 'bg-[#736CED] text-white shadow' : 'text-[#312A68] hover:bg-white/70'}`}>Platform Booths</button>
              </div>

              {filteredItems.length === 0 ? (
                <div className="text-center py-16 bg-white/50 rounded-2xl">
                  <p className="text-lg text-[#312A68]">You have no {view === 'bazaar' ? 'accepted bazaar booths' : 'active platform booths'} yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredItems.map((booth) => (
                    booth.bazaar ? (
                    // BAZAAR BOOTH CARD
                    <div key={booth.id} className="bg-white rounded-2xl p-6 shadow-[0_10px_25px_rgba(165,148,249,0.2)] border border-white/50 hover:shadow-[0_15px_35px_rgba(165,148,249,0.3)] transition-all duration-300 flex flex-col">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-bold text-[#4C3BCF]">{booth.bazaar.name}</h3>
                          <p className="text-sm text-[#312A68] mt-1">{booth.bazaar.description}</p>
                        </div>
                        <div className="text-right flex-shrink-0"><div className="inline-flex items-center gap-2 rounded-full bg-[#EEE9FF] px-3 py-1 text-xs font-medium text-[#5A4BBA]">{booth.status}</div></div>
                      </div>
                      <div className="mt-4 border-t pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-sm text-[#312A68]">
                        <div className="flex items-center gap-2"><MapPin size={14} className="text-[#736CED]" /><span>Booth {booth.boothNumber} • {booth.boothSize}</span></div>
                        <div className="sm:ml-auto flex items-center gap-2 text-[#736CED] font-medium"><Clock size={14} /><span>{formatDate(booth.bazaar.startDate)} - {formatDate(booth.bazaar.endDate)}</span></div>
                      </div>
                      <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button onClick={() => setSelectedBooth(booth)} className="text-sm text-[#736CED] font-semibold hover:text-[#5A4BBA] transition-colors px-4 py-2 rounded-lg hover:bg-gray-100">View Details</button>
                      </div>
                    </div>
                    ) : (
                    // PLATFORM BOOTH CARD
                    <div key={booth.id} className="bg-white rounded-2xl p-6 shadow-[0_10px_25px_rgba(165,148,249,0.2)] border border-white/50 hover:shadow-[0_15px_35px_rgba(165,148,249,0.3)] transition-all duration-300 flex flex-col">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                           <h3 className="text-xl font-bold text-[#4C3BCF]">{booth.boothName}</h3>
                           <p className="text-sm text-[#312A68] mt-1">Your long-term virtual storefront on our platform.</p>
                        </div>
                        <div className="text-right flex-shrink-0"><div className="inline-flex items-center gap-2 rounded-full bg-[#EEE9FF] px-3 py-1 text-xs font-medium text-[#5A4BBA]">{booth.status}</div></div>
                      </div>
                       <div className="mt-4 border-t pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-sm text-[#312A68]">
                        <div className="flex items-center gap-2"><MapPin size={14} className="text-[#736CED]" /><span>{booth.boothSize} • {booth.boothMapLocation}</span></div>
                        <div className="sm:ml-auto flex items-center gap-2 text-[#736CED] font-medium"><Calendar size={14} /><span>Active Until: {getPlatformBoothEndDate(booth.applicationDate, booth.duration)}</span></div>
                      </div>
                      <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button onClick={() => setSelectedBooth(booth)} className="text-sm text-[#736CED] font-semibold hover:text-[#5A4BBA] transition-colors px-4 py-2 rounded-lg hover:bg-gray-100">View Details</button>
                      </div>
                    </div>
                    )
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      {selectedBooth && <DetailsModal booth={selectedBooth} onClose={() => setSelectedBooth(null)} getPlatformBoothEndDate={getPlatformBoothEndDate} />}
    </>
  );
}