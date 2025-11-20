import React from "react";
import LoyaltyPartnersShowcase from "../../components/loyalty/LoyaltyPartnersShowcase.jsx";

export default function LoyaltyPartnersDirectory() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#f5f7ff] via-white to-[#eef2ff] px-4 py-6 lg:px-6 lg:py-8">
      <div className="mx-auto w-full max-w-7xl">
        <LoyaltyPartnersShowcase />
      </div>
    </div>
  );
}
