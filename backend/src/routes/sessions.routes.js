const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/auth");
const { createSession } = require("../controllers/sessions.controller");

router.post("/", protect, createSession);

module.exports = router;
