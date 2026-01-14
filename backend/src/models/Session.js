const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
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

    state: {
      type: String,
      required: true,
      enum: ["solving", "editorial", "review", "stuck", "skipped", "done"],
      default: "solving",
    },

    startedAt: {
      type: Date,
      required: true,
    },

    endedAt: {
      type: Date,
      required: true,
    },

    durationSeconds: {
      type: Number,
      required: true,
      min: 0,
    },

    notes: {
      type: String,
      default: "",
      maxlength: 2000,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Session", sessionSchema);