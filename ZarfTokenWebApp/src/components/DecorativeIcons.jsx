import React from "react";

// Individual icon components as SVG line art
const BeachBall = ({ size = 50, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="2.5" />
    <path d="M 50 10 L 50 90" stroke="currentColor" strokeWidth="2.5" />
    <path d="M 10 50 L 90 50" stroke="currentColor" strokeWidth="2.5" />
    <path d="M 22 22 L 78 78" stroke="currentColor" strokeWidth="2.5" />
    <path d="M 78 22 L 22 78" stroke="currentColor" strokeWidth="2.5" />
  </svg>
);

const Sunglasses = ({ size = 50, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="15" y="35" width="30" height="20" rx="10" stroke="currentColor" strokeWidth="2.5" />
    <rect x="55" y="35" width="30" height="20" rx="10" stroke="currentColor" strokeWidth="2.5" />
    <path d="M 45 45 L 55 45" stroke="currentColor" strokeWidth="2.5" />
    <path d="M 15 45 L 5 40" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M 85 45 L 95 40" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const PalmTree = ({ size = 50, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M 50 35 Q 48 50 46 65 Q 45 75 48 85" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <path d="M 50 35 Q 30 25 20 30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M 50 35 Q 70 25 80 30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M 50 35 Q 35 30 25 35" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M 50 35 Q 65 30 75 35" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M 50 35 Q 40 35 30 40" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M 50 35 Q 60 35 70 40" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const Waves = ({ size = 50, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M 5 40 Q 20 30 35 40 T 65 40 T 95 40" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M 5 55 Q 20 45 35 55 T 65 55 T 95 55" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M 5 70 Q 20 60 35 70 T 65 70 T 95 70" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const Sun = ({ size = 50, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="50" cy="50" r="18" stroke="currentColor" strokeWidth="2.5" />
    <line x1="50" y1="15" x2="50" y2="8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="50" y1="92" x2="50" y2="85" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="15" y1="50" x2="8" y2="50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="92" y1="50" x2="85" y2="50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="25" y1="25" x2="20" y2="20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="75" y1="75" x2="80" y2="80" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="75" y1="25" x2="80" y2="20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="25" y1="75" x2="20" y2="80" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

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
      d="M 50 15 L 58 40 L 85 40 L 64 55 L 72 80 L 50 65 L 28 80 L 36 55 L 15 40 L 42 40 Z"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
  </svg>
);

const Microphone = ({ size = 50, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="38" y="20" width="24" height="35" rx="12" stroke="currentColor" strokeWidth="2.5" />
    <path d="M 30 50 Q 30 68 50 68 Q 70 68 70 50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="50" y1="68" x2="50" y2="80" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="38" y1="80" x2="62" y2="80" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const Trophy = ({ size = 50, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M 35 25 L 35 45 Q 35 55 50 55 Q 65 55 65 45 L 65 25 Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
    <line x1="35" y1="25" x2="65" y2="25" stroke="currentColor" strokeWidth="2.5" />
    <path d="M 35 30 L 28 30 Q 20 30 20 38 Q 20 46 28 46 L 35 46" stroke="currentColor" strokeWidth="2.5" />
    <path d="M 65 30 L 72 30 Q 80 30 80 38 Q 80 46 72 46 L 65 46" stroke="currentColor" strokeWidth="2.5" />
    <line x1="50" y1="55" x2="50" y2="70" stroke="currentColor" strokeWidth="2.5" />
    <rect x="40" y="70" width="20" height="8" stroke="currentColor" strokeWidth="2.5" />
    <line x1="35" y1="78" x2="65" y2="78" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const Calendar = ({ size = 50, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="20" y="25" width="60" height="60" rx="4" stroke="currentColor" strokeWidth="2.5" />
    <line x1="20" y1="40" x2="80" y2="40" stroke="currentColor" strokeWidth="2.5" />
    <line x1="35" y1="25" x2="35" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="65" y1="25" x2="65" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="32" y1="54" x2="38" y2="54" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="47" y1="54" x2="53" y2="54" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="62" y1="54" x2="68" y2="54" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="32" y1="67" x2="38" y2="67" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="47" y1="67" x2="53" y2="67" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

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
      d="M 50 20 Q 35 20 35 38 Q 35 52 50 75 Q 65 52 65 38 Q 65 20 50 20 Z"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <circle cx="50" cy="38" r="8" stroke="currentColor" strokeWidth="2.5" />
  </svg>
);

const Camera = ({ size = 50, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="20" y="35" width="60" height="45" rx="5" stroke="currentColor" strokeWidth="2.5" />
    <circle cx="50" cy="57" r="15" stroke="currentColor" strokeWidth="2.5" />
    <path d="M 38 35 L 42 28 L 58 28 L 62 35" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
    <circle cx="68" cy="45" r="3" fill="currentColor" />
  </svg>
);

const Ticket = ({ size = 50, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M 15 35 L 85 35 L 85 50 Q 78 50 78 57 Q 78 64 85 64 L 85 75 L 15 75 L 15 64 Q 22 64 22 57 Q 22 50 15 50 Z" 
      stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
    <line x1="35" y1="35" x2="35" y2="75" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
    <line x1="45" y1="45" x2="70" y2="45" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="45" y1="55" x2="65" y2="55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const Confetti = ({ size = 50, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="25" y="20" width="8" height="15" rx="2" stroke="currentColor" strokeWidth="2" transform="rotate(-15 29 27.5)" />
    <rect x="45" y="15" width="8" height="18" rx="2" stroke="currentColor" strokeWidth="2" transform="rotate(20 49 24)" />
    <rect x="67" y="25" width="8" height="12" rx="2" stroke="currentColor" strokeWidth="2" transform="rotate(-25 71 31)" />
    <circle cx="35" cy="50" r="4" stroke="currentColor" strokeWidth="2" />
    <circle cx="60" cy="55" r="3" stroke="currentColor" strokeWidth="2" />
    <path d="M 48 45 L 52 50 L 48 55 L 44 50 Z" stroke="currentColor" strokeWidth="2" />
    <rect x="28" y="65" width="8" height="14" rx="2" stroke="currentColor" strokeWidth="2" transform="rotate(30 32 72)" />
    <rect x="55" y="68" width="8" height="16" rx="2" stroke="currentColor" strokeWidth="2" transform="rotate(-20 59 76)" />
    <circle cx="70" cy="70" r="3" stroke="currentColor" strokeWidth="2" />
  </svg>
);

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
      d="M 50 20 Q 35 20 35 38 Q 35 50 42 58 Q 47 63 50 63 Q 53 63 58 58 Q 65 50 65 38 Q 65 20 50 20 Z"
      stroke="currentColor"
      strokeWidth="2.5"
    />
    <path d="M 50 63 Q 48 68 50 72 L 50 80" stroke="currentColor" strokeWidth="2" />
    <path d="M 50 80 Q 45 82 40 90" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const MusicNote = ({ size = 50, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <ellipse cx="35" cy="70" rx="10" ry="8" stroke="currentColor" strokeWidth="2.5" />
    <line x1="45" y1="70" x2="45" y2="25" stroke="currentColor" strokeWidth="2.5" />
    <ellipse cx="60" cy="60" rx="10" ry="8" stroke="currentColor" strokeWidth="2.5" />
    <line x1="70" y1="60" x2="70" y2="20" stroke="currentColor" strokeWidth="2.5" />
    <path d="M 45 25 Q 60 20 70 20" stroke="currentColor" strokeWidth="2.5" />
  </svg>
);

// Icon configuration with positions and sizes
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
            className={`absolute ${iconColor}`}
            style={{
              left: icon.left,
              top: icon.top,
              transform: icon.rotate ? `rotate(${icon.rotate}deg)` : undefined,
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