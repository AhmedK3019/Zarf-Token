import api from "../../services/api";
import React, { useState } from "react";

function CreateBazaar() {
  const [successMessage, setSuccessMessage] = useState("");
  const [errorvalues, setError] = useState({});
  const [bazaarData, setBazaarData] = useState({
    bazaarname: "",
    startdate: "",
    starttime: "",
    enddate: "",
    endtime: "",
    location: "",
    shortdescription: "",
    registrationdeadline: "",
  });

  const validateForm = () => {
    let errorValues = {};
    if (bazaarData.bazaarname.trim() === "") {
      errorValues.bazaarname = "Please enter the bazaar name";
    }
    if (bazaarData.startdate.trim() === "") {
      errorValues.startdate = "Please enter the start date";
    }
    if (bazaarData.starttime.trim() === "") {
      errorValues.starttime = "Please enter the start time";
    }
    if (bazaarData.enddate.trim() === "") {
      errorValues.enddate = "Please enter the end date";
    }
    if (bazaarData.endtime.trim() === "") {
      errorValues.endtime = "Please enter the end time";
    }
    if (bazaarData.location.trim() === "") {
      errorValues.location = "Please enter the location";
    }
    if (bazaarData.shortdescription.trim() === "") {
      errorValues.shortdescription = "Please enter the short description";
    }
    if (bazaarData.registrationdeadline.trim() === "") {
      errorValues.registrationdeadline =
        "Please enter the registrationdeadline";
    }

    return errorValues;
  };

  const handleSubmission = async (e) => {
    e.preventDefault();
    setError({});
    const validation = validateForm();
    if (Object.keys(validation).length > 0) {
      setError(validation);
      setSuccessMessage("");
      return;
    }
    try {
      let body = {
        bazaarname: bazaarData.bazaarname,
        startdate: bazaarData.startdate,
        starttime: bazaarData.starttime,
        enddate: bazaarData.enddate,
        endtime: bazaarData.endtime,
        location: bazaarData.location,
        shortdescription: bazaarData.shortdescription,
        registrationdeadline: bazaarData.registrationdeadline,
      };
      if (new Date(bazaarData.startdate) - new Date(bazaarData.enddate) <= 0) {
        setError({
          general: "Start date should be less than the end date",
        });
        setSuccessMessage("");
        return;
      }
      if (
        (new Date(bazaarData.enddate) - new Date(bazaarData.startdate)) /
          (1000 * 60 * 60 * 24) +
          1 <
          7 ||
        (new Date(bazaarData.enddate) - new Date(bazaarData.startdate)) /
          (1000 * 60 * 60 * 24) +
          1 >
          28
      ) {
        setError({
          general: "Duration should be between 1 and 4 weeks inclusive",
        });
        setSuccessMessage("");
        return;
      }
      if (
        new Date(bazaarData.startdate) -
          new Date(bazaarData.registrationdeadline) <=
        0
      ) {
        setError({
          general: "Registration deadline should be less than the start date",
        });
        setSuccessMessage("");
        return;
      }

      await api.post("/bazaars/createBazaar", body);
      setSuccessMessage("Bazaar created successfully!");
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
          Create a New Bazaar
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
              htmlFor="bazaarName"
              className="block text-gray-700 font-medium mb-1"
            >
              Bazaar name:
            </label>
            <input
              type="text"
              id="bazaarName"
              placeholder="ex: Christmas Bazaar"
              value={bazaarData.bazaarname}
              onChange={(e) => {
                setBazaarData({ ...bazaarData, bazaarname: e.target.value });
                setSuccessMessage("");
              }}
              className="w-full border border-purple-oklch(29.3% 0.136 325.661) rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-oklch(29.3% 0.136 325.661) focus:outline-none"
            />
            {errorvalues.bazaarname && (
              <p className="text-red-500 text-sm mt-1">
                {errorvalues.bazaarname}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="startDate"
                className="block text-gray-700 font-medium mb-1"
              >
                Start date:
              </label>
              <input
                type="date"
                id="startDate"
                value={bazaarData.startdate}
                onChange={(e) => {
                  setBazaarData({ ...bazaarData, startdate: e.target.value });
                  setSuccessMessage("");
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
                htmlFor="startTime"
                className="block text-gray-700 font-medium mb-1"
              >
                Start time:
              </label>
              <input
                type="time"
                id="startTime"
                value={bazaarData.starttime}
                onChange={(e) => {
                  setBazaarData({ ...bazaarData, starttime: e.target.value });
                  setSuccessMessage("");
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
                htmlFor="endDate"
                className="block text-gray-700 font-medium mb-1"
              >
                End date:
              </label>
              <input
                type="date"
                id="endDate"
                value={bazaarData.enddate}
                onChange={(e) => {
                  setBazaarData({ ...bazaarData, enddate: e.target.value });
                  setSuccessMessage("");
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
                htmlFor="endTime"
                className="block text-gray-700 font-medium mb-1"
              >
                End time:
              </label>
              <input
                type="time"
                id="endTime"
                value={bazaarData.endtime}
                onChange={(e) => {
                  setBazaarData({ ...bazaarData, endtime: e.target.value });
                  setSuccessMessage("");
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
              placeholder="ex: GUC Cairo"
              value={bazaarData.location}
              onChange={(e) => {
                setBazaarData({ ...bazaarData, location: e.target.value });
                setSuccessMessage("");
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
              htmlFor="shortDescription"
              className="block text-gray-700 font-medium mb-1"
            >
              Short description:
            </label>
            <input
              type="text"
              id="shortDescription"
              placeholder="ex: Small winter market"
              value={bazaarData.shortdescription}
              onChange={(e) => {
                setBazaarData({
                  ...bazaarData,
                  shortdescription: e.target.value,
                });
                setSuccessMessage("");
              }}
              className="w-full border border-purple-oklch(29.3% 0.136 325.661) rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-oklch(29.3% 0.136 325.661) focus:outline-none"
            />
            {errorvalues.shortdescription && (
              <p className="text-red-500 text-sm mt-1">
                {errorvalues.shortdescription}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="registrationDeadline"
              className="block text-gray-700 font-medium mb-1"
            >
              Registration deadline:
            </label>
            <input
              type="date"
              id="registrationDeadline"
              value={bazaarData.registrationdeadline}
              onChange={(e) => {
                setBazaarData({
                  ...bazaarData,
                  registrationdeadline: e.target.value,
                });
                setSuccessMessage("");
              }}
              className="w-full border border-purple-oklch(29.3% 0.136 325.661) rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-oklch(29.3% 0.136 325.661) focus:outline-none"
            />
            {errorvalues.registrationdeadline && (
              <p className="text-red-500 text-sm mt-1">
                {errorvalues.registrationdeadline}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full rounded-full border border-primary/40 bg-white px-4 py-2 text-lg font-semibold text-primary tracking-wide shadow-[0_12px_24px_rgba(115,108,237,0.25)] transition-transform hover:-translate-y-0.5 hover:bg-secondary/20 hover:shadow-[0_16px_30px_rgba(115,108,237,0.3)]"
          >
            Create Bazaar
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateBazaar;
