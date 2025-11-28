import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useParams, useNavigate } from "react-router-dom";
import { all } from "axios";

const EditBazaar = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bazaarData, setBazaarData] = useState({
    bazaarname: "",
    startdate: "",
    starttime: "",
    enddate: "",
    endtime: "",
    location: "",
    shortdescription: "",
    registrationdeadline: "",
    allowedusers: [],
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorvalues, setErrors] = useState({});

  useEffect(() => {
    const getBazaar = async () => {
      try {
        const result = await api.get(`/bazaars/getBazaar/${id}`);
        let bazaar = result.data.bazaar;
        setBazaarData({
          ...bazaar,
          startdate: bazaar.startdate?.slice(0, 10) || "",
          enddate: bazaar.enddate?.slice(0, 10) || "",
          registrationdeadline: bazaar.registrationdeadline?.slice(0, 10) || "",
        });
      } catch (error) {
        setErrors({ general: error.message });
        setSuccessMessage("");
        return;
      }
    };
    getBazaar();
  }, [id]);

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
    if (bazaarData.allowedusers.length == 0) {
      errorValues.allowedusers = "Please select at least one role";
    }

    return errorValues;
  };
  const handleAllowedUsersChange = (e) => {
    const { value, checked } = e.target;
    let updatedUsers = [...bazaarData.allowedusers];
    if (checked) {
      updatedUsers.push(value);
    } else {
      updatedUsers = updatedUsers.filter((user) => user !== value);
    }
    setBazaarData({ ...bazaarData, allowedusers: updatedUsers });
    setSuccessMessage("");
    setErrors({});
  };
  const handleSubmission = async (e) => {
    e.preventDefault();
    const validation = validateForm();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
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
        allowedusers: bazaarData.allowedusers,
      };
      if (new Date(bazaarData.enddate) - new Date(bazaarData.startdate) <= 0) {
        setErrors({
          general: "Start date should be before the end date",
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
        setErrors({
          general: "Duration should be between 1 to 4 weeks inclusive",
        });
        setSuccessMessage("");
        return;
      }
      if (
        new Date(bazaarData.startdate) -
          new Date(bazaarData.registrationdeadline) <=
        0
      ) {
        setErrors({
          general: "Registration deadline should be before the start date",
        });
        setSuccessMessage("");
        return;
      }
      await api.put(`/bazaars/updateBazaar/${id}`, body);
      setSuccessMessage("Bazaar is updated successfully");
      setErrors({});
      window.location.href =
        "http://localhost:5173/dashboard/eventsOffice/all-events";
    } catch (error) {
      setSuccessMessage("");
      setErrors({ general: error.message });
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent py-10 px-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl p-8">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Edit Bazaar
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
                setErrors({});
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
                  setErrors({});
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
                  setErrors({});
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
                  setErrors({});
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
                  setErrors({});
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
                setErrors({});
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
                setErrors({});
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
                setErrors({});
              }}
              className="w-full border border-purple-oklch(29.3% 0.136 325.661) rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-oklch(29.3% 0.136 325.661) focus:outline-none"
            />
            {errorvalues.registrationdeadline && (
              <p className="text-red-500 text-sm mt-1">
                {errorvalues.registrationdeadline}
              </p>
            )}
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Allowed users:
            </label>
            <div className="grid grid-cols-2 gap-4">
              {["Student", "Professor", "TA", "Staff"].map((role) => (
                <label
                  key={role}
                  htmlFor={role}
                  className="flex items-center space-x-3 bg-gray-50 border border-purple-300 rounded-xl px-4 py-2 hover:bg-purple-50 transition"
                >
                  <input
                    type="checkbox"
                    id={role}
                    value={role}
                    checked={bazaarData.allowedusers.includes(role)}
                    onChange={handleAllowedUsersChange}
                    className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-2 focus:ring-purple-400"
                  />
                  <span className="text-gray-700 capitalize font-medium">
                    {role}
                  </span>
                </label>
              ))}
            </div>
            {errorvalues.allowedusers && (
              <p className="text-red-500 text-sm mt-1">
                {errorvalues.allowedusers}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => {
                navigate(-1);
              }}
              className="w-full rounded-full border border-red-500 bg-red-500 px-4 py-2 text-lg font-semibold text-white tracking-wide shadow-[0_12px_24px_rgba(239,68,68,0.25)] transition-transform hover:-translate-y-0.5 hover:bg-red-600 hover:shadow-[0_16px_30px_rgba(239,68,68,0.3)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full rounded-full border border-primary/40 bg-white px-4 py-2 text-lg font-semibold text-primary tracking-wide shadow-[0_12px_24px_rgba(115,108,237,0.25)] transition-transform hover:-translate-y-0.5 hover:bg-secondary/20 hover:shadow-[0_16px_30px_rgba(115,108,237,0.3)]"
            >
              Update Bazaar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBazaar;
