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

const cloudUrl = process.env.PROFILE_CLOUD_URL;
const localUrl = process.env.PROFILE_LOCAL_URL;
const dbUrl = localUrl;

mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", (error) => {
  console.error("Error connecting to MongoDB:", error.message);
});
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// const formRoute = require("./Test/formRoute");
const profileAuth = require("./Profile/_auth.route");
const messageRoute = require("./Profile/_message.route");
const extractToken = require("./Profile/middleware");
app.use("/profile/auth", profileAuth);
app.use("/profile/message", extractToken, messageRoute);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
