const express = require("express");
const router = express.Router();
const User = require("./_user.model");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const saltRounds = 16;
const encodeKey = "PORTFOLIO_SECRET_KEY";
const login_Token_Vaildity = "5d";

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).lean();
    if (!user) {
      return res.status(404).json({
        error: true,
        data: "User not found with these creadentials!",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(200).json({
        error: true,
        data: "Incorrect password. Please verify your password and try again.",
      });
    }
    delete user.password;

    const { _id, connectedTo, unknown, listeningCode } = user;
    const resp = {
      _id,
      connectedTo,
      unknown,
      email,
      listeningCode,
    };
    const token = jwt.sign(
      {
        user: resp,
      },
      encodeKey,
      {
        expiresIn: login_Token_Vaildity || "5d",
      }
    );
    res.status(200).json({ error: false, data: resp, token });
  } catch (err) {
    res.status(500).json({ error: true, data: err.message });
  }
});

router.post("/create-account", async (req, res) => {
  try {
    const MIN_PASSWORD_LENGTH = 6;
    const MAX_PASSWORD_LENGTH = 16;

    const { email, password } = req.body;
    if (
      password.length < MIN_PASSWORD_LENGTH ||
      password.length > MAX_PASSWORD_LENGTH
    ) {
      return res.status(400).json({
        error: true,
        message: `Password length must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters.`,
      });
    }

    const pattern = /^[A-Za-z\d!@#$%^&*()_+-=]{6,}$/;
    const isPasswordValid = pattern.test(password);

    if (!isPasswordValid) {
      return res.status(400).json({
        error: true,
        message: `Password validation failed. It must be between 6 and 16 characters and can include letters, digits, and special characters.`,
      });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const code = generateRandomCode(12);

    const account = new User({
      email,
      password: hashedPassword,
      listeningCode: code + email[3] + email[5],
    });

    await account.save();

    const resp = {
      _id: account._id,
      email: account.email,
      listeningCode: account.listeningCode,
    };

    const token = jwt.sign(
      {
        user: resp,
      },
      encodeKey,
      {
        expiresIn: login_Token_Vaildity || "5d",
      }
    );
    res.status(200).json({
      error: false,
      data: resp,
      token,
    });
  } catch (err) {
    res.status(500).json({ error: true, data: err.message });
  }
});

function generateRandomCode(length = 6) {
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var code = "";

  for (var i = 0; i < length; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return code;
}

module.exports = router;
