import React from "react";
import LoyaltyPartnersShowcase from "../../components/loyalty/LoyaltyPartnersShowcase.jsx";

export default function LoyaltyPartnersDirectory() {
  return (
    <div className="pb-10">
      <LoyaltyPartnersShowcase
        eyebrow="Operations view · Loyalty partners"
        description="Give Students, Staff, TAs, Professors, Admin, and the Events Office a single source of truth for every active loyalty vendor, their promo codes, and redemption terms."
      />
    </div>
  );
}
