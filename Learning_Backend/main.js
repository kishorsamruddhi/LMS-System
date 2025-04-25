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
// const super_admin_create_routes = require("./Admin/create.js");
// const super_admin_get_Routes = require("./Admin/getRoutes.js");
// const super_admin_delete_routes = require("./Admin/deleteRoutes.js");
// const super_admin_update_routes = require("./Admin/updateRoute.js");
// const testRoutes = require("./Admin/Qlite_testRoute.js");
// const adminRoutes = require("./User/admin_routes.js");

app.use("/auth", getAuth);
app.use("/setup/", setupAcc);
app.use("/get", getRoutes);
app.use("/progress", progressRoute);
app.use("/tracking", trackingRoutes);
// app.use("/admin-test", adminRoutes);
app.use("/admin-test/get", adminTestRoute);

// app.use("/admin/reports", testRoutes);
// app.use("/admin/create", extractSuperToken, super_admin_create_routes);
// app.use("/admin/get", extractSuperToken, super_admin_get_Routes);
// app.use("/admin/delete", extractSuperToken, super_admin_delete_routes);
// app.use("/admin/update", extractSuperToken, super_admin_update_routes);

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
