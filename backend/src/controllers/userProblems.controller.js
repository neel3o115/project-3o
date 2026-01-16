const Problem = require("../models/Problem");
const UserProblem = require("../models/UserProblem");

/**
 * GET /api/user-problems/status?problemKey=...
 * returns: accepted/timeSpentSeconds/review/editorial/notes (user-specific)
 */
const getUserProblemStatus = async (req, res) => {
  try {
    const { problemKey } = req.query;

    if (!problemKey) {
      return res.status(400).json({ message: "problemKey is required" });
    }

    const problem = await Problem.findOne({ problemKey });

    // Not in Problem DB at all
    if (!problem) {
      return res.status(200).json({
        existsInProblem: false,
        existsInUserProblem: false,
        problemKey,

        accepted: false,
        timeSpentSeconds: null,
        reviewed: false,
        editorial: false,
        notes: "",
        source: null,
        solvedAt: null,
      });
    }

    const userProblem = await UserProblem.findOne({
      user: req.user._id,
      problem: problem._id,
    });

    // Problem exists but user hasn't saved it
    if (!userProblem) {
      return res.status(200).json({
        existsInProblem: true,
        existsInUserProblem: false,
        problemKey,

        accepted: false,
        timeSpentSeconds: null,
        reviewed: false,
        editorial: false,
        notes: "",
        source: null,
        solvedAt: null,
      });
    }

    // User has record
    return res.status(200).json({
      existsInProblem: true,
      existsInUserProblem: true,
      problemKey,

      accepted: userProblem.accepted,
      timeSpentSeconds: userProblem.timeSpentSeconds,
      reviewed: userProblem.reviewed,
      editorial: userProblem.editorial,
      notes: userProblem.notes,
      source: userProblem.source,
      solvedAt: userProblem.solvedAt,
      updatedAt: userProblem.updatedAt,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * POST /api/user-problems/solve
 * body: { platform, problemKey, title, url, timeSpentSeconds, source }
 * creates problem if missing, upserts userProblem with accepted=true
 */
const solveProblem = async (req, res) => {
  try {
    const { platform, problemKey, title, url, timeSpentSeconds, source } =
      req.body;

    if (!platform || !problemKey || !title || !url) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (timeSpentSeconds == null || Number.isNaN(Number(timeSpentSeconds))) {
      return res
        .status(400)
        .json({ message: "timeSpentSeconds is required" });
    }

    const safeSource = source === "manual" ? "manual" : "timer";

    // 1) Find or create Problem
    let problem = await Problem.findOne({ problemKey });

    if (!problem) {
      problem = await Problem.create({
        platform,
        problemKey,
        title,
        url,
        tags: [],
        rating: null,
      });
    } else {
      // optional: keep latest title/url (sometimes title changes slightly)
      problem.title = title;
      problem.url = url;
      await problem.save();
    }

    // 2) Upsert UserProblem (one per user + problem)
    const updated = await UserProblem.findOneAndUpdate(
      { user: req.user._id, problem: problem._id },
      {
        $set: {
          accepted: true,
          timeSpentSeconds: Math.max(0, Math.floor(Number(timeSpentSeconds))),
          source: safeSource,
          solvedAt: new Date(),
        },
        $setOnInsert: {
          reviewed: false,
          editorial: false,
          notes: "",
        },
      },
      { new: true, upsert: true }
    );

    return res.status(201).json({
      message: "Problem marked as solved",
      problemKey,
      userProblem: {
        id: updated._id,
        accepted: updated.accepted,
        timeSpentSeconds: updated.timeSpentSeconds,
        reviewed: updated.reviewed,
        editorial: updated.editorial,
        notes: updated.notes,
        source: updated.source,
        solvedAt: updated.solvedAt,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * PATCH /api/user-problems/update?problemKey=...
 * body: { reviewed?, editorial?, notes? }
 */
const updateUserProblem = async (req, res) => {
  try {
    const { problemKey } = req.query;
    const { reviewed, editorial, notes } = req.body;

    if (!problemKey) {
      return res.status(400).json({ message: "problemKey is required" });
    }

    const problem = await Problem.findOne({ problemKey });
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    const userProblem = await UserProblem.findOne({
      user: req.user._id,
      problem: problem._id,
    });

    if (!userProblem) {
      return res
        .status(404)
        .json({ message: "UserProblem record not found" });
    }

    if (typeof reviewed === "boolean") userProblem.reviewed = reviewed;
    if (typeof editorial === "boolean") userProblem.editorial = editorial;
    if (typeof notes === "string") userProblem.notes = notes;

    await userProblem.save();

    return res.status(200).json({
      message: "UserProblem updated",
      problemKey,
      userProblem: {
        accepted: userProblem.accepted,
        timeSpentSeconds: userProblem.timeSpentSeconds,
        reviewed: userProblem.reviewed,
        editorial: userProblem.editorial,
        notes: userProblem.notes,
        source: userProblem.source,
        solvedAt: userProblem.solvedAt,
        updatedAt: userProblem.updatedAt,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  getUserProblemStatus,
  solveProblem,
  updateUserProblem,
};