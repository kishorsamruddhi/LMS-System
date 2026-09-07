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

app.use("/auth", require("./Auth/auth.route"));
app.use("/setup", extractToken, require("./Auth/setupAccount"));
app.use("/get", userMdw, require("./User/get_api.js"));
app.use("/progress", userMdw, require("./User/progess.js"));
app.use("/tracking", userMdw, require("./User/tracking.js"));
app.use("/admin/get", adminsMdw, require("./AdminRoutes/getRoutes"));
app.use("/admin/reports", adminsMdw, require("./AdminRoutes/Report"));
app.use("/admin/create", adminsMdw, require("./AdminRoutes/create.js"));
app.use("/admin/update", adminsMdw, require("./AdminRoutes/updateRoute"));

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

module.exports = app;
