import RegisterRequest from "../models/RegisterRequest.js";

// createRegisterRequest
const createRegisterRequest = async (body) => {
  try {
    const doc = await RegisterRequest.create(body);
    return doc;
  } catch (err) {
    throw err;
  }
};

export default { createRegisterRequest };
