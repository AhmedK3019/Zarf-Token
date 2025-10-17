import React, { useState } from "react";
import { generatePath } from "react-router-dom";

function CreateTrip() {
  const [tripData, setTripData] = useState({
    tripname: "",
    startdate: "",
    starttime: "",
    enddate: "",
    endtime: "",
    location: "",
    shortdescription: "",
    registerationdeadline: "",
    price: "",
    capacity: "",
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [errorvalues, setError] = useState({});
  const validateForm = () => {
    let errorValue = {};
    if (tripData.tripname == "") {
      errorValue.tripname = "Please enter the trip name";
    }
    if (tripData.startdate == "") {
      errorValue.startdate = "Please enter the start date";
    }
    if (tripData.starttime == "") {
      errorValue.starttime = "Please enter the start time";
    }
    if (tripData.enddate == "") {
      errorValue.enddate = "Please enter the end date ";
    }
    if (tripData.endtime == "") {
      errorValue.endtime = "Please enter the end time";
    }
    if (tripData.location == "") {
      errorValue.location = "Please enter the trip location";
    }
    if (tripData.shortdescription == "") {
      errorValue.shortdescription = "Please enter the trip description";
    }
    if (tripData.registerationdeadline == "") {
      errorValue.registerationdeadline =
        "Please enter the registeration deadline";
    }
    if (tripData.price == "") {
      errorValue.price = "Please enter the trip's price";
    }
    if (tripData.capacity == "") {
      errorValue.capacity = "Please enter the trip's capacity";
    }

    return errorValue;
  };

  const handleSubmission = async (e) => {
    e.preventDefault();
    setError({});
    const errorMessages = validateForm();
    if (Object.keys(errorMessages).length > 0) {
      setError(errorMessages);
      return;
    }
    try {
      let body = {
        tripname: tripData.tripname,
        startdate: tripData.startdate,
        starttime: tripData.starttime,
        enddate: tripData.enddate,
        endtime: tripData.endtime,
        location: tripData.location,
        shortdescription: tripData.shortdescription,
        registerationdeadline: tripData.registerationdeadline,
        price: tripData.price,
        capacity: tripData.capacity,
      };
      if (new Date(tripData.enddate) - new Date(tripData.startdate) <= 0) {
        setError({
          general: "Start date should be before the end date",
        });
        setSuccessMessage("");
        return;
      }
      // if (
      //   (new Date(tripData.enddate) - new Date(tripData.startdate)) /
      //     (1000 * 60 * 60 * 24) +
      //     1 <
      //     7 ||
      //   (new Date(tripData.enddate) - new Date(tripData.startdate)) /
      //     (1000 * 60 * 60 * 24) +
      //     1 >
      //     28
      // ) {
      //   setError({
      //     general: "Duration should be between 1 to 4 weeks inclusive",
      //   });
      //   setSuccessMessage("");
      //   return;
      // }
      if (tripData.capacity <= 0) {
        setError({
          general: "Capacity must be a positive number",
        });
        setSuccessMessage("");
        return;
      }
      if (tripData.price <= 0) {
        setError({
          general: "Price must be a positive number",
        });
        setSuccessMessage("");
        return;
      }
      if (
        new Date(tripData.registerationdeadline) -
          new Date(tripData.startdate) >=
        0
      ) {
        setError({
          general: "Register deadline should be before the start date",
        });
        setSuccessMessage("");
        return;
      }

      const result = await fetch("http://localhost:3000/api/trips/createTrip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const tripResponse = await result.json();
      if (!result.ok) {
        throw new Error(tripResponse.message);
      }
      setTripData({
        tripname: "",
        startdate: "",
        starttime: "",
        enddate: "",
        endtime: "",
        location: "",
        shortdescription: "",
        registerationdeadline: "",
        price: "",
        capacity: "",
      });
      setSuccessMessage("Trip created successfully!");
      setError({});
    } catch (error) {
      setSuccessMessage("");
      setError({ general: error.message });
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent py-10 px-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl p-8">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Create a New Trip
        </h2>

        {successMessage && (
          <p className="text-green-600 text-center font-medium mb-4">
            {successMessage}
          </p>
        )}

        {errorvalues.general && (
          <p className="text-red-500 text-center font-medium mb-4">
            {errorvalues.general}
          </p>
        )}

        <form onSubmit={handleSubmission} className="space-y-5">
          <div>
            <label
              htmlFor="tripname"
              className="block text-gray-700 font-medium mb-1"
            >
              Trip name:
            </label>
            <input
              type="text"
              id="tripname"
              placeholder="ex: Summer Trip"
              value={tripData.tripname}
              onChange={(e) => {
                setTripData({ ...tripData, tripname: e.target.value });
                setSuccessMessage("");
                setError({});
              }}
              className="w-full border border-purple-oklch(29.3% 0.136 325.661) rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-oklch(29.3% 0.136 325.661) focus:outline-none"
            />
            {errorvalues.tripname && (
              <p className="text-red-500 text-sm mt-1">
                {errorvalues.tripname}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="startdate"
                className="block text-gray-700 font-medium mb-1"
              >
                Start date:
              </label>
              <input
                type="date"
                id="startdate"
                value={tripData.startdate}
                onChange={(e) => {
                  setTripData({ ...tripData, startdate: e.target.value });
                  setSuccessMessage("");
                  setError({});
                }}
                className="w-full border border-purple-oklch(29.3% 0.136 325.661) rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-oklch(29.3% 0.136 325.661) focus:outline-none"
              />
              {errorvalues.startdate && (
                <p className="text-red-500 text-sm mt-1">
                  {errorvalues.startdate}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="starttime"
                className="block text-gray-700 font-medium mb-1"
              >
                Start time:
              </label>
              <input
                type="time"
                id="starttime"
                value={tripData.starttime}
                onChange={(e) => {
                  setTripData({ ...tripData, starttime: e.target.value });
                  setSuccessMessage("");
                  setError({});
                }}
                className="w-full border border-purple-oklch(29.3% 0.136 325.661) rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-oklch(29.3% 0.136 325.661) focus:outline-none"
              />
              {errorvalues.starttime && (
                <p className="text-red-500 text-sm mt-1">
                  {errorvalues.starttime}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="enddate"
                className="block text-gray-700 font-medium mb-1"
              >
                End date:
              </label>
              <input
                type="date"
                id="enddate"
                value={tripData.enddate}
                onChange={(e) => {
                  setTripData({ ...tripData, enddate: e.target.value });
                  setSuccessMessage("");
                  setError({});
                }}
                className="w-full border border-purple-oklch(29.3% 0.136 325.661) rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-oklch(29.3% 0.136 325.661) focus:outline-none"
              />
              {errorvalues.enddate && (
                <p className="text-red-500 text-sm mt-1">
                  {errorvalues.enddate}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="endtime"
                className="block text-gray-700 font-medium mb-1"
              >
                End time:
              </label>
              <input
                type="time"
                id="endtime"
                value={tripData.endtime}
                onChange={(e) => {
                  setTripData({ ...tripData, endtime: e.target.value });
                  setSuccessMessage("");
                  setError({});
                }}
                className="w-full border border-purple-oklch(29.3% 0.136 325.661) rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-oklch(29.3% 0.136 325.661) focus:outline-none"
              />
              {errorvalues.endtime && (
                <p className="text-red-500 text-sm mt-1">
                  {errorvalues.endtime}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="location"
              className="block text-gray-700 font-medium mb-1"
            >
              Location:
            </label>
            <input
              type="text"
              id="location"
              placeholder="ex: Hurghada"
              value={tripData.location}
              onChange={(e) => {
                setTripData({ ...tripData, location: e.target.value });
                setSuccessMessage("");
                setError({});
              }}
              className="w-full border border-purple-oklch(29.3% 0.136 325.661) rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-oklch(29.3% 0.136 325.661) focus:outline-none"
            />
            {errorvalues.location && (
              <p className="text-red-500 text-sm mt-1">
                {errorvalues.location}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="shortdescription"
              className="block text-gray-700 font-medium mb-1"
            >
              Short description:
            </label>
            <input
              type="text"
              id="shortdescription"
              placeholder="ex: describe in brief words"
              value={tripData.shortdescription}
              onChange={(e) => {
                setTripData({ ...tripData, shortdescription: e.target.value });
                setSuccessMessage("");
                setError({});
              }}
              className="w-full border border-purple-oklch(29.3% 0.136 325.661) rounded-xl px-4 py-2 focus:ring-2 focus:ring--purple-oklch(29.3% 0.136 325.661) focus:outline-none"
            />
            {errorvalues.shortdescription && (
              <p className="text-red-500 text-sm mt-1">
                {errorvalues.shortdescription}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="registerationdeadline"
              className="block text-gray-700 font-medium mb-1"
            >
              Registration deadline:
            </label>
            <input
              type="date"
              id="registerationdeadline"
              value={tripData.registerationdeadline}
              onChange={(e) => {
                setTripData({
                  ...tripData,
                  registerationdeadline: e.target.value,
                });
                setSuccessMessage("");
                setError({});
              }}
              className="w-full border border-purple-oklch(29.3% 0.136 325.661) rounded-xl px-4 py-2 focus:ring-2 focus:-purple-oklch(29.3% 0.136 325.661) focus:outline-none"
            />
            {errorvalues.registerationdeadline && (
              <p className="text-red-500 text-sm mt-1">
                {errorvalues.registerationdeadline}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="price"
                className="block text-gray-700 font-medium mb-1"
              >
                Price:
              </label>
              <input
                type="number"
                id="price"
                placeholder="100"
                value={tripData.price}
                onChange={(e) => {
                  setTripData({ ...tripData, price: e.target.value });
                  setSuccessMessage("");
                  setError({});
                }}
                className="w-full border border-purple-oklch(29.3% 0.136 325.661) rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-oklch(29.3% 0.136 325.661) focus:outline-none"
              />
              {errorvalues.price && (
                <p className="text-red-500 text-sm mt-1">{errorvalues.price}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="capacity"
                className="block text-gray-700 font-medium mb-1"
              >
                Capacity:
              </label>
              <input
                type="number"
                id="capacity"
                placeholder="100"
                value={tripData.capacity}
                onChange={(e) => {
                  setTripData({ ...tripData, capacity: e.target.value });
                  setSuccessMessage("");
                  setError({});
                }}
                className="w-full border border-purple-oklch(29.3% 0.136 325.661) rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-oklch(29.3% 0.136 325.661) focus:outline-none"
              />
              {errorvalues.capacity && (
                <p className="text-red-500 text-sm mt-1">
                  {errorvalues.capacity}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-full border border-primary/40 bg-white px-4 py-2 text-lg font-semibold text-primary tracking-wide shadow-[0_12px_24px_rgba(115,108,237,0.25)] transition-transform hover:-translate-y-0.5 hover:bg-secondary/20 hover:shadow-[0_16px_30px_rgba(115,108,237,0.3)]"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateTrip;
