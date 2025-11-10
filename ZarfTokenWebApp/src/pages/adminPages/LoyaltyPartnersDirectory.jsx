import React from "react";
import LoyaltyPartnersShowcase from "../../components/loyalty/LoyaltyPartnersShowcase.jsx";

export default function LoyaltyPartnersDirectory() {
  return (
    <div className="pb-10">
      <LoyaltyPartnersShowcase
        eyebrow="Campus-wide perks overview"
        description="Monitor the exact perks that are currently live for the GUC community and keep the Events Office/Admin teams aligned on approved vendors."
      />
    </div>
  );
}
