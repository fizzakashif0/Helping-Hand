const dotenv = require("dotenv");
const express = require("express");
const connectDB = require("./config/db");

dotenv.config();
const app = express();

// Fail fast if env/db is misconfigured
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not set in environment (.env)");
}

connectDB();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json());

const { verifyToken } = require("./shared/authMiddleware");

if (typeof verifyToken !== "function") {
  throw new TypeError("verifyToken must be a middleware function");
}

const authRoutes = require("./modules/auth/routes");
const donationRoutes = require("./modules/donations/routes");
const requestRoutes = require("./modules/requests/routes");
const homeRoutes = require("./modules/home/routes");

// Public auth endpoints
app.use("/api/auth", authRoutes);

// Protected endpoints (JWT required)
app.use(verifyToken);

app.use("/api/home", homeRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/requests", requestRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Accessible on: http://0.0.0.0:${PORT}`);
});


