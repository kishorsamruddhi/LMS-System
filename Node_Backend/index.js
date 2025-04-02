const express = require("express");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 3000;
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoute = require("./routes/auth.action");
const mongoose = require("mongoose");

// Middleware
app.use(cors());
app.use(bodyParser.json());

const cloudUrl = process.env.CLOUD_URL;
const localUrl = process.env.LOCAL_URL;
const dbUrl = cloudUrl || "mongodb://test@test";

mongoose.connect(dbUrl, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

const db = mongoose.connection;
db.on("error", (error) => {
  console.error("Error connecting to MongoDB:", error.message);
});
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// API Routes
app.use("/auth", authRoute);

// Define a route for the root URL
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
