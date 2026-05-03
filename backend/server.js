const dotenv = require("dotenv");
const express = require("express");
const connectDB = require("./config/db");

dotenv.config();
const app = express();
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

const authMiddleware = require("./shared/authMiddleware");
app.use(authMiddleware);

const donationRoutes = require("./modules/donations/routes");
const requestRoutes = require("./modules/requests/routes");
const homeRoutes = require("./modules/home/routes");

app.use("/api/home", homeRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/requests", requestRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`server is running on port ${PORT}`));
