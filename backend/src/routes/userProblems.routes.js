const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/auth");
const { getUserProblemStatus } = require("../controllers/userProblems.controller");

router.get("/status", protect, getUserProblemStatus);

module.exports = router;