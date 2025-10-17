import React, { useState } from "react";
import CreateBazaar from "../bazaarPages/CreateBazaar";
import CreateConference from "../conferencePages/CreateConference";
import CreateTrip from "../tripPages/CreateTrip";

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
        <h2 className="text-4xl md:text-5xl font-extrabold text-center text-purple-600 mb-4">
          Create Events
        </h2>

        <div className="flex justify-center gap-12 mb-8">
          <button
            onClick={() => setCurrentForm("Trip")}
            className={`${buttonStyle} ${
              currentForm === "Trip"
                ? "bg-purple-600 text-white border-purple-600"
                : "bg-white text-purple-600 border-purple-300 hover:border-purple-500"
            }`}
          >
            Create Trip
          </button>

          <button
            onClick={() => setCurrentForm("Bazaar")}
            className={`${buttonStyle} ${
              currentForm === "Bazaar"
                ? "bg-purple-600 text-white border-purple-600"
                : "bg-white text-purple-600 border-purple-300 hover:border-purple-500"
            }`}
          >
            Create Bazaar
          </button>

          <button
            onClick={() => setCurrentForm("Conference")}
            className={`${buttonStyle} ${
              currentForm === "Conference"
                ? "bg-purple-600 text-white border-purple-600"
                : "bg-white text-purple-600 border-purple-300 hover:border-purple-500"
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
