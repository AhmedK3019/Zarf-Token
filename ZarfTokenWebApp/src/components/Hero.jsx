import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative z-10 flex w-full flex-1 items-center justify-center px-6 py-10 md:py-12">
      <div className="relative flex w-full max-w-6xl flex-col gap-12 md:flex-row md:items-center">
        <div className="max-w-xl space-y-6 text-left">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-[#5A4BBA] shadow-[0_10px_25px_rgba(165,148,249,0.3)]">
            <span className="h-2 w-2 rounded-full bg-[#6DD3CE]" />
            <span>Campus events reimagined</span>
          </div>
          <h1 className="text-4xl font-bold text-[#4C3BCF] sm:text-5xl lg:text-6xl">
            Turn your campus buzz into unforgettable experiences
          </h1>
          <p className="text-base text-[#312A68] sm:text-lg">
            Zarf Token keeps your community in sync. Plan, publish, and track university events with real-time insights, seamless registrations, and automated reminders all in one beautifully simple hub.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              to="/events"
              className="inline-flex items-center justify-center rounded-full bg-[#736CED] px-7 py-3 text-sm font-semibold text-white shadow-[0_15px_35px_rgba(115,108,237,0.35)] transition-transform hover:-translate-y-0.5 hover:bg-[#5A4BBA]"
            >
              Browse Events
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center justify-center rounded-full border border-[#736CED] bg-white px-7 py-3 text-sm font-semibold text-[#736CED] transition-all hover:bg-[#E7E1FF]"
            >
              Learn More
            </Link>
          </div>
        </div>

        <div className="relative flex flex-1 justify-center">
          <div className="relative h-[280px] w-[280px] rounded-[40px] bg-gradient-to-br from-[#9F8BFF] via-[#736CED] to-[#6DD3CE] shadow-[0_30px_60px_rgba(115,108,237,0.45)] md:h-[320px] md:w-[320px] lg:h-[360px] lg:w-[360px]">
            <div className="absolute -top-10 left-1/2 h-20 w-20 -translate-x-1/2 rounded-3xl border border-white/70 bg-white/80 backdrop-blur shadow-[0_15px_35px_rgba(165,148,249,0.4)]" />
            <div className="absolute -bottom-12 left-6 right-6 h-20 rounded-full bg-white/70 backdrop-blur shadow-[0_15px_45px_rgba(109,211,206,0.45)]" />
            <div className="absolute inset-6 rounded-[32px] border border-white/50 bg-white/10 backdrop-blur" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

