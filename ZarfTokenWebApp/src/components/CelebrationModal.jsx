import React, { useMemo } from "react";

const ConfettiLayer = () => {
  const pieces = useMemo(() => {
    const colors = ["#736CED", "#6DD3CE", "#54C6EB", "#FFE156", "#ffffff"];

    return Array.from({ length: 34 }, (_, index) => {
      const color = colors[index % colors.length];
      return {
        id: index,
        color,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 0.8}s`,
        duration: `${5.25 + Math.random() * 3.25}s`,
        size: `${6 + Math.random() * 6}px`,
        drift: `${Math.random() * 120 - 60}px`,
      };
    });
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="confetti-piece"
          style={{
            left: piece.left,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            animationDelay: piece.delay,
            animationDuration: piece.duration,
            ["--confetti-drift"]: piece.drift,
          }}
        />
      ))}
    </div>
  );
};

const SmileyIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" fill="#fef08a" stroke="#14532d" strokeWidth="1.5" />
    <circle cx="9" cy="10" r="1.2" fill="#14532d" />
    <circle cx="15" cy="10" r="1.2" fill="#14532d" />
    <path
      d="M8 14c.8 1.3 2.2 2 4 2s3.2-.7 4-2"
      stroke="#14532d"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export default function CelebrationModal({ open, onClose, onLogin }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-10"
      role="dialog"
      aria-modal="true"
      aria-label="Signup success"
    >
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-[#736CED]/25 bg-[#1F4591] shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <ConfettiLayer />

        <div className="relative z-10 px-8 py-9 text-center text-white sm:px-12">
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#736CED]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1F4591]"
              aria-label="Close celebration popup"
            >
              X
            </button>
          </div>

          <h3 className="mt-2 text-3xl font-black text-[#6DD3CE] sm:text-4xl">
            Congrats on signing up!
          </h3>
          <p className="mt-3 text-sm font-semibold text-white/90 sm:text-base">
            Get ready to go on unlimited events and have unlimited fun!!!!!!!!!!
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onLogin}
              className="inline-flex items-center gap-2 rounded-full bg-[#16796F] px-6 py-3 text-base font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(22,121,111,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16796F]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1F4591]"
            >
              <SmileyIcon />
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
