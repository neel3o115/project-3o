const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/auth");
const { getProblemStats } = require("../controllers/problems.controller");

router.get("/stats", protect, getProblemStats);

module.exports = router;