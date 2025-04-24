const express = require("express");
const User = require("../models/User.model");
const router = express.Router();
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { generateEmailVerification } = require("../utils/email_template");
const saltRounds = 16;

const encodeKey = process.env.ENCODE_KEY;
const user_mail_address = process.env.MAIL_ADDRESS;
const user_mail_password = process.env.Mail_PASS;
const login_Token_Vaildity = process.env.LOGIN_TOKEN_VAILDITY;

require("dotenv").config();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).lean();
    if (!user) {
      return res.status(404).json({
        success: false,
        data: "User not found with these creadentials!",
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

    const resp = {
      _id: user._id,
      email: user.email,
      role: user.role,
      username: user.username,
      business_course_id: user?.business_course_id || null,
      isEmailVerified: user.isEmailVerified,
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
    res.status(200).json({ success: true, data: resp, token });
  } catch (err) {
    res.status(500).json({ error: true, data: err.message });
  }
});

router.post("/create-account", async (req, res) => {
  try {
    const MIN_PASSWORD_LENGTH = 6;
    const MAX_PASSWORD_LENGTH = 16;

    const {
      username,
      email,
      password,
      phoneNumber,
      role,
      address = "",
    } = req.body;
    if (
      password.length < MIN_PASSWORD_LENGTH ||
      password.length > MAX_PASSWORD_LENGTH
    ) {
      return res.status(400).json({
        success: false,
        message: `Password length must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters.`,
      });
    }

    const pattern = /^[A-Za-z\d!@#$%^&*()_+-=]{6,}$/;
    const isPasswordValid = pattern.test(password);

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: `Password validation failed. It must be between 6 and 16 characters and can include letters, digits, and special characters.`,
      });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const account = new User({
      username,
      email,
      password: hashedPassword,
      phoneNumber,
      role,
      address,
    });
    await account.save();

    const token = jwt.sign(
      {
        user: account,
      },
      encodeKey,
      {
        expiresIn: login_Token_Vaildity || "5d",
      }
    );
    const message = `Your verification code is: \n\n ${token} \n\n Please use this code to verify your email address.`;

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: user_mail_address,
        pass: user_mail_password,
      },
    });

    // Set up email data
    let mailOptions = {
      from: user_mail_address,
      to: email,
      subject: "Email Verification",
      text: message,
      html: generateEmailVerification(token),
    };

    // Send email
    // let info = await transporter.sendMail(mailOptions);

    res.status(200).json({
      error: false,
      data: token,
    });
  } catch (err) {
    res.status(500).json({ error: true, data: err.message });
  }
});

module.exports = router;
