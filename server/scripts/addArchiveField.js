#!/usr/bin/env node
/**
 * Migration script to add a boolean field `archive: false` to all event documents
 * that don't already have it. Targets: Workshops, Trips, Conferences, Bazaars, Booths.
 *
 * Usage:
 *   node server/scripts/addArchiveField.js
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
import Conference from "../src/models/Conference.js";
import Bazaar from "../src/models/Bazaar.js";
import Booth from "../src/models/Booth.js";

async function ensureArchiveFalse(Model, label) {
  try {
    const res = await Model.updateMany(
      { archive: { $exists: false } },
      { $set: { archive: false } }
    );
    console.log(
      `${label}: set archive=false on ${
        res.modifiedCount ?? res.nModified ?? 0
      } documents (where missing)`
    );
  } catch (err) {
    console.error(`${label}: failed to set archive field:`, err.message);
  }
}

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
    await ensureArchiveFalse(Workshop, "Workshops");
    await ensureArchiveFalse(Trip, "Trips");
    await ensureArchiveFalse(Conference, "Conferences");
    await ensureArchiveFalse(Bazaar, "Bazaars");
    await ensureArchiveFalse(Booth, "Booths");
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
