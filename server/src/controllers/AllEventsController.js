import Workshop from "../models/Workshop.js";
import Bazaar from "../models/Bazaar.js";
import Conference from "../models/Conference.js";
import Trip from "../models/Trip.js";
import Booth from "../models/Booth.js";
import { sendCommentDeletionNotification } from "../utils/mailer.js";
import User from "../models/User.js";
import Admin from "../models/Admin.js";
import EventsOffice from "../models/EventsOffice.js";
import userController from "./userController.js";
import * as XLSX from "xlsx/xlsx.mjs";
const getAllEvents = async (req, res, next) => {
  try {
    const role = req.userRole;
    if (!role)
      return res.status(401).json({ message: "You are not authorized" });
    let filter = { archive: false, allowedusers: role };
    const workshops = await Workshop.find(filter)
      .populate("professorsparticipating", "firstname lastname email")
      .populate("createdBy", "firstname lastname email");
    const Bazzars = await Bazaar.find(filter);
    const Conferences = await Conference.find(filter);
    const Trips = await Trip.find(filter);
    const Booths = await Booth.find(filter)
      .populate("vendorId")
      .populate("bazarId");
    return res
      .status(200)
      .json([...workshops, ...Bazzars, ...Conferences, ...Trips, ...Booths]);
  } catch (error) {
    next(error);
  }
};

const getEventsByType = async (req, res, next) => {
  try {
    const role = req.userRole;
    if (!role)
      return res.status(401).json({ message: "You are not authorized" });
    const { type } = req.params;
    let events;
    let filter = { archive: false, allowedusers: role };
    switch (type) {
      case "workshops":
        events = await Workshop.find(filter)
          .populate("professorsparticipating", "firstname lastname email")
          .populate("createdBy", "firstname lastname email");
        break;
      case "bazaars":
        events = await Bazaar.find(filter);
        break;
      case "conferences":
        events = await Conference.find(filter);
        break;
      case "trips":
        events = await Trip.find(filter);
        break;
      case "booths":
        events = await Booth.find(filter)
          .populate("vendorId")
          .populate("bazarId");
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
    let filter = { archive: false };
    const workshops = await Workshop.find(filter)
      .populate("professorsparticipating", "firstname lastname email")
      .populate("createdBy", "firstname lastname email");
    const trips = await Trip.find(filter);
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
    let ratings;
    switch (type) {
      case "trip":
        ratings = await Trip.findById(id, { ratings: 1 });
        break;
      case "workshop":
        ratings = await Workshop.findById(id, { ratings: 1 });
        break;
      case "conference":
        ratings = await Conference.findById(id, { ratings: 1 });
        break;
      case "bazaar":
        ratings = await Bazaar.findById(id, { ratings: 1 });
        break;
      case "booth":
        ratings = await Booth.findById(id, { ratings: 1 });
        break;
    }

    if (ratings?.ratings) {
      const populatedRatings = await Promise.all(
        ratings.ratings.map(async (rating) => {
          if (rating.userId) {
            let user = await User.findById(
              rating.userId,
              "firstname lastname"
            ).lean();

            return {
              ...rating.toObject(),
              userId: user || {
                _id: rating.userId,
                firstname: "Unknown",
                lastname: "User",
              },
            };
          }
          return rating.toObject();
        })
      );
      ratings = {
        ...ratings.toObject(),
        ratings: populatedRatings,
      };
    }

    return res.status(200).json(ratings);
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
        break;
      case "workshop":
        model = Workshop;
        break;
      case "bazaar":
        model = Bazaar;
        break;
      case "booth":
        model = Booth;
        break;
      case "conference":
        model = Conference;
        break;
      default:
        return res.status(400).json({ message: "Invalid type" });
    }
    let event = await model.findById(id);
    if (!event) return res.stauts(404).json({ message: "Event not found" });
    // if (new Date(event.enddate) - new Date() > 0) {
    //   return res.json({ message: "Event start date has not passed yet" });
    // }
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
const getArchivedEvents = async (_req, res, next) => {
  try {
    let filter = { archive: true };
    const [trips, workshops, bazaars, booths, conferences] = await Promise.all([
      Trip.find(filter),
      Workshop.find(filter),
      Bazaar.find(filter),
      Booth.find(filter),
      Conference.find(filter),
    ]);
    let events = [
      ...trips,
      ...workshops,
      ...bazaars,
      ...booths,
      ...conferences,
    ];
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
      case "booth":
        model = Booth;
        break;
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

const notifyOneDayPrior = async () => {
  try {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const startOfTomorrow = new Date(startOfToday.getTime() + ONE_DAY_MS);
    const endOfTomorrow = new Date(startOfTomorrow.getTime() + ONE_DAY_MS);

    const query = {
      archive: false,
      startdate: {
        $gte: startOfTomorrow,
        $lt: endOfTomorrow,
      },
    };
    const [workshops, trips] = await Promise.all([
      Workshop.find(query).select("workshopname attendees registered"),
      Trip.find(query).select("tripname attendees registered"),
    ]);

    const events = [...workshops, ...trips];

    for (const event of events) {
      const eventName = event.workshopname || event.tripname;
      const message = `${eventName} is starting in one day.`;
      const attendeeIds = (event.attendees || []).map((a) => a.userId);
      const registeredIds = (event.registered || []).map((r) => r.userId);
      const uniqueUserIds = new Set([...attendeeIds, ...registeredIds]);
      for (const userId of uniqueUserIds) {
        if (!userId) continue;

        try {
          await userController.updateNotifications(userId, message);
        } catch (notificationError) {
          console.error(
            `Error notifying user ${userId} for event ${eventName}:`,
            notificationError.message
          );
        }
      }
    }
  } catch (error) {
    console.error(
      "The notifyOneDayPrior cron job failed:",
      error.message || error
    );
  }
};

// NOTE: Assuming ONE_HOUR_MS is defined in a scope accessible to this function.
// For example: const ONE_HOUR_MS = 60 * 60 * 1000;

const notifyOneHourPrior = async () => {
  // Define constants within the function scope if they aren't global
  const ONE_HOUR_MS = 60 * 60 * 1000;
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const TOLERANCE_MS = 1000 * 60 * 5; // 5 minutes tolerance

  try {
    const now = new Date().getTime();
    const minTimeMs = now + ONE_HOUR_MS - TOLERANCE_MS;
    const maxTimeMs = now + ONE_HOUR_MS + TOLERANCE_MS;
    const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));
    const twoDaysFromNow = new Date(startOfToday.getTime() + 2 * ONE_DAY_MS);

    const preliminaryQuery = {
      archive: false,
      startdate: {
        $gte: startOfToday,
        $lt: twoDaysFromNow,
      },
    };
    const [workshops, trips] = await Promise.all([
      Workshop.find(preliminaryQuery).select(
        "startdate starttime workshopname attendees registered"
      ),
      Trip.find(preliminaryQuery).select(
        "startdate starttime tripname attendees registered"
      ),
    ]);

    const allEvents = [...workshops, ...trips];
    const eventsOneHourPrior = allEvents.filter((event) => {
      const startDate = new Date(event.startdate);
      const [hours, minutes] = (event.starttime || "00:00")
        .split(":")
        .map(Number);
      startDate.setHours(hours, minutes, 0, 0);
      const eventTimeMs = startDate.getTime();
      return eventTimeMs >= minTimeMs && eventTimeMs <= maxTimeMs;
    });

    for (const event of eventsOneHourPrior) {
      const eventName = event.workshopname || event.tripname;
      const message = `${eventName} is starting in one hour.`;
      const attendeeIds = (event.attendees || []).map((a) => a.userId);
      const registeredIds = (event.registered || []).map((r) => r.userId);
      const uniqueUserIds = new Set([...attendeeIds, ...registeredIds]);
      for (const userId of uniqueUserIds) {
        if (!userId) continue;

        try {
          await userController.updateNotifications(userId, message);
        } catch (notificationError) {
          console.error(
            `Error notifying user ${userId} for event ${eventName}:`,
            notificationError.message
          );
        }
      }
    }
  } catch (error) {
    console.error(
      "The notifyOneHourPrior cron job failed:",
      error.message || error
    );
  }
};

const excelRegisterdPeople = async (req, res, next) => {
  try {
    const { id, type } = req.params;
    let model;
    switch (type) {
      case "workshop":
        model = Workshop;
        break;
      case "trip":
        model = Trip;
        break;
      default:
        return res.status(404).json({ message: "Invalid type" });
    }
    const event = await model.findById(id);
    let registrationArray = event.registered;
    let attendeesArray = event.attendees;
    let i = 0;
    registrationArray = registrationArray.map((item) => {
      return {
        First_name: item.firstname,
        Last_name: item.lastname,
        Paid_status: String(item.paid).toLowerCase(),
      };
    });
    attendeesArray = attendeesArray.map((item) => {
      return {
        First_name: item.firstname,
        Last_name: item.lastname,
        Paid_status: String(item.paid).toLowerCase(),
      };
    });
    let filterArray = [...attendeesArray, ...registrationArray];
    const worksheet = XLSX.utils.json_to_sheet(filterArray);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");
    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=registrations.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    return res.send(excelBuffer);
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
  notifyOneDayPrior,
  notifyOneHourPrior,
  excelRegisterdPeople,
};
