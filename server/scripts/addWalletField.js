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
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
