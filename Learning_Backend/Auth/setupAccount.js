const express = require("express");
const User = require("../models/User.model");
const BusinessCourses = require("../LearningModels/Training_Business");
const extractToken = require("../utils/middleware");
const UserReportCard = require("../LearningModels/UserLearningProgress");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const router = express.Router();
require("dotenv").config();
const { sendAddStaffTokenEmail } = require("../utils/email_template");
const { default: mongoose } = require("mongoose");

const encodeKey = process.env.ENCODE_KEY;
const user_mail_address = process.env.MAIL_ADDRESS;
const user_mail_password = process.env.Mail_PASS;
const login_Token_Vaildity = process.env.LOGIN_TOKEN_VAILDITY;

router.post("/institute", extractToken, async (req, res) => {
  try {
    const { business_name, business_desc, category } = req.body;
    const _id = req.user._id;
    const getUser = await User.findById(_id, {
      email: 1,
      phoneNumber: 1,
      role: 1,
    });

    if (getUser?.role !== "admin") {
      return res.status(403).json({ error: true, data: "Route not found" });
    }

    const isAlreadySetup = await BusinessCourses.findOne({
      admin_id: _id,
    }).lean();

    if (isAlreadySetup) {
      return res.status(304).json({
        error: true,
        data: "You have already setup Institute",
      });
    }

    const setUp = new BusinessCourses({
      admin_id: _id,
      email: getUser.email,
      phone: getUser.phoneNumber,
      business_name,
      business_desc,
      category,
    });

    await setUp.save();

    return res.status(201).json({ error: false, data: "Setup Complete" });
  } catch (err) {
    return res.status(500).json({ error: true, data: err.message });
  }
});

router.post("/institute-invite", extractToken, async (req, res) => {
  try {
    const { email } = req.body;
    const _id = req.user._id;
    const getUser = await User.findById(_id, {
      email: 1,
      phoneNumber: 1,
      role: 1,
    });

    if (getUser?.role !== "admin") {
      return res.status(403).json({ error: true, data: "Route not found" });
    }

    const isAlreadySetup = await BusinessCourses.findOne({
      admin_id: _id,
    }).lean();

    if (!isAlreadySetup) {
      return res.status(404).json({
        error: true,
        data: "Please Setup Institute",
      });
    }
    const isStudent = await User.findOne(
      { email },
      {
        email: 1,
        phoneNumber: 1,
        role: 1,
      }
    );
    if (!isStudent) {
      return res.status(404).json({
        error: true,
        data: `User is not registered with this email (${email}) on this app.`,
      });
    }

    const token = jwt.sign(
      {
        business_KEY: isAlreadySetup._id,
        invitationTo: isStudent.email,
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
      subject: "Join Institute Invitation on Shiksha",
      text: message,
      html: sendAddStaffTokenEmail(token),
    };

    // Send email
    // let info = await transporter.sendMail(mailOptions);

    return res
      .status(201)
      .json({ error: false, data: "Invitation Sent", token });
  } catch (err) {
    return res.status(500).json({ error: true, data: err.message });
  }
});

router.post("/user", extractToken, async (req, res) => {
  try {
    const _id = req.user._id;
    const { invitationToken } = req.body;
    const isVaild = invitationTokenValidator(invitationToken);

    const { invitationTo, business_KEY } = isVaild.data;

    if (isVaild?.error) {
      throw new Error(isVaild.data);
    }

    const getMyDetails = await User.findOne(
      { email: invitationTo, _id, role: "user" },
      {
        email: 1,
        phoneNumber: 1,
        role: 1,
      }
    ).lean();

    if (!getMyDetails) {
      return res
        .status(403)
        .json({ error: true, data: "Token is not vaild for you." });
    }

    const getInstitueDetails = await BusinessCourses.findById(business_KEY, {
      admin_id: 1,
      business_name: 1,
      business_desc: 1,
    }).lean();

    if (!getInstitueDetails) {
      return res
        .status(403)
        .json({ error: true, data: "Institute is no longer exists." });
    }

    const isAlreadySetup = await UserReportCard.findOne({
      user_id: getMyDetails._id,
    }).lean();

    if (isAlreadySetup) {
      return res.status(304).json({
        error: true,
        data: "You have already connected to an Institute.",
      });
    }

    const setUp = new UserReportCard({
      user_id: getMyDetails._id,
      business_course_id: getInstitueDetails._id,
    });

    await setUp.save();
    return res.status(201).json({
      error: false,
      data: "Joinned Successfully",
      Institute: {
        name: getInstitueDetails.business_name,
        desc: getInstitueDetails.business_desc,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: true, data: err.message });
  }
});

function invitationTokenValidator(token) {
  try {
    const decodedToken = jwt.verify(token, encodeKey);
    return { data: decodedToken, error: false };
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return { data: "Token has expired", error: true };
    } else {
      return { data: "Invalid token", error: true };
    }
  }
}

module.exports = router;
