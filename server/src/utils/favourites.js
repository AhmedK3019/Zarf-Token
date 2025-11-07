// server/src/utils/favourites.js
import conference from "../models/Conference.js";
import bazaar from "../models/Bazaar.js";
import workshop from "../models/Workshop.js";
import trip from "../models/Trip.js";
import booth from "../models/Booth.js";

// Map the itemType string you store -> Mongoose model
const MODEL_MAP = {
  conference,
  bazaar,
  workshop,
  trip,
  booth,
};

export async function resolveFavourites(favouriteEntries = []) {
  // Group ids by type (preserve order by storing arrays of ids)
  const byType = favouriteEntries.reduce((acc, f) => {
    if (!f || !f.itemType || !f.itemId) return acc;
    acc[f.itemType] = acc[f.itemType] || [];
    acc[f.itemType].push(f.itemId);
    return acc;
  }, {});

  // Fetch docs per type
  const fetchedByType = {};
  for (const [type, ids] of Object.entries(byType)) {
    const Model = MODEL_MAP[type];
    if (!Model) {
      fetchedByType[type] = {}; // no model -> empty map
      continue;
    }
    const docs = await Model.find({ _id: { $in: ids } }).lean();
    // Map id -> doc for quick lookup
    fetchedByType[type] = docs.reduce((m, d) => {
      m[d._id.toString()] = d;
      return m;
    }, {});
  }

  // Build result preserving input order
  return favouriteEntries.map((f) => {
    if (!f || !f.itemType || !f.itemId)
      return { itemType: f?.itemType, itemId: f?.itemId, item: null };
    const item = (fetchedByType[f.itemType] || {})[f.itemId.toString()] || null;
    return { itemType: f.itemType, itemId: f.itemId, item };
  });
}
