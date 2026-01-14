const Problem = require("../models/Problem");
const Session = require("../models/Session");

const getProblemStats = async (req, res) => {
  try {
    const { problemKey } = req.query;

    if (!problemKey) {
      return res.status(400).json({ message: "problemKey is required" });
    }

    const problem = await Problem.findOne({ problemKey });
    if (!problem) {
      return res.status(200).json({
        exists: false,
        problemKey,
        attempts: 0,
        totalTimeSeconds: 0,
        lastAttemptAt: null,
        lastState: null,
      });
    }

    // Only sessions of current user for this problem
    const sessions = await Session.find({
      user: req.user._id,
      problem: problem._id,
    }).sort({ endedAt: -1 });

    const attempts = sessions.length;

    const totalTimeSeconds = sessions.reduce(
      (sum, s) => sum + (s.durationSeconds || 0),
      0
    );

    const lastAttemptAt = attempts > 0 ? sessions[0].endedAt : null;
    const lastState = attempts > 0 ? sessions[0].state : null;

    return res.status(200).json({
      exists: true,
      problemKey,
      attempts,
      totalTimeSeconds,
      lastAttemptAt,
      lastState,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getProblemStats };