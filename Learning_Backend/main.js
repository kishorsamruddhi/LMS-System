const express = require("express");

const getRoutes = require("./Create/get_api.js");
const progressRoute = require("./Create/progess.js");
const trackingRoutes = require("./Create/tracking.js");
const super_admin_create_routes = require("./Admin/create.js");
const super_admin_get_Routes = require("./Admin/getRoutes.js");
const super_admin_delete_routes = require("./Admin/deleteRoutes.js");
const super_admin_update_routes = require("./Admin/updateRoute.js");
const testRoutes = require("./Admin/Qlite_testRoute.js");
const adminRoutes = require("./Create/admin_routes.js");

const extractSuperToken = require("./utils/super_admin_middleware.js");

const learningRouterApp = express.Router();

learningRouterApp.use("/get", getRoutes);
learningRouterApp.use("/progress", progressRoute);
learningRouterApp.use("/tracking", trackingRoutes);
learningRouterApp.use("/normal-admin/", adminRoutes);

learningRouterApp.use("/admin/reports", testRoutes);
learningRouterApp.use(
  "/admin/create",
  extractSuperToken,
  super_admin_create_routes
);
learningRouterApp.use("/admin/get", extractSuperToken, super_admin_get_Routes);
learningRouterApp.use(
  "/admin/delete",
  extractSuperToken,
  super_admin_delete_routes
);
learningRouterApp.use(
  "/admin/update",
  extractSuperToken,
  super_admin_update_routes
);

module.exports = learningRouterApp;
