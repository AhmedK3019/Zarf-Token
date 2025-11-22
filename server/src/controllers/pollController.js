import Poll from "../models/Poll.js";
import Booth from "../models/Booth.js";
import mongoose from "mongoose";

export const createPoll = async (req, res) => {
  try {
    if (await Poll.findOne()) {
      return res.status(400).json({ error: "A poll already exists." });
    }
    const { booths, endDate } = req.body;

    const poll = new Poll({
      booths,
      endDate,
    });
    await poll.save();
    res.status(201).json(poll);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPoll = async (req, res) => {
  try {
    const poll = await Poll.findOne()
      .populate("booths")
      .populate("votes.user")
      .populate("votes.booth");
    if (!poll) {
      return res.status(404).json({ error: "No active poll found." });
    }
    res.status(200).json(poll);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const voteInPoll = async (req, res) => {
  try {
    const { pollId, boothId } = req.body;
    const userId = req.user._id;
    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ error: "Poll not found." });
    }
    if (new Date() > new Date(poll.endDate)) {
      return res.status(400).json({ error: "Poll has ended." });
    }
    const boothExists = poll.booths.includes(mongoose.Types.ObjectId(boothId));
    if (!boothExists) {
      return res.status(400).json({ error: "Booth not part of this poll." });
    }
    const existingVoteIndex = poll.votes.findIndex((vote) =>
      vote.user.equals(userId)
    );
    if (existingVoteIndex !== -1) {
      poll.votes[existingVoteIndex].booth = boothId;
    } else {
      poll.votes.push({ user: userId, booth: boothId });
    }
    await poll.save();
    res.status(200).json(poll);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
