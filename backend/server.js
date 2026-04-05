const dotenv=require('dotenv');
const express=require('express');
const connectDB= require('./config/db');
dotenv.config();
const app=express();
connectDB();
app.use(express.json());
const donationRoutes = require("./modules/donations/routes");

app.use("/api/donations", donationRoutes);
app.listen(5000,()=> console.log("server is running"));