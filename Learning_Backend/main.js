const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5055;

// Middleware
app.use(bodyParser.json());

// TODO SET ALLOWED ORIGIN
app.use(cors());

// MongoDB connection
const cloudUrl = process.env.CLOUD_URL;
const localUrl = process.env.LOCAL_URL;
const dbUrl = cloudUrl || localUrl;

if (dbUrl) {
  mongoose.connect(dbUrl);
} else {
  console.error("No MongoDB connection URL configured.");
}

const db = mongoose.connection;
db.on("error", (error) => {
  console.error("Error connecting to MongoDB:", error.message);
});
db.once("open", () => {
  console.log("Connected to MongoDB");
});

const extractToken = require("./utils/middleware");
const {
  checkStartedStatus,
  checkEmailStatus,
  checkIsAdmin,
} = require("./utils/accountLayers");

// Middleware for protected routes
const userMdw = [extractToken, checkStartedStatus, checkEmailStatus];
const adminsMdw = [...userMdw, checkIsAdmin];

const baseRoutes = [
  { path: "/auth", file: "./Auth/auth.route" },
  { path: "/setup", file: "./Auth/setupAccount", middlewares: [extractToken] },
];

const userRoutes = [
  { path: "/get", file: "/get_api.js" },
  { path: "/progress", file: "/progess.js" },
  { path: "/tracking", file: "/tracking.js" },
];

const adminsRoutes = [
  { path: "/admin/get", file: "/getRoutes" },
  { path: "/admin/reports", file: "/Report" },
  { path: "/admin/create", file: "/create.js" },
  { path: "/admin/update", file: "/updateRoute" },
];

baseRoutes.map((route) =>
  app.use(route.path, route?.middlewares || [], require(route.file))
);

userRoutes.map((route) =>
  app.use(route.path, userMdw, require("./User/" + route.file))
);

adminsRoutes.map((route) =>
  app.use(route.path, adminsMdw, require("./AdminRoutes/" + route.file))
);

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

module.exports = app;
