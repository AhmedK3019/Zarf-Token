import React from 'react';
import platformMap from '../../assets/platform-view.png';

// This component displays the map and clickable hotspots.
export default function InteractiveMap({ locations, selectedLocation, onLocationSelect }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#4C3BCF] mb-2">
        Select Booth Location *
      </label>
      <div className="relative w-full overflow-hidden rounded-lg border-2 border-gray-200 shadow-sm aspect-square">
        {/* The map image serves as the background. It points to the public folder. */}
        <img src={platformMap} alt="Booth locations map" className="w-full h-full object-cover" />

        {/* We map over the locations and render a clickable hotspot for each one */}
        {locations.map((loc) => {
          const isSelected = loc.id === selectedLocation;
          return (
            <button
              type="button"
              key={loc.id}
              onClick={() => onLocationSelect(loc.id)}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 rounded-md transition-all duration-200 ease-in-out
                 shadow-2xl border-4 border-primary/30
                ${isSelected
                  ? 'bg-primary/90 border-black shadow-2xl scale-110'
                  : 'bg-secondary/70 border-white/90 hover:bg-primary/90 hover:scale-110'
                }
              `}
              style={{
                top: `${loc.y}%`,
                left: `${loc.x}%`,
                width: `${loc.width}%`,
                height: `${loc.height}%`,
              }}
              aria-label={`Select location ${loc.label}`}
              title={loc.label} // Tooltip on hover
            >
              {/* Visual indicator for the hotspot */}
              <span className={`block w-2 h-2 rounded-full mx-auto transition-all ${isSelected ? 'bg-white scale-125' : 'bg-white/70'}`}></span>
            </button>
          );
        })}
      </div>
      <p className="text-sm text-center text-[#312A68] mt-2">
        Selected: <span className="font-semibold text-[#736CED]">{locations.find(l => l.id === selectedLocation)?.label || 'None'}</span>
      </p>
    </div>
  );
}
