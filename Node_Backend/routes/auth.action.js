const express = require("express");
const router = express.Router();
const User = require("../models/User.model.js");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const saltRounds = 10;

const encodeKey = process.env.ENCODE_KEY;
const user_mail_address = process.env.MAIL_ADDRESS;
const user_mail_password = process.env.Mail_PASS;
const login_Token_Vaildity = process.env.LOGIN_TOKEN_VAILDITY;

router.post("/login", async (req, res) => {
  const { id, password } = req.body;
  try {
    const user = await User.findOne(
      {
        $or: [{ phoneNumber: id }, { email: id }],
      },
      {
        email: 1,
        firstName: 1,
        lastName: 1,
        role: 1,
        status: 1,
        password: 1,
        business_course_id: 1,
      }
    ).lean();

    if (!user) {
      return res.status(200).json({
        success: false,
        data: "User not found. Please sign up to create an account.",
      });
    }

    if (user.status === "Cancelled") {
      return res.status(200).json({
        success: false,
        data: "You no longer have access to this platform. To continue, please Re register.",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(200).json({
        success: false,
        data: "Incorrect password. Please verify your password and try again.",
      });
    }
    delete user.password;

    const token = jwt.sign(
      {
        user: {
          _id: user._id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          business_course_id: user.business_course_id,
        },
      },
      encodeKey,
      {
        expiresIn: login_Token_Vaildity || "5d",
      }
    );
    res.status(200).json({ success: true, data: user, token });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, data: "An error occurred: " + error.message });
  }
});

module.exports = router;

function generateRandomCode() {
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var code = "";

  for (var i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return code;
}
