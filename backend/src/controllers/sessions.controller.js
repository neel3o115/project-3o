const Problem = require("../models/Problem");
const Session = require("../models/Session");

const createSession = async (req, res) => {
  try {
    const { platform, problemKey, title, url, tags, rating, session } = req.body;

    if (!platform || !problemKey || !title || !url || !session) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 1) Find or create Problem
    let problem = await Problem.findOne({ problemKey });

    if (!problem) {
      problem = await Problem.create({
        platform,
        problemKey,
        title,
        url,
        tags: Array.isArray(tags) ? tags : [],
        rating: typeof rating === "number" ? rating : null,
      });
    }

    // 2) Validate session data
    const { startedAt, endedAt, durationSeconds, state, notes } = session;

    if (!startedAt || !endedAt || durationSeconds == null) {
      return res.status(400).json({ message: "Invalid session payload" });
    }

    // 3) Create Session
    const created = await Session.create({
      user: req.user._id,
      problem: problem._id,
      startedAt: new Date(startedAt),
      endedAt: new Date(endedAt),
      durationSeconds: Math.floor(Number(durationSeconds)),
      state: state || "solving",
      notes: notes || "",
    });

    return res.status(201).json({
      message: "Session saved",
      sessionId: created._id,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { createSession };
