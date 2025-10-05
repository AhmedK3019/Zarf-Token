import Hero from "../components/Hero";
import EventTicker from "../components/EventTicker";

const LandingPage = () => {
  return (
    <div className="min-h-screen w-full overflow-hidden bg-info/20 text-primary">
      <div className="relative flex min-h-screen w-full flex-col items-center">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-30%] h-[420px] w-[120%] -translate-x-1/2 rounded-[55%] bg-gradient-to-r from-info/40 via-info/20 to-info/35 blur-3xl" />
          <div className="absolute bottom-[-22%] left-1/2 h-[360px] w-[110%] -translate-x-1/2 rounded-[50%] bg-gradient-to-br from-info/45 via-info/25 to-info/40 blur-3xl" />
        </div>

        <div className="relative z-20 w-full">
          <EventTicker />
        </div>
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
