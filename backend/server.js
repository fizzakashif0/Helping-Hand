const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const connectDB = require("./config/db");


const app = express();
connectDB();

// Ensure auth model is registered
require("./modules/auth/model");

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

// JWT verification is applied only on protected routes (in routers)


const authRoutes = require("./modules/auth/routes");
const donationRoutes = require("./modules/donations/routes");
const requestRoutes = require("./modules/requests/routes");
const donationRequestRoutes = require("./modules/donationRequests/routes");
const notificationRoutes = require("./modules/notifications/routes");
const homeRoutes = require("./modules/home/routes");
const usersRoutes = require("./modules/users/routes");
const chatRoutes = require("./modules/chats/routes");
const messageRoutes = require("./modules/messages/routes");
const chatRequestRoutes = require("./modules/chatRequests/routes");
const adminRoutes = require('./modules/admin/routes');
const reviewRoutes = require('./modules/reviews/routes');

app.use('/api/reviews', reviewRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/donation-requests", donationRequestRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/home", homeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ngos', require('./modules/ngos/routes'));

app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/chat-requests", chatRequestRoutes);

const http = require("http");
const initializeSocket = require("./socket");

const { createReviewWorker } = require('./modules/reviews/reviewWorker')

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = initializeSocket(server);
createReviewWorker(io);

server.listen(PORT, () => console.log(`server is running on port ${PORT}`));

