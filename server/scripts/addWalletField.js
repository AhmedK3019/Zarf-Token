#!/usr/bin/env node
/**
 * Migration script to add `wallet` Decimal128 field to existing users.
 *
 * Usage:
 *   node server/scripts/addWalletField.js
 *
 * The script will:
 *  - set wallet = Decimal128("0.00") for users where wallet is missing or null
 *  - convert numeric wallet fields (double/int/long) to Decimal128 preserving value
 *
 * Make sure MONGO_URI is set in the environment. Backup DB before running.
 */
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });
import mongoose from "mongoose";

import User from "../src/models/User.js";
import Workshop from "../src/models/Workshop.js";
import Trip from "../src/models/Trip.js";
import Bazaar from "../src/models/Bazaar.js";
import Booth from "../src/models/Booth.js";

async function run() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI not set in environment");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("Connected to MongoDB");

  const Decimal128 = mongoose.Types.Decimal128;

  // 1) Set wallet to 0.00 for documents missing the field or where it's null
  const res1 = await User.updateMany(
    { $or: [{ wallet: { $exists: false } }, { wallet: null }] },
    { $set: { wallet: Decimal128.fromString("0.00") } }
  );
  console.log(
    `Set wallet=0.00 for ${
      res1.modifiedCount || res1.nModified || 0
    } users (missing/null)`
  );

  // 2) Convert numeric wallet fields (double/int/long) to Decimal128
  // We'll query for common BSON numeric types and update each user preserving value.
  const numericTypes = ["double", "int", "long"];
  for (const t of numericTypes) {
    const users = await User.find({ wallet: { $type: t } }, { wallet: 1 });
    if (!users.length) continue;
    console.log(
      `Converting ${users.length} users with wallet type=${t} to Decimal128`
    );
    for (const u of users) {
      try {
        const current = u.wallet;
        const asString = String(current);
        u.wallet = Decimal128.fromString(asString);
        await u.save();
      } catch (err) {
        console.error("Failed to convert wallet for user", u._id, err.message);
      }
    }
  }

  console.log("Migration finished");
  // === Add revenue to all events except Conference ===
  // We consider the main event collections: Workshop, Trip, Bazaar, Booth, Court, GymSession, Reservation
  const eventModels = [
    { name: "Workshop", model: Workshop },
    { name: "Trip", model: Trip },
    { name: "Bazaar", model: Bazaar },
    { name: "Booth", model: Booth },
  ];

  for (const em of eventModels) {
    try {
      const res = await em.model.updateMany(
        { $or: [{ revenue: { $exists: false } }, { revenue: null }] },
        { $set: { revenue: Decimal128.fromString("0.00") } }
      );
      console.log(
        `Added revenue to ${
          res.modifiedCount || res.nModified || 0
        } documents in ${em.name}`
      );
    } catch (err) {
      console.error(`Failed to add revenue to ${em.name}:`, err.message);
    }
  }

  // === Ensure attendees have a boolean `paid` field (for event types with attendees) ===
  // Workshop and Trip use an `attendees` array of subdocuments named `registeredPeople`.
  const attendeeModels = [
    { name: "Workshop", model: Workshop },
    { name: "Trip", model: Trip },
  ];

  for (const am of attendeeModels) {
    try {
      // Update any array elements that are missing the `paid` field and set it to false.
      const res = await am.model.updateMany(
        { "attendees.paid": { $exists: false } },
        { $set: { "attendees.$[elem].paid": false } },
        { arrayFilters: [{ "elem.paid": { $exists: false } }], multi: true }
      );
      console.log(
        `Set paid=false on ${
          res.modifiedCount || res.nModified || 0
        } attendee entries in ${am.name}`
      );
    } catch (err) {
      console.error(`Failed to set paid flag for ${am.name}:`, err.message);
    }
  }
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
