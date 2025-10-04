import RegisterRequest from "../models/RegisterRequest.js";

// createRegisterRequest
const createRegisterRequest = async (req, res, next) => {
  try {
    const doc = await RegisterRequest.create(req.body);
    return res.json({ registerRequest: doc });
  } catch (err) {
    next(err);
  }
};

export default { createRegisterRequest };
