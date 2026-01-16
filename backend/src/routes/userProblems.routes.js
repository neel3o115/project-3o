const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/auth");

const {
  getUserProblemStatus,
  solveProblem,
  updateUserProblem,
} = require("../controllers/userProblems.controller");

router.get("/status", protect, getUserProblemStatus);
router.post("/solve", protect, solveProblem);
router.patch("/update", protect, updateUserProblem);

module.exports = router;