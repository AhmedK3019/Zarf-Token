import React, { useState } from "react";
import CreateBazaar from "../bazaarPages/createBazaar";
import CreateConference from "../conferencePages/CreateConference";
import CreateTrip from "../tripPages/createTrip";

export default function CreateEvent() {
  const [currentForm, setCurrentForm] = useState("");
  const selectForm = () => {
    if (currentForm === "Trip")
      return (
        <CreateTrip
          onCancel={() => {
            setCurrentForm("");
          }}
        />
      );
    if (currentForm === "Bazaar")
      return (
        <CreateBazaar
          onCancel={() => {
            setCurrentForm("");
          }}
        />
      );
    if (currentForm === "Conference")
      return (
        <CreateConference
          onCancel={() => {
            setCurrentForm("");
          }}
        />
      );
    return null;
  };

  const buttonStyle =
    "px-6 py-2 text-sm font-medium rounded-full transition-colors duration-200 shadow-sm border-2";

  return (
    <div className="min-h-screen flex flex-col items-center bg-transparent">
      <div className="w-full max-w-4xl mx-auto pt-12 px-6">
        <div className="flex justify-center gap-12 mb-8">
          <button
            onClick={() => setCurrentForm("Trip")}
            className={`${buttonStyle} ${
              currentForm === "Trip"
                ? "bg-[#001845] text-white border-[#001845]"
                : "bg-white text-[#001845] border-[#001845] hover:bg-[#001845] hover:text-white"
            }`}
          >
            Create Trip
          </button>

          <button
            onClick={() => setCurrentForm("Bazaar")}
            className={`${buttonStyle} ${
              currentForm === "Bazaar"
                ? "bg-[#001845] text-white border-[#001845]"
                : "bg-white text-[#001845] border-[#001845] hover:bg-[#001845] hover:text-white"
            }`}
          >
            Create Bazaar
          </button>

          <button
            onClick={() => setCurrentForm("Conference")}
            className={`${buttonStyle} ${
              currentForm === "Conference"
                ? "bg-[#001845] text-white border-[#001845]"
                : "bg-white text-[#001845] border-[#001845] hover:bg-[#001845] hover:text-white"
            }`}
          >
            Create Conference
          </button>
        </div>

        <div>{selectForm()}</div>
      </div>
    </div>
  );
}
