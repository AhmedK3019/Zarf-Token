import React, { useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
function CreateConference({ onCancel }) {
  const navigate = useNavigate();
  const [conferenceData, setConferenceData] = useState({
    conferencename: "",
    professorname: "",
    startdate: "",
    starttime: "",
    enddate: "",
    endtime: "",
    shortdescription: "",
    location: "",
    fullagenda: "",
    conferencelink: "",
    requiredbudget: "",
    sourceoffunding: "",
    extrarequiredresources: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorvalues, setErrors] = useState({});

  const validateForm = () => {
    let errorValues = {};

    if (conferenceData.conferencename.trim() === "") {
      errorValues.conferencename = "Please enter the conference name";
    }
    if (conferenceData.professorname.trim() === "") {
      errorValues.professorname = "Please enter the professor name";
    }
    if (conferenceData.startdate.trim() === "") {
      errorValues.startdate = "Please enter the start date";
    }
    if (conferenceData.starttime.trim() === "") {
      errorValues.starttime = "Please enter the start time";
    }
    if (conferenceData.enddate.trim() === "") {
      errorValues.enddate = "Please enter the end date";
    }
    if (conferenceData.endtime.trim() === "") {
      errorValues.endtime = "Please enter the end time";
    }
    if (conferenceData.shortdescription.trim() === "") {
      errorValues.shortdescription = "Please enter the short description";
    }
    if (conferenceData.location.trim() === "") {
      errorValues.location = "Please enter the location";
    }
    if (conferenceData.fullagenda.trim() === "") {
      errorValues.fullagenda = "Please enter the full agenda";
    }
    if (conferenceData.conferencelink.trim() === "") {
      errorValues.conferencelink = "Please enter the conference link";
    }
    if (!conferenceData.requiredbudget) {
      errorValues.requiredbudget = "Please enter the required budget";
    }
    if (conferenceData.sourceoffunding.trim() === "") {
      errorValues.sourceoffunding = "Please select  the source of funding";
    }
    return errorValues;
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
        conferencename: conferenceData.conferencename,
        professorname: conferenceData.professorname,
        startdate: conferenceData.startdate,
        starttime: conferenceData.starttime,
        enddate: conferenceData.enddate,
        endtime: conferenceData.endtime,
        shortdescription: conferenceData.shortdescription,
        location: conferenceData.location,
        fullagenda: conferenceData.fullagenda,
        conferencelink: conferenceData.conferencelink,
        requiredbudget: conferenceData.requiredbudget,
        sourceoffunding: conferenceData.sourceoffunding,
        extrarequiredresources: conferenceData.extrarequiredresources,
      };
      if (
        new Date(conferenceData.enddate) - new Date(conferenceData.startdate) <
        0
      ) {
        setErrors({
          general: "Start date should be before the end date",
        });
        setSuccessMessage("");
        return;
      }
      // if (
      //   (new Date(conferenceData.enddate) -
      //     new Date(conferenceData.startdate)) /
      //     (1000 * 60 * 60 * 24) +
      //     1 <
      //     7 ||
      //   (new Date(conferenceData.enddate) -
      //     new Date(conferenceData.startdate)) /
      //     (1000 * 60 * 60 * 24) +
      //     1 >
      //     28
      // ) {
      //   setErrors({
      //     general: "Duration should be between 1 to 4 weeks inclusive",
      //   });
      //   setSuccessMessage("");
      //   return;
      // }
      if (conferenceData.requiredbudget <= 0) {
        setErrors({
          general: "Required budget must be a positive number",
        });
        setSuccessMessage("");
        return;
      }
      await api.post("/conferences/createConference", body);
      setErrors({});
      setSuccessMessage("Created the conference successfully");
      setConferenceData({
        conferencename: "",
        professorname: "",
        startdate: "",
        starttime: "",
        enddate: "",
        endtime: "",
        shortdescription: "",
        location: "",
        fullagenda: "",
        conferencelink: "",
        requiredbudget: "",
        sourceoffunding: "",
        extrarequiredresources: "",
      });
      navigate("/dashboard/eventsOffice/all-events");
    } catch (error) {
      setErrors({ general: error.response.data.message });
      setSuccessMessage("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent py-10 px-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl p-8">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Create a New Conference
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="conferenceName"
                className="block text-gray-700 font-medium mb-1"
              >
                Conference name:
              </label>
              <input
                type="text"
                id="conferenceName"
                placeholder="ex: AI Research Summit"
                value={conferenceData.conferencename}
                onChange={(e) => {
                  setConferenceData({
                    ...conferenceData,
                    conferencename: e.target.value,
                  });
                  setSuccessMessage("");
                  setErrors({});
                }}
                className="w-full border border-purple-oklch(29.3% 0.136 325.661) rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-oklch(29.3% 0.136 325.661) focus:outline-none"
              />
              {errorvalues.conferencename && (
                <p className="text-red-500 text-sm mt-1">
                  {errorvalues.conferencename}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="professorName"
                className="block text-gray-700 font-medium mb-1"
              >
                Professor name:
              </label>
              <input
                type="text"
                id="professorName"
                placeholder="ex: Dr Samy"
                value={conferenceData.professorname}
                onChange={(e) => {
                  setConferenceData({
                    ...conferenceData,
                    professorname: e.target.value,
                  });
                  setSuccessMessage("");
                  setErrors({});
                }}
                className="w-full border border-purple-oklch(29.3% 0.136 325.661) rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-oklch(29.3% 0.136 325.661) focus:outline-none"
              />
              {errorvalues.professorname && (
                <p className="text-red-500 text-sm mt-1">
                  {errorvalues.professorname}
                </p>
              )}
            </div>
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
                value={conferenceData.startdate}
                onChange={(e) => {
                  setConferenceData({
                    ...conferenceData,
                    startdate: e.target.value,
                  });
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
                value={conferenceData.starttime}
                onChange={(e) => {
                  setConferenceData({
                    ...conferenceData,
                    starttime: e.target.value,
                  });
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
                value={conferenceData.enddate}
                onChange={(e) => {
                  setConferenceData({
                    ...conferenceData,
                    enddate: e.target.value,
                  });
                  setErrors({});
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
                value={conferenceData.endtime}
                onChange={(e) => {
                  setConferenceData({
                    ...conferenceData,
                    endtime: e.target.value,
                  });
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
              placeholder="ex: GUC Berlin"
              value={conferenceData.location}
              onChange={(e) => {
                setConferenceData({
                  ...conferenceData,
                  location: e.target.value,
                });
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
              placeholder="ex: Annual research gathering"
              value={conferenceData.shortdescription}
              onChange={(e) => {
                setConferenceData({
                  ...conferenceData,
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
              htmlFor="fullAgenda"
              className="block text-gray-700 font-medium mb-1"
            >
              Full agenda:
            </label>
            <textarea
              id="fullAgenda"
              placeholder="ex: Opening session, keynote, workshops..."
              value={conferenceData.fullagenda}
              onChange={(e) => {
                setConferenceData({
                  ...conferenceData,
                  fullagenda: e.target.value,
                });
                setSuccessMessage("");
                setErrors({});
              }}
              rows="3"
              className="w-full border border-purple-oklch(29.3% 0.136 325.661)rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-oklch(29.3% 0.136 325.661) focus:outline-none"
            />
            {errorvalues.fullagenda && (
              <p className="text-red-500 text-sm mt-1">
                {errorvalues.fullagenda}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="conferenceLink"
              className="block text-gray-700 font-medium mb-1"
            >
              Conference link:
            </label>
            <input
              type="url"
              id="conferenceLink"
              placeholder="ex: https://conference.example.com"
              value={conferenceData.conferencelink}
              onChange={(e) => {
                setConferenceData({
                  ...conferenceData,
                  conferencelink: e.target.value,
                });
                setSuccessMessage("");
                setErrors({});
              }}
              className="w-full border border-purple-oklch(29.3% 0.136 325.661) rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-oklch(29.3% 0.136 325.661) focus:outline-none"
            />
            {errorvalues.conferencelink && (
              <p className="text-red-500 text-sm mt-1">
                {errorvalues.conferencelink}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="requiredbudget"
                className="block text-gray-700 font-medium mb-1"
              >
                Required budget:
              </label>
              <input
                type="number"
                id="requiredbudget"
                placeholder="ex: 10000"
                value={conferenceData.requiredbudget}
                onChange={(e) => {
                  setConferenceData({
                    ...conferenceData,
                    requiredbudget: e.target.value,
                  });
                  setSuccessMessage("");
                  setErrors({});
                }}
                className="w-full border border-purple-oklch(29.3% 0.136 325.661) rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-oklch(29.3% 0.136 325.661) focus:outline-none"
              />
              {errorvalues.requiredbudget && (
                <p className="text-red-500 text-sm mt-1">
                  {errorvalues.requiredbudget}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="sourceoffunding"
                className="block text-gray-700 font-medium mb-1"
              >
                Source of funding:
              </label>
              <select
                name="sourceoffunding"
                id="sourceoffunding"
                value={conferenceData.sourceoffunding}
                onChange={(e) => {
                  setConferenceData({
                    ...conferenceData,
                    sourceoffunding: e.target.value,
                  });
                  setSuccessMessage("");
                  setErrors({});
                }}
                className="w-full border border-purple-oklch(29.3% 0.136 325.661) rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-oklch(29.3% 0.136 325.661) focus:outline-none"
              >
                <option value="">Select a funding source</option>
                <option>External</option>
                <option>GUC</option>
              </select>
              {errorvalues.sourceoffunding && (
                <p className="text-red-500 text-sm mt-1">
                  {errorvalues.sourceoffunding}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="extrarequiredresources"
              className="block text-gray-700 font-medium mb-1"
            >
              Extra required resources:
            </label>
            <input
              type="text"
              id="extrarequiredresources"
              placeholder="ex: extra speakers "
              value={conferenceData.extrarequiredresources}
              onChange={(e) => {
                setConferenceData({
                  ...conferenceData,
                  extrarequiredresources: e.target.value,
                });
                setSuccessMessage("");
                setErrors({});
              }}
              className="w-full border border-purple-oklch(29.3% 0.136 325.661) rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-oklch(29.3% 0.136 325.661) focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="submit"
              className="w-full rounded-full border border-primary/40 bg-white px-4 py-2 text-lg font-semibold text-primary tracking-wide shadow-[0_12px_24px_rgba(115,108,237,0.25)] transition-transform hover:-translate-y-0.5 hover:bg-secondary/20 hover:shadow-[0_16px_30px_rgba(115,108,237,0.3)]"
            >
              Create Conference
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="w-full rounded-full border border-red-500 bg-red-500 px-4 py-2 text-lg font-semibold text-white tracking-wide shadow-[0_12px_24px_rgba(239,68,68,0.25)] transition-transform hover:-translate-y-0.5 hover:bg-red-600 hover:shadow-[0_16px_30px_rgba(239,68,68,0.3)]"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateConference;
