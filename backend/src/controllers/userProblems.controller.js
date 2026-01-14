const Problem = require("../models/Problem");
const UserProblem = require("../models/UserProblem");

const getUserProblemStatus = async (req, res) => {
  try {
    const { problemKey } = req.query;

    if (!problemKey) {
      return res.status(400).json({ message: "problemKey is required" });
    }

    const problem = await Problem.findOne({ problemKey });

    // Problem not even in DB yet
    if (!problem) {
      return res.status(200).json({
        exists: false,
        problemKey,
        accepted: false,
        timeSpentSeconds: null,
        reviewed: false,
        editorial: false,
        notes: "",
        source: null,
      });
    }

    const userProblem = await UserProblem.findOne({
      user: req.user._id,
      problem: problem._id,
    });

    // Problem exists but user has no record
    if (!userProblem) {
      return res.status(200).json({
        exists: true,
        problemKey,
        accepted: false,
        timeSpentSeconds: null,
        reviewed: false,
        editorial: false,
        notes: "",
        source: null,
      });
    }

    return res.status(200).json({
      exists: true,
      problemKey,
      accepted: userProblem.accepted,
      timeSpentSeconds: userProblem.timeSpentSeconds,
      reviewed: userProblem.reviewed,
      editorial: userProblem.editorial,
      notes: userProblem.notes,
      source: userProblem.source,
      solvedAt: userProblem.solvedAt,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getUserProblemStatus };