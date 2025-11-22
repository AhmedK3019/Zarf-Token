const events = [
  "Ras El Hekma Trip - Class of '25",
  "Gouna Getaway - Class of '23",
  "Microsoft Headquarters Visit - Smart Village",
  "Pyramids Exploration Trip - Giza",
  "Alexandria Coastal Excursion - Bibliotheca Tour",
  "Siwa Oasis Retreat - Desert Safari Adventure",
  "Red Sea Diving Adventure - Hurghada",
  "Oracle Egypt Office Tour - Smart Village",
  "Amazon Web Services Cloud Experience - Smart Village",
  "Campus Sustainability Fair - Green Future Day",
  "Innovation Hackathon - C Building",
  "Tech Career Fair - GIU Campus",
];

const EventTicker = () => {
  return (
    <div className="w-full bg-[#001845] text-white shadow-[0_12px_35px_rgba(115,108,237,0.25)]">
      <div className="ticker-container">
        <div className="ticker-track">
          {[...events, ...events].map((event, index) => (
            <span key={`${index}-${event}`} className="ticker-item">
              {event}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventTicker;
