const fs = require('fs');
const p = 'server/src/controllers/userController.js';
let s = fs.readFileSync(p, 'utf8');
if (!s.includes('import Vendor from "../models/Vendor.js"')) {
  s = s.replace(
    'import { resolveFavourites } from "../utils/favourites.js";',
    'import { resolveFavourites } from "../utils/favourites.js";\nimport Booth from "../models/Booth.js";\nimport Vendor from "../models/Vendor.js";'
  );
}
const startTag = 'const getUserFavourites = async (req, res, next) => {';
const i = s.indexOf(startTag);
if (i === -1) {
  console.error('func not found');
  process.exit(1);
}
let j = i + startTag.length;
let depth = 1;
while (j < s.length) {
  const ch = s[j++];
  if (ch === '{') depth++;
  else if (ch === '}') { depth--; if (depth === 0) break; }
}
const endIndex = j;
const before = s.slice(0, i);
const after = s.slice(endIndex);
const body = `const getUserFavourites = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id, {
      favouriteEvents: 1,
      role: 1,
    }).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const allowed = ["Student", "Staff", "TA", "Professor"];
    if (!allowed.includes(user.role)) {
      return res.status(403).json({
        message: "Only Students, Staff, TAs, and Professors can view favourites",
      });
    }

    const entries = user.favouriteEvents || [];
    const q = req.query || {};
    const filterType = q.type || "";
    const filterStatus = q.status || "";
    const filterReg = q.registrationStatus || "";
    const sortBy = q.sortBy || "date_added";
    const sortDir = (q.sortDir || "desc").toLowerCase() === "asc" ? 1 : -1;

    const resolved = await resolveFavourites(entries);

    const computeStatus = (item) => {
      if (!item) return { status: "unavailable", start: null, end: null };
      const now = new Date();
      const start = item.startdate ? new Date(item.startdate) : null;
      const end = item.enddate ? new Date(item.enddate) : start;
      if (!start) return { status: "unknown", start, end };
      if (end && now > end) return { status: "past", start, end };
      if (start && now < start) return { status: "upcoming", start, end };
      return { status: "ongoing", start, end };
    };

    const boothVendorIds = [];
    resolved.forEach((r) => {
      if (r.itemType === "booth" && r.item?.vendorId) {
        boothVendorIds.push(r.item.vendorId);
      }
    });
    const vendorsById = new Map();
    if (boothVendorIds.length) {
      const vendors = await Vendor.find({ _id: { $in: boothVendorIds } }, { companyname: 1 }).lean();
      vendors.forEach((v) => vendorsById.set(String(v._id), v));
    }

    let enriched = await Promise.all(
      resolved.map(async (r, idx) => {
        const entry = entries[idx] || {};
        const item = r.item || null;
        if (!item) {
          return {
            itemType: r.itemType,
            itemId: r.itemId,
            addedAt: entry.addedAt || null,
            status: "unavailable",
            registration: "unknown",
            commentsCount: 0,
            rating: null,
            item: null,
            message: "Event no longer available",
          };
        }
        const st = computeStatus(item);
        let isRegistered = false;
        if (Array.isArray(item.attendees)) {
          isRegistered = item.attendees.some((a) => {
            const idStr = (a?.userId && typeof a.userId.toString === "function") ? a.userId.toString() : String(a?.userId || "");
            return idStr === String(user._id);
          });
        }
        const capacity = typeof item.capacity === "number" ? item.capacity : null;
        const attendeesCount = Array.isArray(item.attendees) ? item.attendees.length : 0;
        const remaining = capacity != null ? Math.max(capacity - attendeesCount, 0) : null;
        let vendorInfo = null;
        if (r.itemType === "booth" && item.vendorId) {
          const v = vendorsById.get(String(item.vendorId));
          vendorInfo = v ? { id: v._id, name: v.companyname } : null;
        }
        let participatingVendors = [];
        if (r.itemType === "bazaar") {
          const booths = await Booth.find({ bazarId: item._id }).populate({ path: "vendorId", select: "companyname" }).lean();
          participatingVendors = booths.map((b) => b.vendorId?.companyname).filter(Boolean);
        }
        const registrationDeadline = item.registrationDeadline || item.registerationdeadline || item.registrationdeadline || null;
        return {
          itemType: r.itemType,
          itemId: r.itemId,
          addedAt: entry.addedAt || null,
          status: st.status,
          eventStart: st.start,
          eventEnd: st.end,
          registration: isRegistered ? "registered" : "not_registered",
          commentsCount: Array.isArray(item.comments) ? item.comments.length : 0,
          rating: null,
          capacity,
          attendeesCount,
          remaining,
          registrationDeadline,
          vendor: vendorInfo,
          participatingVendors,
          item,
        };
      })
    );

    if (filterType) {
      enriched = enriched.filter((e) => e.itemType === filterType);
    }
    if (filterStatus) {
      enriched = enriched.filter((e) => e.status === filterStatus);
    }
    if (filterReg) {
      const wantRegistered = filterReg === "registered";
      enriched = enriched.filter((e) => wantRegistered ? e.registration === "registered" : e.registration === "not_registered");
    }

    const cmpStr = (a, b) => String(a || "").localeCompare(String(b || ""), undefined, { sensitivity: "base" });
    enriched.sort((a, b) => {
      if (sortBy === "alpha") {
        const an = a.item?.workshopname || a.item?.tripname || a.item?.bazaarname || a.item?.conferencename || a.item?.boothname || "";
        const bn = b.item?.workshopname || b.item?.tripname || b.item?.bazaarname || b.item?.conferencename || b.item?.boothname || "";
        return sortDir * cmpStr(an, bn);
      }
      if (sortBy === "event_date") {
        const at = a.eventStart ? new Date(a.eventStart).getTime() : 0;
        const bt = b.eventStart ? new Date(b.eventStart).getTime() : 0;
        return sortDir * (at - bt);
      }
      const at = a.addedAt ? new Date(a.addedAt).getTime() : 0;
      const bt = b.addedAt ? new Date(b.addedAt).getTime() : 0;
      return sortDir * (at - bt);
    });

    return res.json({ total: enriched.length, favourites: enriched });
  } catch (err) {
    next(err);
  }
};
`;
const out = before + body + after;
fs.writeFileSync(p, out);
console.log('updated userController');
