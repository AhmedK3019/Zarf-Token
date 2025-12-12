import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [passwordData, setPasswordData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const resetToken = localStorage.getItem("resetToken");
  function isTokenExpired(token) {
    if (!token) {
      return true; // No token means it's expired/invalid
    }

    try {
      // Step 1: Split the token to get the payload (second part)
      const parts = token.split(".");
      if (parts.length !== 3) {
        console.error("Invalid token format.");
        return true;
      }

      const payloadBase64 = parts[1];

      // Step 2: Decode the base64 payload
      // In the browser, you use atob for decoding.
      const decodedPayload = atob(payloadBase64);

      // Step 3: Parse the JSON to get the claims object
      const payload = JSON.parse(decodedPayload);

      // Get the 'exp' (expiration time) claim
      const expirationTimestamp = payload.exp;

      if (!expirationTimestamp) {
        return false; // Treat as not expired if the claim is missing
      }

      // Step 4: Compare the 'exp' claim to the current time

      // 'exp' is a Unix timestamp (seconds since epoch). We convert it to milliseconds.
      const expirationTimeMs = expirationTimestamp * 1000;

      // Get the current time in milliseconds
      const currentTimeMs = Date.now();

      // Check if the current time is greater than the expiration time
      return currentTimeMs >= expirationTimeMs;
    } catch (e) {
      console.error("Error decoding or parsing token:", e);
      return true; // Assume expired/invalid on error
    }
  }
  useEffect(() => {
    const checkToken = () => {
      if (isTokenExpired(resetToken)) {
        localStorage.clear(resetToken);
        navigate("/invalid-link");
      }
    };
    checkToken();
    return () => {};
  }, [navigate]);

  const validateForm = () => {
    let errorValues = {};
    if (!passwordData.password) {
      errorValues.password = "Please enter the password.";
    } else if (passwordData.password.length < 8) {
      errorValues.password = "The password must contain at least 8 characters.";
    }

    if (!passwordData.confirmPassword) {
      errorValues.confirmPassword =
        "Please re-enter your password for confirmation.";
    }
    if (
      passwordData.password &&
      passwordData.confirmPassword &&
      passwordData.password !== passwordData.confirmPassword
    ) {
      errorValues.general = "Passwords should be the same.";
    }

    return errorValues;
  };

  const handleSubmission = async (e) => {
    e.preventDefault();
    let validation = validateForm();
    setErrors({});

    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      setSuccessMessage("");
      return;
    }

    if (validation.general) {
      setErrors(validation);
      setSuccessMessage("");
      return;
    }

    const body = { password: passwordData.password };

    try {
      let resetToken = localStorage.getItem("resetToken");
      if (!resetToken) {
        setErrors({ general: "The link to the reset password is expired" });
        setSuccessMessage("");
        return;
      }
      await api.patch("/allUsers/resetPassword", body, {
        headers: {
          authorization: `Bearer ${resetToken}`, // Ensure this is sent!
        },
      });
      setSuccessMessage(
        "Password has been reset successfully. Redirecting to sign in..."
      );
      setErrors({});
      localStorage.removeItem("resetToken");
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (err) {
      setSuccessMessage("");
      if (err.response && err.response.data && err.response.data.message) {
        setErrors({ general: err.response.data.message });
      } else {
        setErrors({ general: "Could not reset password. Please try again." });
      }
    }
  };

  return (
    // Outer container: Full screen height, Flexbox to center content
    <div className="flex min-h-screen w-full items-center justify-center bg-[#D5CFE1] p-4 text-primary">
      {/* The Card: White background, rounded corners, shadow, max-width */}
      <div className="w-full max-w-md rounded-[30px] bg-white p-8 shadow-lg md:p-10">
        <h2 className="mb-8 text-center text-2xl font-bold text-gray-800">
          Set New Password
        </h2>

        {/* Success Message Display */}
        {successMessage && (
          <p className="mb-4 text-center font-medium text-green-600">
            {successMessage}
          </p>
        )}

        {/* General Error Display (e.g., API errors, password mismatch) */}
        {errors.general && (
          <p className="mb-4 text-center font-medium text-red-500">
            {errors.general}
          </p>
        )}

        <form onSubmit={handleSubmission} className="space-y-6">
          {/* Password Input */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="ml-1 block font-bold text-gray-900"
            >
              Password:
            </label>
            <input
              type="password"
              id="password"
              required
              placeholder="Enter new password (min 8 characters)"
              value={passwordData.password}
              className="w-full rounded-full border border-gray-400 bg-transparent px-5 py-3 text-base text-gray-800 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
              onChange={(e) => {
                setPasswordData({ ...passwordData, password: e.target.value });
                setErrors({});
                setSuccessMessage("");
              }}
            />
            {errors.password && (
              <p className="ml-1 text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password Input */}
          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="ml-1 block font-bold text-gray-900"
            >
              Confirm Password:
            </label>
            <input
              type="password"
              id="confirmPassword"
              required
              placeholder="Confirm new password"
              value={passwordData.confirmPassword}
              className="w-full rounded-full border border-gray-400 bg-transparent px-5 py-3 text-base text-gray-800 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
              onChange={(e) => {
                setPasswordData({
                  ...passwordData,
                  confirmPassword: e.target.value,
                });
                setErrors({});
                setSuccessMessage("");
              }}
            />
            {errors.confirmPassword && (
              <p className="ml-1 text-sm text-red-500">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full rounded-full border border-primary/40 bg-white px-6 py-3 text-lg font-semibold tracking-wide text-primary shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-gray-50"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}
