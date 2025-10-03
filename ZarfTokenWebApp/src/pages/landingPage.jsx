import Hero from "../components/Hero";
import EventTicker from "../components/EventTicker";

const LandingPage = () => {
  return (
    <div className="min-h-screen w-full overflow-hidden bg-muted text-primary">
      <div className="relative flex min-h-screen w-full flex-col items-center">
        <div className="relative z-20 w-full">
          <EventTicker />
        </div>
        <main className="relative z-10 flex w-full flex-1 items-center justify-center px-6">
          <Hero />
        </main>
        <footer className="relative z-10 w-full px-6 py-6 text-center text-sm text-primary/70">
          {new Date().getFullYear()} Zarf Token. All rights reserved.
        </footer>
        <div className="pointer-events-none absolute bottom-[-12%] left-1/2 h-64 w-[130%] -translate-x-1/2 rounded-[50%] bg-gradient-to-r from-primary via-info to-secondary opacity-70 -z-10" />
      </div>
    </div>
  );
};

export default LandingPage;

