const dotenv = require("dotenv");
const express = require("express");
const connectDB = require("./config/db");

dotenv.config();
const app = express();
connectDB();

/** Ensure User model is registered before any populate("recipient"|"donor") runs */
require("./modules/users/model");

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

/** GET / missing Content-Type can leave req.body undefined; avoid req.body.userId crashes */
app.use((req, res, next) => {
  if (req.body == null || typeof req.body !== "object" || Array.isArray(req.body)) {
    req.body = {};
  }
  next();
});

const authMiddleware = require("./shared/authMiddleware");
app.use(authMiddleware);

const authRoutes = require("./modules/auth/routes");
const donationRoutes = require("./modules/donations/routes");
const requestRoutes = require("./modules/requests/routes");
const donationRequestRoutes = require("./modules/donationRequests/routes");
const notificationRoutes = require("./modules/notifications/routes");
const homeRoutes = require("./modules/home/routes");
const usersRoutes = require("./modules/users/routes");

app.use("/api/auth", authRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/donation-requests", donationRequestRoutes);
app.use("/api/notifications", notificationRoutes);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`server is running on port ${PORT}`));
