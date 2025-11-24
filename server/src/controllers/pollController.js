import Poll from "../models/Poll.js";
import Booth from "../models/Booth.js";
import mongoose from "mongoose";

export const createPoll = async (req, res) => {
  try {
    const { booths, endDate } = req.body;

    const poll = new Poll({
      booths,
      ended: false,
    });
    await poll.save();
    res.status(201).json(poll);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPoll = async (req, res) => {
  try {
    const pollId = req.params.pollId;
    const poll = await Poll.findById(pollId)
      .populate("booths")
      .populate("votes.user");
    if (!poll) {
      return res.status(404).json({ error: "No active poll found." });
    }
    res.status(200).json(poll);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getActivePolls = async (req, res) => {
  try {
    const polls = await Poll.find({ ended: false })
      .populate("booths")
      .populate("votes.user");
    res.status(200).json(polls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllPolls = async (req, res) => {
  try {
    const polls = await Poll.find().populate("booths").populate("votes.user");
    res.status(200).json(polls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const voteInPoll = async (req, res) => {
  try {
    const { pollId, boothId } = req.body;
    const userId = req.userId;
    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ error: "Poll not found." });
    }
    if (new Date() > new Date(poll.endDate)) {
      return res.status(400).json({ error: "Poll has ended." });
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

export const endPoll = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.pollId);
    if (!poll) {
      return res.status(404).json({ error: "Poll not found." });
    }
    poll.ended = true;
    await poll.save();
    res.status(200).json({ message: "Poll ended successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deletePoll = async (req, res) => {
  try {
    const poll = await Poll.findByIdAndDelete(req.params.pollId);
    if (!poll) {
      return res.status(404).json({ error: "Poll not found." });
    }
    res.status(200).json({ message: "Poll deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
