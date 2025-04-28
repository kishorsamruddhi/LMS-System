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

const adminTestRoute = require("./NewAdminRoutes/getRoutes");
const testRoutes = require("./NewAdminRoutes/Report");
const admin_create_routes = require("./NewAdminRoutes/create.js");
const admin_update_routes = require("./NewAdminRoutes/updateRoute");
const extractToken = require("./utils/middleware");
const {
  checkStartedStatus,
  checkEmailStatus,
} = require("./utils/accountLayers");

app.use("/auth", getAuth);
app.use("/setup/", extractToken, setupAcc);
app.use("/get", extractToken, checkStartedStatus, checkEmailStatus, getRoutes);
app.use("/progress", checkStartedStatus, checkEmailStatus, progressRoute);
app.use("/tracking", checkStartedStatus, checkEmailStatus, trackingRoutes);
app.use(
  "/admin/get",
  extractToken,
  checkStartedStatus,
  checkEmailStatus,
  adminTestRoute
);

app.use(
  "/admin/reports",
  extractToken,
  checkStartedStatus,
  checkEmailStatus,
  testRoutes
);
app.use(
  "/admin/create",
  extractToken,
  checkStartedStatus,
  checkEmailStatus,
  admin_create_routes
);
app.use(
  "/admin/update",
  extractToken,
  checkStartedStatus,
  checkEmailStatus,
  admin_update_routes
);

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
