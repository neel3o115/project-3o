const mongoose = require("mongoose");

const userProblemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
      index: true,
    },

    accepted: {
      type: Boolean,
      default: false,
    },

    timeSpentSeconds: {
      type: Number,
      default: null,
      min: 0,
    },

    reviewed: {
      type: Boolean,
      default: false,
    },

    editorial: {
      type: Boolean,
      default: false,
    },

    notes: {
      type: String,
      default: "",
      maxlength: 5000,
    },

    source: {
      type: String,
      enum: ["timer", "manual"],
      default: "timer",
    },

    solvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// one row per user per problem
userProblemSchema.index({ user: 1, problem: 1 }, { unique: true });

module.exports = mongoose.model("UserProblem", userProblemSchema);