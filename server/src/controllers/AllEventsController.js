import Workshop from "../models/Workshop.js";
import Bazaar from "../models/Bazaar.js";
import Conference from "../models/Conference.js";
import Trip from "../models/Trip.js";
import Booth from "../models/Booth.js";
import { sendCommentDeletionNotification } from "../utils/mailer.js";
import User from "../models/User.js";
import Admin from "../models/Admin.js";
import EventsOffice from "../models/EventsOffice.js";

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
        ).length > 0 ||
        workshop.registered.filter(
          (registrant) => registrant.userId.toString() === userId
        ).length > 0
    );
    const registeredTrips = trips.filter(
      (trip) =>
        trip.attendees.filter(
          (attendee) => attendee.userId.toString() === userId
        ).length > 0 ||
        trip.registered.filter(
          (registrant) => registrant.userId.toString() === userId
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
    if (!rating)
      return res.status(400).json({ message: "Rating value is required" });

    const body = { rating, userId };

    let model;
    switch (type) {
      case "trip":
        model = Trip;
        break;
      case "workshop":
        model = Workshop;
        break;
      case "bazaar":
        model = Bazaar;
        break;
      case "conference":
        model = Conference;
        break;
      case "booth":
        model = Booth;
        break;
      default:
        return res.status(400).json({ message: "Invalid event type" });
    }

    let event = await model.findById(id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    //remove
    await model.findByIdAndUpdate(
      id,
      {
        $pull: { ratings: { userId: userId } },
      },
      { new: true }
    );

    //add
    await model.findByIdAndUpdate(
      id,
      {
        $push: { ratings: body },
      },
      { new: true }
    );

    return res.status(200).json({
      message: "Event rated successfully",
      rating: body,
    });
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
          { $push: { userComments: body } },
          { new: true }
        );
        break;
      case "workshop":
        await Workshop.findByIdAndUpdate(
          id,
          { $push: { userComments: body } },
          { new: true }
        );
        break;
      case "bazaar":
        await Bazaar.findByIdAndUpdate(
          id,
          { $push: { userComments: body } },
          { new: true }
        );
        break;
      case "conference":
        await Conference.findByIdAndUpdate(
          id,
          { $push: { userComments: body } },
          { new: true }
        );
        break;
      case "booth":
        await Booth.findByIdAndUpdate(
          id,
          { $push: { userComments: body } },
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
        comments = await Trip.findById(id, { userComments: 1 });
        break;
      case "workshop":
        comments = await Workshop.findById(id, { userComments: 1 });
        break;
      case "conference":
        comments = await Conference.findById(id, { userComments: 1 });
        break;
      case "bazaar":
        comments = await Bazaar.findById(id, { userComments: 1 });
        break;
      case "booth":
        comments = await Booth.findById(id, { userComments: 1 });
        break;
    }

    if (comments?.userComments) {
      const populatedComments = await Promise.all(
        comments.userComments.map(async (comment) => {
          if (comment.userId) {
            let user = await User.findById(
              comment.userId,
              "firstname lastname"
            ).lean();

            if (!user) {
              user = await Admin.findById(
                comment.userId,
                "firstname lastname"
              ).lean();
            }
            if (!user) {
              user = await EventsOffice.findById(
                comment.userId,
                "firstname lastname"
              ).lean();
            }

            return {
              ...comment.toObject(),
              userId: user || {
                _id: comment.userId,
                firstname: "Unknown",
                lastname: "User",
              },
            };
          }
          return comment.toObject();
        })
      );
      comments = {
        ...comments.toObject(),
        userComments: populatedComments,
      };
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
      case "booth":
        Ratings = await Booth.findById(id, { ratings: 1 });
        break;
    }
    return res.status(200).json(Ratings);
  } catch (error) {
    next(error);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const { id, commentid, type } = req.params;
    let deletedComment;
    let event;
    switch (type) {
      case "trip":
        event = await Trip.findById(id);
        if (!event) return res.status(404).json({ message: "Event not found" });
        deletedComment = event.userComments.id(commentid);
        if (!deletedComment)
          return res.status(404).json({ message: "Comment not found" });
        console.log("here");
        await Trip.findByIdAndUpdate(
          id,
          {
            $pull: { userComments: { _id: commentid } },
          },
          { new: true }
        );
        break;
      case "workshop":
        event = await Workshop.findById(id);
        if (!event) return res.status(404).json({ message: "Event not found" });
        deletedComment = event.userComments.id(commentid);
        if (!deletedComment)
          return res.status(404).json({ message: "Comment not found" });
        await Workshop.findByIdAndUpdate(
          id,
          {
            $pull: { userComments: { _id: commentid } },
          },
          { new: true }
        );
        break;
      case "bazaar":
        event = await Bazaar.findById(id);
        if (!event) return res.status(404).json({ message: "Event not found" });
        deletedComment = event.userComments.id(commentid);
        if (!deletedComment)
          return res.status(404).json({ message: "Comment not found" });
        await Bazaar.findByIdAndUpdate(
          id,
          {
            $pull: { userComments: commentid },
          },
          { new: true }
        );
        break;
      case "conference":
        event = await Conference.findById(id);
        if (!event) return res.status(404).json({ message: "Event not found" });
        deletedComment = event.userComments.id(commentid);
        if (!deletedComment)
          return res.status(404).json({ message: "Comment not found" });
        await Conference.findByIdAndUpdate(
          id,
          {
            $pull: { userComments: { _id: commentid } },
          },
          { new: true }
        );
        break;
      case "booth":
        event = await Booth.findById(id);
        if (!event) return res.status(404).json({ message: "Event not found" });
        deletedComment = event.userComments.id(commentid);
        if (!deletedComment)
          return res.status(404).json({ message: "Comment not found" });
        await Booth.findByIdAndUpdate(
          id,
          {
            $pull: { userComments: { _id: commentid } },
          },
          { new: true }
        );
        break;
    }
    sendCommentDeletionNotification(deletedComment, event);
    return res.json({ message: "Comment is deleted", deletedComment });
  } catch (error) {
    next(error);
  }
};

const removeRate = async (req, res, next) => {
  try {
    const { id, rateid, type } = req.params;
    let deletedRating;
    switch (type) {
      case "trip":
        deletedRating = await Trip.findByIdAndUpdate(id, {
          $pull: { ratings: { _id: rateid } },
        });
        break;
      case "workshop":
        deletedRating = await Workshop.findByIdAndUpdate(id, {
          $pull: { ratings: { _id: rateid } },
        });
        break;
      case "bazaar":
        deletedRating = await Bazaar.findByIdAndUpdate(id, {
          $pull: { ratings: { _id: rateid } },
        });
        break;
      case "conference":
        deletedRating = await Conference.findByIdAndUpdate(id, {
          $pull: { ratings: { _id: rateid } },
        });
        break;
      case "booth":
        deletedRating = await Booth.findByIdAndUpdate(id, {
          $pull: { ratings: { _id: rateid } },
        });
        break;
    }
    return res.json({ message: "Comment is deleted", deletedRating });
  } catch (error) {
    next(error);
  }
};

const archiveEvent = async (req, res, next) => {
  try {
    const { id, type } = req.params;
    let model;
    switch (type) {
      case "trip":
        model = Trip;
        console.log("trip");
        break;
      case "workshop":
        model = Workshop;
        break;
      case "bazaar":
        model = Bazaar;
        break;
      // case "booth":
      //   model = Booth;
      //   break;
      case "conference":
        model = Conference;
        break;
      default:
        return res.status(400).json({ message: "Invalid type" });
    }
    let event = await model.findById(id);
    if (!event) return res.stauts(404).json({ message: "Event not found" });
    if (new Date(event.startdate) - new Date() > 0) {
      return res.json({ message: "Event start date has not passed yet" });
    }
    let result = await model.findByIdAndUpdate(
      id,
      { archive: true },
      { new: true }
    );
    return res
      .status(200)
      .json({ message: "Event is archived successfully", result });
  } catch (error) {
    next(error);
  }
};
const getArchivedEvents = async (req, res, next) => {
  try {
    let events = [];
    let trips = await Trip.find({ archive: true });
    let workshops = await Workshop.find({ archive: true });
    let bazaars = await Bazaar.find({ archive: true });
    let booths = await Booth.find({ archive: true });
    let conferences = await Conference.find({ archive: true });
    events = [...trips, ...workshops, ...bazaars, ...booths, ...conferences];
    return res.status(200).json(events);
  } catch (error) {
    next(error);
  }
};

const unArchiveEvent = async (req, res, next) => {
  try {
    const { id, type } = req.params;
    let model;
    switch (type) {
      case "trip":
        model = Trip;
        break;
      case "workshop":
        model = Workshop;
        break;
      case "bazaar":
        model = Bazaar;
        break;
      // case "booth":
      //   model = Booth;
      //   break;
      case "conference":
        model = Conference;
        break;
      default:
        return res.status(400).json({ message: "Invalid type" });
    }
    let event = await model.findById(id);
    if (!event) return res.satuts(404).json({ message: "Event not found" });
    let result = await model.findByIdAndUpdate(
      id,
      { $set: { archive: false } },
      { new: true }
    );
    return res
      .status(200)
      .json({ message: "Event is unarchived successfully", result });
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
  deleteComment,
  removeRate,
  archiveEvent,
  getArchivedEvents,
  unArchiveEvent,
};
