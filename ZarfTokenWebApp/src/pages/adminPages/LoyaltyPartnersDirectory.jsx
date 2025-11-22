import React from "react";
import LoyaltyPartnersShowcase from "../../components/loyalty/LoyaltyPartnersShowcase.jsx";

export default function LoyaltyPartnersDirectory() {
  return (
    <div className="min-h-screen w-full overflow-hidden bg-muted text-[#1F1B3B]">
      <div className="relative flex min-h-screen w-full flex-col items-center px-6 py-8">
        <div className="w-full max-w-6xl">
          <LoyaltyPartnersShowcase
            eyebrow="Campus-wide perks overview"
            description="Monitor the exact perks that are currently live for the GUC community and keep the Events Office/Admin teams aligned on approved vendors."
          />
        </div>
      </div>
    </div>
  );
}
