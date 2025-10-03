import Navbar from "../components/Navbar";
import Hero from "../components/Hero";

const LandingPage = () => {
  return (
    <div className="min-h-screen w-full overflow-hidden bg-[#EEE9FF] text-[#1F1B3B]">
      <div className="relative flex min-h-screen w-full flex-col items-center">
        <Navbar />
        <main className="relative z-10 flex w-full flex-1 items-center justify-center px-6">
          <Hero />
        </main>
        <footer className="relative z-10 w-full px-6 py-6 text-center text-sm text-[#312A68]/80">
           {new Date().getFullYear()} Zarf Token. All rights reserved.
        </footer>
        <div className="pointer-events-none absolute bottom-[-12%] left-1/2 h-64 w-[130%] -translate-x-1/2 rounded-[50%] bg-gradient-to-r from-[#736CED] via-[#A594F9] to-[#6DD3CE] opacity-70 -z-10" />
      </div>
    </div>
  );
};

export default LandingPage;

