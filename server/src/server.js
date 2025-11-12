import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import boothRoutes from "./routes/boothRoutes.js";
import authMiddleware from "./middleware/auth.js";
import loyaltyRoutes from "./routes/loyaltyRoutes.js";
import reservationRoutes from "./routes/reservationRoutes.js";
import courtRoutes from "./routes/courtRoutes.js";
import gymSessionRoutes from "./routes/gymSessionRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import eventsOfficeRoutes from "./routes/eventsOfficeRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import cron from "node-cron";
import path from "path";
import { updateCourtSlots } from "./utils/slotGenerator.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import authRoutes from "./routes/authRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import allUsersRoutes from "./routes/allUsersRoutes.js";
import registerRequestRoutes from "./routes/registerRequestRoutes.js";
import tripRoutes from "./routes/tripRoutes.js";
import bazaarRoutes from "./routes/bazaarRoutes.js";
import vendorRequestRoutes from "./routes/vendorRequestRoutes.js";
import conferenceRoutes from "./routes/conferenceRoutes.js";
import workshopRoutes from "./routes/workshopRoutes.js";
import allEventsRoutes from "./routes/allEventsRoutes.js";
import stripeRoutes from "./routes/stripeRoutes.js";
import Admin from "./models/Admin.js";
import { autoCancelOverdueVendorRequests } from "./utils/vendorRequestJobs.js";
import Stripe from "stripe";
import { sendPaymentReceiptEmail } from "./utils/mailer.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();
const app = express();
// Register Stripe webhook BEFORE express.json so we can access raw body
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      console.warn("Stripe webhook called but keys are missing.");
      return res.status(200).send();
    }
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers["stripe-signature"];
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Stripe webhook signature verification failed", err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    console.log("Stripe webhook received:", event.type);
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const { userId, tripId, workshopId, type } = session.metadata || {};
      const payerEmail =
        session.customer_details?.email || session.customer_email || null;
      const amountPaid = session.amount_total
        ? session.amount_total / 100
        : undefined;
      try {
        if (type === "trip" && tripId) {
          const Trip = (await import("./models/Trip.js")).default;
          const trip = await Trip.findById(tripId);
          if (trip) {
            const pending = trip.registered.find(
              (r) => r.userId.toString() === userId.toString()
            );
            if (pending && !pending.paid) {
              pending.paid = true;
              trip.attendees.push(pending);
              trip.registered = trip.registered.filter(
                (r) => r.userId.toString() !== userId.toString()
              );
              await trip.save();
              // Send receipt to the attendee
              try {
                await sendPaymentReceiptEmail({
                  to: payerEmail || pending.email,
                  name: `${pending.firstname} ${pending.lastname}`.trim(),
                  eventType: "trip",
                  eventName: trip.tripname,
                  amount: amountPaid ?? trip.price,
                  currency: (session.currency || "egp").toUpperCase(),
                  paymentMethod: "Card (Stripe)",
                  date: new Date(session.created * 1000),
                  transactionId: session.payment_intent || session.id,
                });
              } catch (mailErr) {
                console.error(
                  "Failed to send trip Stripe receipt:",
                  mailErr?.message || mailErr
                );
              }
            }
          }
        } else if (type === "workshop" && workshopId) {
          const WorkShop = (await import("./models/Workshop.js")).default;
          const workshop = await WorkShop.findById(workshopId);
          if (workshop) {
            const pending = workshop.registered.find(
              (r) => r.userId.toString() === userId.toString()
            );
            if (pending && !pending.paid) {
              pending.paid = true;
              workshop.attendees.push(pending);
              workshop.registered = workshop.registered.filter(
                (r) => r.userId.toString() !== userId.toString()
              );
              await workshop.save();
              try {
                await sendPaymentReceiptEmail({
                  to: payerEmail || pending.email,
                  name: `${pending.firstname} ${pending.lastname}`.trim(),
                  eventType: "workshop",
                  eventName: workshop.workshopname,
                  amount: amountPaid ?? workshop.requiredFunding,
                  currency: (session.currency || "egp").toUpperCase(),
                  paymentMethod: "Card (Stripe)",
                  date: new Date(session.created * 1000),
                  transactionId: session.payment_intent || session.id,
                });
              } catch (mailErr) {
                console.error(
                  "Failed to send workshop Stripe receipt:",
                  mailErr?.message || mailErr
                );
              }
            }
          }
        }
      } catch (dbErr) {
        console.error("Webhook DB finalize error", dbErr);
        // Don't fail webhook; Stripe will not retry on 200
      }
    }
    res.status(200).send();
  }
);

// JSON parser for all other routes
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Update this to match your frontend URL
    credentials: true,
  })
);
// Ensure auth middleware runs for every request (populates req.user, req.userId)
app.use("/api/allUsers", allUsersRoutes);
app.use("/api/auth", authRoutes);
app.use(authMiddleware);
app.use("/api/booths", boothRoutes);
app.use("/api/loyalty", loyaltyRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/courts", courtRoutes);
app.use("/api/gym-sessions", gymSessionRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/eventsOffice", eventsOfficeRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/vendorRequests", vendorRequestRoutes);
app.use("/api/registerRequests", registerRequestRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/bazaars", bazaarRoutes);
app.use("/api/conferences", conferenceRoutes);
app.use("/api/workshops", workshopRoutes);
app.use("/api/allEvents", allEventsRoutes);
app.use("/api/stripe", stripeRoutes);
cron.schedule("0 0 * * *", () => {
  // runs every day at midnight
  console.log("Updating court slots...");
  updateCourtSlots();
});

cron.schedule("*/30 * * * *", async () => {
  try {
    const cancelled = await autoCancelOverdueVendorRequests();
    if (cancelled) {
      console.log(
        `Auto-cancelled ${cancelled} overdue vendor participation requests`
      );
    }
  } catch (err) {
    console.error("Auto-cancel vendor requests failed:", err?.message || err);
  }
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Attach token-only auth middleware globally so every request has req.user (or null)

app.get("/", (req, res) => res.send("API running 🚀"));

const PORT = process.env.PORT || 3000;
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    const adminExists = await Admin.findOne({ email: "admin@guc.edu.eg" });
    if (!adminExists) {
      console.log("Creating admin user...");
      await Admin.create({
        firstname: "Admin",
        lastname: "User",
        email: "admin@guc.edu.eg",
        password: "admin123",
        role: "Admin",
        status: "Active",
      });
      console.log("Admin user created successfully");
    }
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    // short migration: remove legacy unique index on `username` if it exists
    try {
      const userCollection = mongoose.connection.collection("users");
      const indexes = await userCollection.indexes();
      const usernameIndex = indexes.find((ix) => {
        // index key may be { username: 1 } and name may be 'username_1'
        return (
          (ix.name && ix.name === "username_1") || (ix.key && ix.key.username)
        );
      });
      if (usernameIndex) {
        console.log(
          "Found legacy username index on users collection. Attempting to drop it to avoid duplicate-key errors."
        );
        try {
          await userCollection.dropIndex(usernameIndex.name || "username_1");
          console.log("Dropped legacy username index.");
        } catch (dropErr) {
          console.error(
            "Failed to drop legacy username index:",
            dropErr.message || dropErr
          );
        }
      }
    } catch (ixErr) {
      console.error(
        "Error checking/dropping legacy username index:",
        ixErr.message || ixErr
      );
    }
    app.listen(PORT, () => {
      console.log(`API listening on http://localhost:${PORT}`);
    });

    // import mailer after dotenv has loaded to ensure credentials are available
    try {
      const mailer = await import("./utils/mailer.js");
      const transporter = mailer.transporter;
      transporter.verify((error, success) => {
        if (error) {
          console.error(
            "Mail transporter verification failed:",
            error && error.message ? error.message : error
          );
        } else {
          console.log("Mail transporter is ready to send messages");
        }
      });
    } catch (mailErr) {
      console.error(
        "Error during transporter.verify():",
        mailErr && mailErr.message ? mailErr.message : mailErr
      );
    }
    autoCancelOverdueVendorRequests()
      .then((count) => {
        if (count) {
          console.log(
            `Boot cleanup: auto-cancelled ${count} overdue vendor participation requests`
          );
        }
      })
      .catch((err) => {
        console.error(
          "Boot auto-cancel vendor requests failed:",
          err?.message || err
        );
      });
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
connectDB();
