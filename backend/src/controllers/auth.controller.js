const User = require("../models/User");

const registerUser = async (req, res) => {
  return res.status(200).json({ message: "register route placeholder" });
};

const loginUser = async (req, res) => {
  return res.status(200).json({ message: "login route placeholder" });
};

module.exports = { registerUser, loginUser };
