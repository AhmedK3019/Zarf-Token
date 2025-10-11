import Workshop from "../models/Workshop.js";
import Bazaar from "../models/Bazaar.js";
import Conference from "../models/Conference.js";
import Trip from "../models/Trip.js";
import Booth from "../models/Booth.js";

const getAllEvents = async (_req, res, next) => {
  try {
    const workshops = await Workshop.find();
    const Bazzars = await Bazaar.find();
    const Conferences = await Conference.find();
    const Trips = await Trip.find();
    const Booths = await Booth.find();
    console.log(workshops);
    return res
      .status(200)
      .json([...workshops, ...Bazzars, ...Conferences, ...Trips, ...Booths]);
  } catch (error) {
    next(error);
  }
};

const getEventsByType = async (req, res, next) => {
  try {
    const { type } = req.params;
    let events;
    switch (type) {
      case "workshops":
        events = await Workshop.find();
        break;
      case "bazaars":
        events = await Bazaar.find();
        break;
      case "conferences":
        events = await Conference.find();
        break;
      case "trips":
        events = await Trip.find();
        break;
      case "booths":
        events = await Booth.find();
        break;
      default:
        return res.status(400).json({ message: "Invalid event type" });
    }
    return res.status(200).json(events);
  } catch (error) {
    next(error);
  }
};

export default { getAllEvents, getEventsByType };
