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

export default { getAllEvents };
