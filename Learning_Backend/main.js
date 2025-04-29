const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");

require("dotenv").config();

const app = express();
const port = 5055;

// Middleware
app.use(bodyParser.json());

// TODO SET ALLOWED ORIGIN
app.use(cors());

// MongoDB connection
const cloudUrl = process.env.CLOUD_URL;
const localUrl = process.env.LOCAL_URL;
const dbUrl = localUrl;

mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", (error) => {
  console.error("Error connecting to MongoDB:", error.message);
});
db.once("open", () => {
  console.log("Connected to MongoDB");
});
const getAuth = require("./Auth/auth.route");
const setupAcc = require("./Auth/setupAccount");
const getRoutes = require("./User/get_api.js");
const progressRoute = require("./User/progess.js");
const trackingRoutes = require("./User/tracking.js");

const adminTestRoute = require("./AdminRoutes/getRoutes");
const testRoutes = require("./AdminRoutes/Report");
const adminCreateRoutes = require("./AdminRoutes/create.js");
const adminUpdateRoutes = require("./AdminRoutes/updateRoute");
const extractToken = require("./utils/middleware");
const {
  checkStartedStatus,
  checkEmailStatus,
} = require("./utils/accountLayers");

// Middleware for protected routes
const protectedRoutes = [extractToken, checkStartedStatus, checkEmailStatus];

// Authentication routes
app.use("/auth", getAuth);
app.use("/setup/", extractToken, setupAcc);

// User routes
app.use("/get", protectedRoutes, getRoutes);
app.use("/progress", protectedRoutes, progressRoute);
app.use("/tracking", protectedRoutes, trackingRoutes);

// Admin routes
app.use("/admin/get", protectedRoutes, adminTestRoute);
app.use("/admin/reports", protectedRoutes, testRoutes);
app.use("/admin/create", protectedRoutes, adminCreateRoutes);
app.use("/admin/update", protectedRoutes, adminUpdateRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
