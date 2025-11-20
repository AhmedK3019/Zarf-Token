import React from "react";

// Simplified Beach Ball with 2-color scheme
const BeachBall = ({ size = 50, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="50" cy="50" r="40" fill="#4ECDC4" stroke="#333" strokeWidth="2" />
    <path d="M 50 10 L 50 90" stroke="#333" strokeWidth="2" strokeLinecap="round" />
    <path d="M 10 50 L 90 50" stroke="#333" strokeWidth="2" strokeLinecap="round" />
    <path d="M 22 22 L 78 78" stroke="#333" strokeWidth="2" strokeLinecap="round" />
    <path d="M 78 22 L 22 78" stroke="#333" strokeWidth="2" strokeLinecap="round" />
    <circle cx="50" cy="50" r="6" fill="#333" />
  </svg>
);

// Simplified Sunglasses
const Sunglasses = ({ size = 50, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="15" y="35" width="30" height="18" rx="9" fill="#333" />
    <rect x="55" y="35" width="30" height="18" rx="9" fill="#333" />
    <rect x="17" y="37" width="26" height="14" rx="7" fill="#1a1a1a" />
    <rect x="57" y="37" width="26" height="14" rx="7" fill="#1a1a1a" />
    <path d="M 45 42 L 55 42" stroke="#333" strokeWidth="3" strokeLinecap="round" />
    <rect x="22" y="40" width="6" height="6" rx="1" fill="#666" />
    <rect x="62" y="40" width="6" height="6" rx="1" fill="#666" />
  </svg>
);

// Simplified Palm Tree
const PalmTree = ({ size = 50, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M 50 35 Q 48 50 46 65 Q 45 75 48 85" stroke="#8B4513" strokeWidth="4" strokeLinecap="round" />
    {[
      "M 50 35 Q 30 25 20 30",
      "M 50 35 Q 70 25 80 30", 
      "M 50 35 Q 35 30 25 35",
      "M 50 35 Q 65 30 75 35",
      "M 50 35 Q 40 35 30 40",
      "M 50 35 Q 60 35 70 40"
    ].map((d, i) => (
      <path key={i} d={d} stroke="#228B22" strokeWidth="2.5" strokeLinecap="round" />
    ))}
  </svg>
);

// Simplified Waves
const Waves = ({ size = 50, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M 0 40 Q 25 30 50 40 T 100 40" stroke="#4ECDC4" strokeWidth="3" strokeLinecap="round" />
    <path d="M 0 55 Q 25 45 50 55 T 100 55" stroke="#4ECDC4" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M 0 70 Q 25 60 50 70 T 100 70" stroke="#4ECDC4" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Simplified Sun
const Sun = ({ size = 50, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="50" cy="50" r="20" fill="#FFD700" stroke="#333" strokeWidth="2" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((rotation) => (
      <line
        key={rotation}
        x1="50"
        y1="10"
        x2="50"
        y2="25"
        stroke="#FFD700"
        strokeWidth="3"
        strokeLinecap="round"
        transform={`rotate(${rotation} 50 50)`}
      />
    ))}
  </svg>
);

// Simplified Star
const Star = ({ size = 50, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M 50 15 L 61 38 L 90 38 L 67 55 L 78 85 L 50 68 L 22 85 L 33 55 L 10 38 L 39 38 Z"
      fill="#FFD700"
      stroke="#333"
      strokeWidth="2"
    />
  </svg>
);

// Simplified Microphone
const Microphone = ({ size = 50, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="40" y="20" width="20" height="35" rx="10" fill="#666" stroke="#333" strokeWidth="2" />
    <path d="M 30 50 Q 30 65 50 65 Q 70 65 70 50" stroke="#666" strokeWidth="3" strokeLinecap="round" />
    <line x1="50" y1="65" x2="50" y2="75" stroke="#666" strokeWidth="3" strokeLinecap="round" />
    <line x1="40" y1="75" x2="60" y2="75" stroke="#666" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

// Simplified Trophy with black handles
const Trophy = ({ size = 50, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M 35 25 L 35 45 Q 35 55 50 55 Q 65 55 65 45 L 65 25 Z" fill="#FFD700" stroke="#333" strokeWidth="2" />
    <rect x="35" y="55" width="30" height="8" fill="#FFD700" stroke="#333" strokeWidth="2" />
    <path d="M 35 30 L 25 30 Q 20 30 20 40 Q 20 50 25 50 L 35 50" fill="none" stroke="#333" strokeWidth="4" />
    <path d="M 65 30 L 75 30 Q 80 30 80 40 Q 80 50 75 50 L 65 50" fill="none" stroke="#333" strokeWidth="4" />
  </svg>
);

// Simplified Calendar without dots
const Calendar = ({ size = 50, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="25" y="30" width="50" height="50" rx="5" fill="white" stroke="#333" strokeWidth="2" />
    <rect x="25" y="30" width="50" height="15" rx="5" fill="#4ECDC4" stroke="#333" strokeWidth="2" />
    <line x1="25" y1="45" x2="75" y2="45" stroke="#333" strokeWidth="2" />
    <line x1="40" y1="30" x2="40" y2="20" stroke="#333" strokeWidth="2" />
    <line x1="60" y1="30" x2="60" y2="20" stroke="#333" strokeWidth="2" />
  </svg>
);

// Simplified Location Pin
const LocationPin = ({ size = 50, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M 50 20 Q 35 20 35 40 Q 35 55 50 75 Q 65 55 65 40 Q 65 20 50 20 Z"
      fill="#FF6B6B"
      stroke="#333"
      strokeWidth="2"
    />
    <circle cx="50" cy="40" r="8" fill="white" />
    <circle cx="50" cy="40" r="4" fill="#333" />
  </svg>
);

// Simplified Camera
const Camera = ({ size = 50, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="25" y="35" width="50" height="40" rx="5" fill="#333" stroke="#333" strokeWidth="2" />
    <circle cx="50" cy="55" r="15" fill="#1a1a1a" stroke="#333" strokeWidth="2" />
    <circle cx="50" cy="55" r="8" fill="#333" />
    <circle cx="52" cy="53" r="2" fill="#4ECDC4" />
    <rect x="35" y="35" width="30" height="10" fill="#666" stroke="#333" strokeWidth="2" />
  </svg>
);

// Simplified Ticket
const Ticket = ({ size = 50, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M 20 35 L 80 35 L 80 50 Q 75 50 75 57 Q 75 64 80 64 L 80 75 L 20 75 L 20 64 Q 25 64 25 57 Q 25 50 20 50 Z" 
      fill="#4ECDC4" 
      stroke="#333" 
      strokeWidth="2" 
    />
    <line x1="40" y1="35" x2="40" y2="75" stroke="#333" strokeWidth="2" strokeDasharray="4 4" />
    <circle cx="50" cy="45" r="2" fill="#333" />
    <circle cx="50" cy="55" r="2" fill="#333" />
    <circle cx="50" cy="65" r="2" fill="#333" />
  </svg>
);

// Simplified Confetti
const Confetti = ({ size = 50, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="25" y="20" width="8" height="15" rx="2" fill="#FF6B6B" transform="rotate(-15 29 27.5)" />
    <rect x="45" y="15" width="8" height="18" rx="2" fill="#4ECDC4" transform="rotate(20 49 24)" />
    <rect x="65" y="25" width="8" height="12" rx="2" fill="#FFD700" transform="rotate(-25 69 31)" />
    <circle cx="35" cy="50" r="5" fill="#FF6B6B" />
    <circle cx="60" cy="55" r="4" fill="#4ECDC4" />
    <rect x="30" y="65" width="8" height="14" rx="2" fill="#FFD700" transform="rotate(30 34 72)" />
    <rect x="55" y="68" width="8" height="16" rx="2" fill="#FF6B6B" transform="rotate(-20 59 76)" />
  </svg>
);

// Simplified Balloon
const Balloon = ({ size = 50, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M 50 20 Q 35 20 35 40 Q 35 50 42 58 Q 47 63 50 63 Q 53 63 58 58 Q 65 50 65 40 Q 65 20 50 20 Z"
      fill="#FF6B6B"
      stroke="#333"
      strokeWidth="2"
    />
    <path d="M 50 63 L 50 85" stroke="#333" strokeWidth="2" strokeLinecap="round" />
    <ellipse cx="45" cy="35" rx="6" ry="3" fill="white" opacity="0.5" />
  </svg>
);

// Simplified Music Note
const MusicNote = ({ size = 50, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <ellipse cx="35" cy="70" rx="8" ry="6" fill="#333" />
    <line x1="43" y1="70" x2="43" y2="30" stroke="#333" strokeWidth="3" />
    <ellipse cx="60" cy="60" rx="8" ry="6" fill="#333" />
    <line x1="68" y1="60" x2="68" y2="25" stroke="#333" strokeWidth="3" />
    <path d="M 43 30 Q 55 28 68 25" stroke="#333" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

// Icon configuration
const iconComponents = {
  beachBall: BeachBall,
  sunglasses: Sunglasses,
  palmTree: PalmTree,
  waves: Waves,
  sun: Sun,
  star: Star,
  microphone: Microphone,
  trophy: Trophy,
  calendar: Calendar,
  locationPin: LocationPin,
  camera: Camera,
  ticket: Ticket,
  confetti: Confetti,
  balloon: Balloon,
  musicNote: MusicNote,
};

const DecorativeIcons = ({ 
  icons = [], 
  className = "",
  iconColor = "text-primary/20"
}) => {
  if (!icons || icons.length === 0) return null;

  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`} style={{ zIndex: 0 }}>
      {icons.map((icon, index) => {
        const IconComponent = iconComponents[icon.type];
        if (!IconComponent) return null;

        return (
          <div
            key={index}
            className={`absolute transition-all duration-300 hover:scale-110 ${iconColor}`}
            style={{
              left: icon.left,
              top: icon.top,
              transform: icon.rotate ? `rotate(${icon.rotate}deg)` : undefined,
              filter: icon.opacity ? `opacity(${icon.opacity})` : undefined,
            }}
          >
            <IconComponent size={icon.size || 50} />
          </div>
        );
      })}
    </div>
  );
};

export default DecorativeIcons;