import Trip from "../models/Trip.js";
import User from "../models/User.js"; // Needed for wallet operations
import Joi from "joi";
import Stripe from "stripe";
import { sendPaymentReceiptEmail } from "../utils/mailer.js";

const TripSchema = Joi.object({
  tripname: Joi.string().required(),
  startdate: Joi.date().required(),
  starttime: Joi.string().required(),
  enddate: Joi.date().required(),
  endtime: Joi.string().required(),
  location: Joi.string().required(),
  shortdescription: Joi.string().required(),
  registerationdeadline: Joi.date().required(),
  price: Joi.number().required(),
  capacity: Joi.number().required(),
  attendees: Joi.array().default([]),
  ratings: Joi.array().default([]),
  comments: Joi.array().default([]),
  archive: Joi.boolean().default(false),
});

const attendeesSchema = Joi.object({
  firstname: Joi.string().min(3).max(13).required(),
  lastname: Joi.string().min(3).max(13).required(),
  gucid: Joi.string().required(),
  email: Joi.string()
    .email()
    .required()
    .pattern(
      /^[a-zA-Z0-9._%+-]+(\.[a-zA-Z0-9._%+-]+)*@([a-zA-Z0-9-]+\.)*guc\.edu\.eg$/i
    )
    .messages({
      "string.pattern.base":
        "Email must be a valid GUC email (ending with .guc.edu.eg)",
    }),
});

const createTrip = async (req, res, next) => {
  try {
    const { value, error } = TripSchema.validate(req.body);
    if (error) return res.json({ message: error.message });
    const doc = await Trip.create(value);
    return res.json({ trip: doc });
  } catch (err) {
    next(err);
  }
};

const getAllTrips = async (_req, res, next) => {
  try {
    const doc = await Trip.find();
    return res.json({ trips: doc });
  } catch (err) {
    next(err);
  }
};

const getTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await Trip.findById({ _id: id });
    return res.json({ trip: doc });
  } catch (err) {
    next(err);
  }
};

const updateTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { value, error } = TripSchema.validate(req.body);
    if (error) return res.json({ message: error.message });
    const doc = await Trip.findByIdAndUpdate(
      id,
      { $set: value },
      { new: true }
    );
    return res.json({ trip: doc });
  } catch (err) {
    next(err);
  }
};

const deleteTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Trip.findByIdAndDelete(id);
    return res.json({ message: "Trip is successfully deleted" });
  } catch (err) {
    next(err);
  }
};

const registerForTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "No token provided" });
    const check = await Trip.findById(id, {
      capacity: 1,
      attendees: 1,
      registered: 1,
    });
    if (!check) return res.status(404).json({ message: "Trip is not found" });
    if (
      check.attendees.some((a) => a.userId?.toString() === userId.toString()) ||
      check.registered.some((a) => a.userId?.toString() === userId.toString())
    ) {
      return res
        .status(400)
        .json({ message: "You already registered for this trip" });
    }
    if (check.attendees.length + 1 > check.capacity) {
      return res.status(400).json({ message: "Trip is full" });
    }
    const { value, error } = attendeesSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });
    const body = {
      userId: userId,
      firstname: value.firstname,
      lastname: value.lastname,
      gucid: value.gucid,
      email: value.email,
    };
    const afterUpdate = await Trip.findByIdAndUpdate(
      id,
      { $addToSet: { registered: body } },
      { new: true }
    );
    return res
      .status(200)
      .json({ message: "done updating", trip: afterUpdate });
  } catch (error) {
    next(error);
  }
};

const cancelRegistration = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "No token provided" });
    const trip = await Trip.findById(id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    const isRegistered = trip.attendees.some(
      (a) => a.userId?.toString() === userId.toString()
    );
    if (!isRegistered) {
      return res
        .status(400)
        .json({ message: "You are not registered for this trip" });
    }

    const updatedTrip = await Trip.findByIdAndUpdate(
      id,
      { $pull: { attendees: { userId: userId } } },
      { new: true }
    );

    await User.findByIdAndUpdate(
      userId,
      { $inc: { wallet: trip.price } },
      { new: true }
    );
    return res.status(200).json({
      message: "Registration cancelled successfully",
      trip: updatedTrip,
    });
  } catch (error) {
    next(error);
  }
};

const payForTrip = async (req, res, next) => {
  // Handles three methods: wallet (instant), stripe (create checkout), creditcard (legacy mock)
  try {
    const { id } = req.params;
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "No token provided" });
    const trip = await Trip.findById(id);
    const method = req.body.method; // 'wallet' | 'stripe' | 'creditcard'
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    const attendee = trip.registered.find(
      (a) => a.userId.toString() === userId.toString()
    );
    if (!attendee)
      return res
        .status(404)
        .json({ message: "You are not registered for this trip" });
    if (attendee.paid)
      return res.status(400).json({ message: "You have already paid" });

    if (method === "wallet") {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      if (user.wallet < trip.price) {
        return res.status(400).json({ message: "Insufficient funds" });
      }
      user.wallet -= trip.price;
      await user.save();
      attendee.paid = true;
      trip.attendees.push(attendee);
      trip.registered = trip.registered.filter(
        (a) => a.userId.toString() !== userId.toString()
      );
      await trip.save();
      // Send receipt email (non-blocking best-effort)
      try {
        await sendPaymentReceiptEmail({
          to: attendee.email,
          name: `${attendee.firstname} ${attendee.lastname}`.trim(),
          eventType: "trip",
          eventName: trip.tripname,
          amount: trip.price,
          currency: "EGP",
          paymentMethod: "Wallet",
        });
      } catch (e) {
        console.error("Failed to send trip wallet receipt:", e?.message || e);
      }
      return res.status(200).json({ message: "Payment successful", trip });
    } else if (method === "stripe") {
      // Create Stripe Checkout Session and return URL (do NOT mark paid yet; webhook will finalize)
      if (!process.env.STRIPE_SECRET_KEY) {
        return res
          .status(500)
          .json({ message: "Stripe is not configured on the server" });
      }
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          mode: "payment",
          line_items: [
            {
              price_data: {
                currency: "egp",
                product_data: { name: trip.tripname },
                unit_amount: Math.round(trip.price * 100),
              },
              quantity: 1,
            },
          ],
          success_url: `${
            process.env.FRONTEND_URL || "http://localhost:5173"
          }/payment-success?type=trip&id=${id}&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${
            process.env.FRONTEND_URL || "http://localhost:5173"
          }/payment-cancelled?type=trip&id=${id}`,
          metadata: { userId, tripId: id, type: "trip" },
        });
        return res
          .status(200)
          .json({ url: session.url, sessionId: session.id });
      } catch (stripeErr) {
        console.error("Stripe session creation failed", stripeErr);
        return res
          .status(500)
          .json({ message: "Failed to create Stripe session" });
      }
    } else if (method === "creditcard") {
      // Legacy mock path retained for backward compatibility
      attendee.paid = true;
      trip.attendees.push(attendee);
      trip.registered = trip.registered.filter(
        (a) => a.userId.toString() !== userId.toString()
      );
      await trip.save();
      try {
        await sendPaymentReceiptEmail({
          to: attendee.email,
          name: `${attendee.firstname} ${attendee.lastname}`.trim(),
          eventType: "trip",
          eventName: trip.tripname,
          amount: trip.price,
          currency: "EGP",
          paymentMethod: "Credit Card (Mock)",
        });
      } catch (e) {
        console.error(
          "Failed to send trip creditcard receipt:",
          e?.message || e
        );
      }
      return res
        .status(200)
        .json({ message: "Mock credit card payment successful", trip });
    } else {
      return res.status(400).json({ message: "Unsupported payment method" });
    }
  } catch (error) {
    next(error);
  }
};

export default {
  createTrip,
  updateTrip,
  deleteTrip,
  getAllTrips,
  getTrip,
  registerForTrip,
  cancelRegistration,
  payForTrip,
};
