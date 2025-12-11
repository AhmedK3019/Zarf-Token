import React, { useState, useEffect } from "react";
import api from "../services/api";
import {
  generatePath,
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
export default function ForgetPassword() {
  const [emailData, setEmail] = useState({ email: "" });
  const [error, setError] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const validateForm = () => {
    let errorValues = {};
    if (!emailData.email) {
      errorValues.email = "please enter your email";
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
    let body = { email: emailData.email };
    console.log(body);

    try {
      let result = await api.post("allUsers/passwordEmail", body);
      localStorage.setItem("resetToken", result.data.resetToken);
      setSuccessMessage("You will recieve an email in a few seconds");
      setError({});
      setEmail({ email: "" });
    } catch (error) {
      setSuccessMessage("");
      setError({ general: error?.response?.data?.message });
    }
  };

  return (
    // 1. Outer container: Full screen height, Flexbox to center content
    <div className="flex min-h-screen w-full items-center justify-center bg-[#D5CFE1] p-4 text-primary">
      {/* 2. The Card: White background, rounded corners, shadow, max-width */}
      <div className="w-full max-w-md rounded-[30px] bg-white p-8 shadow-lg md:p-10">
        <h2 className="mb-8 text-center text-2xl font-bold text-gray-800">
          Reset Password Request
        </h2>

        {successMessage && (
          <p className="mb-4 text-center font-medium text-green-600">
            {successMessage}
          </p>
        )}

        {error.general && (
          <p className="mb-4 text-center font-medium text-red-500">
            {error.general}
          </p>
        )}

        <form onSubmit={handleSubmission} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="ml-1 block font-bold text-gray-900"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              required
              placeholder="you@campus.edu"
              value={emailData.email}
              // Added rounded-full and padding to match the image style
              className="w-full rounded-full border border-gray-400 bg-transparent px-5 py-3 text-base text-gray-800 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
              onChange={(e) => {
                setEmail({ email: e.target.value });
                setSuccessMessage("");
                setError({});
              }}
            />
            {error.email && (
              <p className="ml-1 text-sm text-red-500">{error.email}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full rounded-full border border-primary/40 bg-white px-6 py-3 text-lg font-semibold tracking-wide text-primary shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-gray-50"
          >
            Send Email
          </button>
          <p className="text-center text-sm font-semibold text-primary/80">
            Remember your password?{" "}
            <Link
              to="/"
              className="text-secondary underline decoration-primary/40 transition hover:text-primary"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
