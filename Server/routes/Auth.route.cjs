const express = require("express");
const serverless = require("serverless-http");
const connectMongo = require("../../src/lib/mongoose");
const User = require("../models/User.model.cjs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const fetch = require("node-fetch");

const router = express.Router();

// Register endpoint
router.post("/register", async (req, res) => {
  try {
    await connectMongo();
    const { lastName, firstName, username, email, password, bio } = req.body;
    const regex = /^[A-Za-z][A-Za-z0-9]{5,21}$/;
    if (!regex.test(password)) {
      return res.status(400).json({
        message: `${password} is not a valid password! Must start with an alphabet, contain only alphabets and numbers, and be 6-22 characters long.`,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 15);
    const user = new User({
      lastName,
      firstName,
      username,
      email,
      password: hashedPassword,
      bio,
    });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error in register:", error.message);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
});

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    await connectMongo();
    const { email, password } = req.body;
    const user = await User.findOne(
      { email },
      { password: 1, firstName: 1, lastName: 1, email: 1, username: 1, bio: 1 }
    );
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const { _id, firstName, lastName, username, bio } = user;

    const token = jwt.sign(
      { user: { _id, firstName, email, lastName, username, bio } },
      process.env?.JWT_SECRET || "journey-tracker-secret-key",
      { expiresIn: "1d" }
    );
    res.status(200).json({
      token,
      user: { _id, firstName, email, lastName, username, bio },
    });
  } catch (error) {
    console.error("Error in login:", error.message);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
});

module.exports = router;
module.exports.handler = serverless(router);
