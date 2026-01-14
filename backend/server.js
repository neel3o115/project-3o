const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/auth.routes");
const problemsRoutes = require("./src/routes/problems.routes");
const userProblemsRoutes = require("./src/routes/userProblems.routes");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/problems", problemsRoutes);
app.use("/api/user-problems", userProblemsRoutes);

app.get("/", (req, res) => {
  res.json({ message: "project-3o backend running" });
});

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();
