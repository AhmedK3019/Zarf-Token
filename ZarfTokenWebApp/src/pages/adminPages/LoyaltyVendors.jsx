import React from "react";
import LoyaltyApplicationsBoard from "../../components/loyalty/LoyaltyApplicationsBoard.jsx";

export default function LoyaltyVendors() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#f5f7ff] via-white to-[#eef2ff] px-4 py-6 lg:px-6 lg:py-8">
      <div className="mx-auto w-full max-w-7xl">
        <LoyaltyApplicationsBoard />
      </div>
    </div>
  );
}
