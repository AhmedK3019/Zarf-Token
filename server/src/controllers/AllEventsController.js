import Workshop from "../models/Workshop.js";
import Bazaar from "../models/Bazaar.js";
import Conference from "../models/Conference.js";
import Trip from "../models/Trip.js";
import Booth from "../models/Booth.js";

const getAllEvents = async (_req, res, next) => {
  try {
    const workshops = await Workshop.find()
      .populate("professorsparticipating", "firstname lastname email")
      .populate("createdBy", "firstname lastname email");
    const Bazzars = await Bazaar.find();
    const Conferences = await Conference.find();
    const Trips = await Trip.find();
    const Booths = await Booth.find().populate("vendorId").populate("bazarId");
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
        events = await Workshop.find()
          .populate("professorsparticipating", "firstname lastname email")
          .populate("createdBy", "firstname lastname email");
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
        events = await Booth.find().populate("vendorId").populate("bazarId");
        break;
      default:
        return res.status(400).json({ message: "Invalid event type" });
    }
    return res.status(200).json(events);
  } catch (error) {
    next(error);
  }
};

const getEventsRegisteredByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const workshops = await Workshop.find()
      .populate("professorsparticipating", "firstname lastname email")
      .populate("createdBy", "firstname lastname email");
    const trips = await Trip.find();
    const registeredWorkshops = workshops.filter(
      (workshop) =>
        workshop.attendees.filter(
          (attendee) => attendee.userId.toString() === userId
        ).length > 0
    );
    const registeredTrips = trips.filter(
      (trip) =>
        trip.attendees.filter(
          (attendee) => attendee.userId.toString() === userId
        ).length > 0
    );
    return res.status(200).json([...registeredWorkshops, ...registeredTrips]);
  } catch (error) {
    next(error);
  }
};

const rateEvent = async (req, res, next) => {
  try {
    const { id, type } = req.params;
    const userId = req.userId;
    if (!userId)
      return res.status(401).json({ message: "You are not authorized" });
    const { rating } = req.body;
    const body = { rating: rating, userId: userId };
    switch (type) {
      case "trip":
        await Trip.findByIdAndUpdate(
          id,
          { $addToSet: { ratings: body } },
          { new: true }
        );
        break;
      case "workshop":
        await Workshop.findByIdAndUpdate(
          id,
          { $addToSet: { ratings: body } },
          { new: true }
        );
        break;
      case "bazaar":
        await Bazaar.findByIdAndUpdate(
          id,
          { $addToSet: { ratings: body } },
          { new: true }
        );
        break;
      case "conference":
        await Conference.findByIdAndUpdate(
          id,
          { $addToSet: { ratings: body } },
          { new: true }
        );
        break;
      default:
        return res.status(400).json({ message: "Invalid event type" });
    }
    return res.status(200).json({ message: "rated the event", rate: body });
  } catch (error) {
    next(error);
  }
};
const addComment = async (req, res, next) => {
  try {
    const { id, type } = req.params;
    const userId = req.userId;
    if (!userId)
      return res.status(401).json({ message: "You are not authorized" });
    const { comment } = req.body;
    const body = { comment: comment, userId: userId };
    switch (type) {
      case "trip":
        await Trip.findByIdAndUpdate(
          id,
          { $push: { comments: body } },
          { new: true }
        );
        break;
      case "workshop":
        await Workshop.findByIdAndUpdate(
          id,
          { $push: { comments: body } },
          { new: true }
        );
        break;
      case "bazaar":
        await Bazaar.findByIdAndUpdate(
          id,
          { $push: { comments: body } },
          { new: true }
        );
        break;
      case "conference":
        await Conference.findByIdAndUpdate(
          id,
          { $push: { comments: body } },
          { new: true }
        );
        break;
      default:
        return res.status(400).json({ message: "Invalid event type" });
    }
    return res.status(200).json({ message: "added a comment", comment: body });
  } catch (error) {
    next(error);
  }
};

const viewAllComments = async (req, res, next) => {
  try {
    const { id, type } = req.params;
    let comments;
    switch (type) {
      case "trip":
        comments = await Trip.findById(id, { comments: 1 });
        break;
      case "workshop":
        comments = await Workshop.findById(id, { comments: 1 });
        break;
      case "conference":
        comments = await Conference.findById(id, { comments: 1 });
        break;
      case "bazaar":
        comments = await Bazaar.findById(id, { comments: 1 });
        break;
    }
    return res.status(200).json(comments);
  } catch (error) {
    next(error);
  }
};

const viewAllRatings = async (req, res, next) => {
  try {
    const { id, type } = req.params;
    let Ratings;
    switch (type) {
      case "trip":
        Ratings = await Trip.findById(id, { ratings: 1 });
        break;
      case "workshop":
        Ratings = await Workshop.findById(id, { ratings: 1 });
        break;
      case "conference":
        Ratings = await Conference.findById(id, { ratings: 1 });
        break;
      case "bazaar":
        Ratings = await Bazaar.findById(id, { ratings: 1 });
        break;
    }
    return res.status(200).json(Ratings);
  } catch (error) {
    next(error);
  }
};
export default {
  getAllEvents,
  getEventsByType,
  getEventsRegisteredByUser,
  addComment,
  rateEvent,
  viewAllComments,
  viewAllRatings,
};
