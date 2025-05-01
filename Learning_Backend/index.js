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
const formRoute = require("./Test/formRoute");
app.use("/form", formRoute);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
