const express = require("express");
const User = require("../models/User.model");
const BusinessCourses = require("../LearningModels/Training_Business");
const UserReportCard = require("../LearningModels/UserLearningProgress");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const router = express.Router();
require("dotenv").config();
const {
  sendAddStaffTokenEmail,
  generateEmailVerification,
} = require("../utils/email_template");
const { default: mongoose } = require("mongoose");
const { changePasswordApi } = require("./user-settings");

const encodeKey = process.env.ENCODE_KEY;
const user_mail_address = process.env.MAIL_ADDRESS;
const user_mail_password = process.env.Mail_PASS;
const login_Token_Vaildity = process.env.LOGIN_TOKEN_VAILDITY;

router.post("/institute", async (req, res) => {
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
    const user = await User.findByIdAndUpdate(
      _id,
      {
        business_course_id: setUp._id,
      },
      { new: true }
    );

    const resp = {
      _id: user._id,
      email: user.email,
      role: user.role,
      username: user.username,
      business_course_id: user?.business_course_id || null,
      isEmailVerified: user.isEmailVerified,
      isAdmin: user.isAdmin,
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

    return res.status(201).json({ error: false, data: resp, token });
  } catch (err) {
    return res.status(500).json({ error: true, data: err.message });
  }
});

router.post("/institute-invite", async (req, res) => {
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
        business_course_id: 1,
      }
    ).lean();
    if (!isStudent) {
      return res.status(404).json({
        error: true,
        data: `User is not registered with this email (${email}) on this app.`,
      });
    }
    const isAlreadyEnrolled = await UserReportCard.findOne(
      { user_id: isStudent._id },
      { user_id: 1 }
    ).lean();

    if (isAlreadyEnrolled) {
      return res.status(404).json({
        error: true,
        data: "The user is already enrolled in an institute.",
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
    await BusinessCourses.findByIdAndUpdate(isAlreadySetup._id, {
      $push: {
        invitationsTo: {
          user: isStudent._id,
          token,
          validation: Date.now() * 1000 * 60 * 60 * 24 * 7,
          _id: null,
        },
      },
    }).lean();

    return res
      .status(201)
      .json({ error: false, data: "Invitation Sent", token });
  } catch (err) {
    return res.status(500).json({ error: true, data: err.message });
  }
});

router.post("/user", async (req, res) => {
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
        business_course_id: 1,
      }
    ).lean();

    if (!getMyDetails) {
      return res
        .status(403)
        .json({ error: true, data: "Token is not vaild for you." });
    }

    if (getMyDetails?.business_course_id) {
      return res.status(403).json({
        error: true,
        data: "You have already connected to an Institute.",
      });
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

    const setUp = new UserReportCard({
      user_id: getMyDetails._id,
      business_course_id: getInstitueDetails._id,
    });

    await setUp.save();

    const user = await User.findByIdAndUpdate(
      getMyDetails._id,
      {
        business_course_id: setUp._id,
      },
      { new: true }
    ).lean();

    const resp = {
      _id: user._id,
      email: user.email,
      role: user.role,
      username: user.username,
      business_course_id: user?.business_course_id || null,
      isEmailVerified: user.isEmailVerified,
      isAdmin: user.isAdmin,
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

    return res.status(201).json({
      error: false,
      data: "Joinned Successfully",
      Institute: {
        name: getInstitueDetails.business_name,
        desc: getInstitueDetails.business_desc,
      },
      userData: resp,
      token,
    });
  } catch (err) {
    return res.status(500).json({ error: true, data: err.message });
  }
});

router.get("/send-code-to-email", async (req, res) => {
  try {
    const _id = req.user._id;
    const user = await User.findById(_id);

    if (!user) {
      return res.status(404).json({ error: true, data: "User not found." });
    }

    if (user.isEmailVerified) {
      return res
        .status(403)
        .json({ error: true, data: "Your email is already verified." });
    }

    const now = new Date();
    let newCodeNeeded = true;

    if (user.code && user.code.expireDate > now) {
      newCodeNeeded = false;
    }

    let token;
    if (newCodeNeeded) {
      token = generateRandomCode();
      const expireDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

      user.code = {
        value: token,
        expireDate: expireDate,
        type: "Email",
      };

      await user.save();
    } else {
      token = user.code.value;
    }

    const message = `Your verification code is:\n\n ${token} \n\nPlease use this code to verify your email address.`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: user_mail_address,
        pass: user_mail_password,
      },
    });

    const mailOptions = {
      from: user_mail_address,
      to: user.email,
      subject: "Email Verification",
      text: message,
      html: generateEmailVerification(token),
    };

    // await transporter.sendMail(mailOptions);

    return res.status(201).json({
      error: false,
      data: "Verification code sent to email.",
    });
  } catch (err) {
    return res.status(500).json({ error: true, data: err.message });
  }
});

router.post("/verify-email-code", async (req, res) => {
  try {
    const { code } = req.body;
    const _id = req.user._id;

    if (!code) {
      return res
        .status(400)
        .json({ error: true, data: "Verification code is required." });
    }

    const user = await User.findById(_id);

    if (!user) {
      return res.status(404).json({ error: true, data: "User not found." });
    }

    if (user.isEmailVerified) {
      return res
        .status(400)
        .json({ error: true, data: "Email is already verified." });
    }

    if (
      !user.code ||
      user.code.value !== code ||
      new Date() > user.code.expireDate
    ) {
      return res
        .status(400)
        .json({ error: true, data: "Invalid or expired verification code." });
    }

    user.isEmailVerified = true;
    user.code = undefined;
    await user.save();

    const resp = {
      _id: user._id,
      email: user.email,
      role: user.role,
      username: user.username,
      business_course_id: user?.business_course_id || null,
      isEmailVerified: user.isEmailVerified,
      isAdmin: user.isAdmin,
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

    return res.status(200).json({
      error: false,
      userData: resp,
      data: "Email successfully verified.",
      token,
    });
  } catch (err) {
    return res.status(500).json({ error: true, data: err.message });
  }
});

router.post("/update-password", changePasswordApi);

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

function generateRandomCode() {
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var code = "";

  for (var i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return code;
}

module.exports = router;
