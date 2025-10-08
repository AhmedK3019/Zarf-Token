import VendorRequest from "../models/VendorRequest.js";

// create request for a bazar: POST /api/vendorRequests/bazar/:bazarId
const createBazarRequest = async (req, res, next) => {
  try {
    const vendorId = req.user?._id || req.user?.id;
    if (!vendorId)
      return res.status(401).json({ message: "Authentication required" });

    const { people, boothSize } = req.body;
    if (!people || !Array.isArray(people) || people.length < 1)
      return res
        .status(400)
        .json({ message: "People array is required (1-5 persons)" });
    if (!boothSize)
      return res.status(400).json({ message: "boothSize is required" });

    const doc = await VendorRequest.create({
      vendorId,
      people,
      boothSize,
      isBazarBooth: true,
      bazarId: req.params.bazarId,
    });
    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
};

// create request for platform: POST /api/vendorRequests/platform
const createPlatformRequest = async (req, res, next) => {
  try {
    const vendorId = req.user?._id || req.user?.id;
    if (!vendorId)
      return res.status(401).json({ message: "Authentication required" });

    const { people, duration, location, boothSize } = req.body;
    if (!people || !Array.isArray(people) || people.length < 1)
      return res
        .status(400)
        .json({ message: "People array is required (1-5 persons)" });
    if (!duration)
      return res.status(400).json({ message: "duration is required" });
    if (!location)
      return res.status(400).json({ message: "location is required" });
    if (!boothSize)
      return res.status(400).json({ message: "boothSize is required" });

    const doc = await VendorRequest.create({
      vendorId,
      people,
      duration,
      location,
      boothSize,
      isBazarBooth: false,
    });
    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
};

const getRequests = async (req, res, next) => {
  try {
    const docs = await VendorRequest.find()
      .populate("vendorId")
      .populate("bazarId");
    res.json(docs);
  } catch (err) {
    next(err);
  }
};

const getMyRequests = async (req, res, next) => {
  try {
    const vendorId = req.user?._id || req.user?.id;
    if (!vendorId)
      return res.status(401).json({ message: "Authentication required" });

    const docs = await VendorRequest.find({ vendorId })
      .populate("vendorId")
      .populate("bazarId");
    res.json(docs);
  } catch (err) {
    next(err);
  }
};

const getRequest = async (req, res, next) => {
  try {
    const doc = await VendorRequest.findById(req.params.id)
      .populate("vendorId")
      .populate("bazarId");
    if (!doc)
      return res.status(404).json({ message: "VendorRequest not found" });
    res.json(doc);
  } catch (err) {
    next(err);
  }
};

const updateRequest = async (req, res, next) => {
  try {
    const doc = await VendorRequest.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!doc)
      return res.status(404).json({ message: "VendorRequest not found" });
    res.json(doc);
  } catch (err) {
    next(err);
  }
};

const deleteRequest = async (req, res, next) => {
  try {
    await VendorRequest.findByIdAndDelete(req.params.id);
    res.json({ message: "VendorRequest deleted" });
  } catch (err) {
    next(err);
  }
};

export default {
  createBazarRequest,
  createPlatformRequest,
  getRequests,
  getMyRequests,
  getRequest,
  updateRequest,
  deleteRequest,
};
