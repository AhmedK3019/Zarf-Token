#!/usr/bin/env node
/**
 * Migration script to mark all attendees as paid for Workshops and Trips
 * and ensure a `registered` empty array exists on those documents.
 *
 * Usage:
 *   node server/scripts/markPaidAndAddRegistered.js
 *
 * Requirements:
 *  - Set MONGO_URI in server/.env or environment.
 *  - Backup your database before running.
 */
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import mongoose from "mongoose";
import Workshop from "../src/models/Workshop.js";
import Trip from "../src/models/Trip.js";

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

  try {
    // 1) Mark all attendees' paid = true for Workshops
    try {
      const resW = await Workshop.updateMany(
        { "attendees.0": { $exists: true } },
        { $set: { "attendees.$[].paid": true } }
      );
      console.log(
        `Workshops: modified ${
          resW.modifiedCount ?? resW.nModified ?? 0
        } documents to set attendees paid=true`
      );
    } catch (err) {
      console.error("Failed to update workshops attendees paid:", err.message);
    }

    // 2) Mark all attendees' paid = true for Trips
    try {
      const resT = await Trip.updateMany(
        { "attendees.0": { $exists: true } },
        { $set: { "attendees.$[].paid": true } }
      );
      console.log(
        `Trips: modified ${
          resT.modifiedCount ?? resT.nModified ?? 0
        } documents to set attendees paid=true`
      );
    } catch (err) {
      console.error("Failed to update trips attendees paid:", err.message);
    }

    // 3) Ensure `registered` exists as an empty array on Workshops
    try {
      const resWreg = await Workshop.updateMany(
        { $or: [{ registered: { $exists: false } }, { registered: null }] },
        { $set: { registered: [] } }
      );
      console.log(
        `Workshops: added registered=[] on ${
          resWreg.modifiedCount ?? resWreg.nModified ?? 0
        } documents`
      );
    } catch (err) {
      console.error(
        "Failed to add registered array to workshops:",
        err.message
      );
    }

    // 4) Ensure `registered` exists as an empty array on Trips
    try {
      const resTreg = await Trip.updateMany(
        { $or: [{ registered: { $exists: false } }, { registered: null }] },
        { $set: { registered: [] } }
      );
      console.log(
        `Trips: added registered=[] on ${
          resTreg.modifiedCount ?? resTreg.nModified ?? 0
        } documents`
      );
    } catch (err) {
      console.error("Failed to add registered array to trips:", err.message);
    }
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
