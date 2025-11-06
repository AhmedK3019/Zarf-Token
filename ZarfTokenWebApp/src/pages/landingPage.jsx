import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Hero from "../components/Hero";
import EventTicker from "../components/EventTicker";
import DecorativeIcons from "../components/DecorativeIcons";

const LandingPage = () => {
  const [searchParams] = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState(null); // 'success' | 'failure' | null

  useEffect(() => {
    const verified = searchParams.get("verified");
    if (verified === "1") setVerificationStatus("success");
    else if (verified === "0") setVerificationStatus("failure");

    if (verified) {
      const t = setTimeout(() => setVerificationStatus(null), 7000);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [searchParams]);

  // Decorative icons configuration for landing page
  // Icons positioned away from center (40-60%) where form/text content is
  const landingIcons = [
    // Left side - far from center content
    { type: "sun", left: "2%", top: "10%", size: 60, rotate: 15 },
    { type: "palmTree", left: "5%", top: "20%", size: 70, rotate: -10 },
    { type: "beachBall", left: "3%", top: "40%", size: 45, rotate: 20 },
    { type: "sunglasses", left: "3%", top: "60%", size: 50, rotate: -15 },
    { type: "waves", left: "10%", top: "75%", size: 80, rotate: 0 },
    { type: "star", left: "60%", top: "15%", size: 40, rotate: 25 },
    { type: "microphone", left: "10%", top: "10%", size: 55, rotate: -20 },
    { type: "trophy", left: "3%", top: "30%", size: 50, rotate: 10 },
    { type: "camera", left: "7%", top: "50%", size: 45, rotate: -25 },
    { type: "musicNote", left: "4%", top: "70%", size: 50, rotate: 15 },
    { type: "calendar", left: "18%", top: "15%", size: 40, rotate: -10 },
    { type: "locationPin", left: "6%", top: "55%", size: 45, rotate: 5 },
    { type: "balloon", left: "22%", top: "8%", size: 50, rotate: -30 },
    { type: "confetti", left: "5%", top: "35%", size: 55, rotate: 20 },
    { type: "ticket", left: "17%", top: "75%", size: 40, rotate: 12 },
    { type: "star", left: "13%", top: "20%", size: 35, rotate: -18 },
    // Right side - far from center content
    { type: "star", left: "88%", top: "15%", size: 40, rotate: -20 },
    { type: "microphone", left: "92%", top: "25%", size: 55, rotate: 15 },
    { type: "trophy", left: "85%", top: "45%", size: 50, rotate: -12 },
    { type: "camera", left: "90%", top: "65%", size: 45, rotate: 25 },
    { type: "musicNote", left: "87%", top: "82%", size: 50, rotate: -18 },
    { type: "balloon", left: "93%", top: "12%", size: 52, rotate: 20 },
    { type: "sun", left: "95%", top: "35%", size: 55, rotate: -25 },
    { type: "waves", left: "89%", top: "55%", size: 70, rotate: 0 },
    { type: "palmTree", left: "83%", top: "70%", size: 65, rotate: 10 },
    { type: "beachBall", left: "91%", top: "50%", size: 48, rotate: -15 },
    { type: "sunglasses", left: "86%", top: "18%", size: 50, rotate: 22 },
    { type: "calendar", left: "94%", top: "60%", size: 42, rotate: -8 },
    { type: "locationPin", left: "88%", top: "75%", size: 46, rotate: 12 },
    { type: "confetti", left: "88%", top: "30%", size: 58, rotate: -20 },
    { type: "ticket", left: "96%", top: "42%", size: 44, rotate: 18 },
    // Top and bottom edges - avoiding center
    { type: "star", left: "35%", top: "9%", size: 38, rotate: 30 },
    { type: "musicNote", left: "85%", top: "10%", size: 45, rotate: -25 },
    { type: "balloon", left: "30%", top: "92%", size: 50, rotate: 15 },
    { type: "camera", left: "70%", top: "90%", size: 48, rotate: -22 },
  ];

  return (
    <div className="min-h-screen w-full overflow-hidden bg-[#D5CFE1] text-primary">
      <div className="relative flex min-h-screen w-full flex-col items-center">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-30%] h-[420px] w-[120%] -translate-x-1/2 rounded-[55%] bg-gradient-to-r from-info/40 via-info/20 to-info/35 blur-3xl" />
          <div className="absolute bottom-[-22%] left-1/2 h-[360px] w-[110%] -translate-x-1/2 rounded-[50%] bg-gradient-to-br from-info/45 via-info/25 to-info/40 blur-3xl" />
        </div>

        {/* Decorative Icons */}
        <DecorativeIcons icons={landingIcons} iconColor="text-primary/15" />

        <div className="relative z-20 w-full">
          <EventTicker />
        </div>

        {/* Verification banner (shown after email verification redirect) */}
        {verificationStatus && (
          <div className="w-full px-6 pt-6">
            <div
              className={`mx-auto max-w-3xl rounded-lg px-4 py-3 text-center text-sm font-medium ${
                verificationStatus === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                  : "bg-rose-50 text-rose-800 border border-rose-100"
              }`}
            >
              {verificationStatus === "success" && (
                <span>
                  Your email was verified successfully. You can now sign in.
                </span>
              )}
              {verificationStatus === "failure" && (
                <span>
                  Verification failed or the link expired. Please try signing up
                  again.
                </span>
              )}
            </div>
          </div>
        )}

        <main className="relative z-10 flex w-full flex-1 items-center justify-center px-6">
          <Hero />
        </main>
        <footer className="relative z-10 w-full px-6 py-6 text-center text-sm text-primary/70">
          {new Date().getFullYear()} Zarf Token. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
