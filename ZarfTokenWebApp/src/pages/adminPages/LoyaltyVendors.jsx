import React from "react";
import LoyaltyApplicationsBoard from "../../components/loyalty/LoyaltyApplicationsBoard.jsx";

export default function LoyaltyVendors() {
  return (
    <div className="p-4 lg:p-6">
      <LoyaltyApplicationsBoard
        title="Vendor Loyalty Applications"
        subtitle="Review submissions, verify promo codes, and keep track of partner status."
      />
    </div>
  );
}
