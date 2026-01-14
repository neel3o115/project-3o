const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      required: true,
      enum: ["codeforces", "codechef", "atcoder", "usaco", "cses", "other"],
      lowercase: true,
      trim: true,
    },

    problemKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    url: {
      type: String,
      required: true,
      trim: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    rating: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Problem", problemSchema);
