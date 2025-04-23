const express = require("express");
const Course = require("../models/Course.js");
const Module = require("../models/Module.js");
const Assessment = require("../models/Assessment.js");
const Pedagogy = require("../models/Pedagogy.js");
const BusinessCourses = require("../LearningModels/Training_Business.js");
const { default: mongoose } = require("mongoose");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const User = require("../../models/User_Customer.js");
const SubscriptionPacks = require("../../models/SubscriptionPacks.js");
const UserReportCard = require("../LearningModels/UserLearningProgress.js");
const SubscriptionPlan = require("../../models/SubscriptionPacks.js");

router.post("/create_subscription", async (req, res) => {
  return res.status(500).json({
    error: true,
    data: "Route is not available",
  });
  const admin = req.user;
  try {
    const { name, plan_code, description, status, price, days } = req.body;

    const newPlan = new SubscriptionPlan({
      name,
      plan_code,
      description,
      status,
      price,
      created_by: admin._id,
      updated_by: admin._id,
      days,
    });

    await newPlan.save();

    res.status(201).json({
      data: "Subscription plan created successfully",
      error: false,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      data: error.message,
    });
  }
});

router.post("/add_learner", async (req, res) => {
  try {
    const { user_id, business_id } = req.body;
    const user = await User.findById(user_id, { email: 1, role: 1 }).lean();
    if (!user || user.role !== "staff") {
      return res.status(404).json({
        error: true,
        data: "Staff not found.",
      });
    }

    const isExists = await UserReportCard.findOne({ user_id }).lean();

    if (isExists?.user_id) {
      return res.status(404).json({
        error: true,
        data: "Staff have already access to the training module.",
      });
    }

    const newReportCard = new UserReportCard({
      user_id,
      business_course_id: business_id,
    });

    await newReportCard.save();

    return res.status(201).json({
      data: "Training Module is now available for the staff.",
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      data: error.message,
    });
  }
});

router.post("/create_business", async (req, res) => {
  try {
    const { business_name, business_desc, admin_id, email, phone, category } =
      req.body;
    if (!mongoose.isValidObjectId(admin_id)) {
      return res.status(500).json({
        error: true,
        data: "admin id is not a vaild mongoose id",
      });
    }

    const isAdmin = await User.findById(admin_id, {
      role: 1,
      business_Id: 1,
    }).lean();

    if (!isAdmin || !isAdmin.role === "admin") {
      return res.status(404).json({
        error: true,
        data: `Admin not with this ${admin_id} id not found`,
      });
    }
    const newDoc = new BusinessCourses({
      business_name,
      business_desc,
      parent_business: isAdmin.business_Id,
      email,
      phone,
      admin_id,
      category,
    });

    const data = await newDoc.save();

    return res.status(201).json({
      error: false,
      data: data,
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      data: err.message,
    });
  }
});

router.post("/create_course", async (req, res) => {
  try {
    const {
      course_code,
      course_name,
      course_desc,
      color,
      course_status,
      course_seq_no,
      course_pack_id,
      business_id,
    } = req.body;

    const getBusinessCourseDoc = await BusinessCourses.findById(business_id, {
      _id: 1,
    }).lean();
    if (!getBusinessCourseDoc) {
      return res
        .status(404)
        .json({ error: true, data: "BusinessCourses is Empty" });
    }

    const getCourseSubPackId = await SubscriptionPacks.findById(
      course_pack_id,
      {
        _id: 1,
        subscription_lvl: 1,
      }
    ).lean();

    if (!getCourseSubPackId) {
      return res
        .status(404)
        .json({ error: true, data: "Selected Subcription plan not found." });
    }

    const newCourse = new Course({
      course_code,
      business_id: getBusinessCourseDoc._id,
      course_name,
      course_desc,
      color,
      course_status,
      course_seq_no,
      subscription_lvl: getCourseSubPackId.subscription_lvl,
      course_pack_id: getCourseSubPackId._id,
    });

    const savedCourse = await newCourse.save();

    await BusinessCourses.findByIdAndUpdate(getBusinessCourseDoc._id, {
      $push: {
        courses: savedCourse._id,
      },
    });

    res.status(201).json({
      error: false,
      data: savedCourse,
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      data: err.message,
    });
  }
});

router.post("/create_module", async (req, res) => {
  try {
    const {
      course_id,
      module_code,
      module_name,
      module_desc,
      module_type,
      assessments,
      pedagogies,
    } = req.body;

    const checkCourseStatus = await Course.findById(course_id, {
      modules: 1,
    }).lean();

    if (!checkCourseStatus) {
      return res.status(404).json({ error: true, data: "Course not found" });
    }
    const module_seq_no = checkCourseStatus?.modules?.length + 1 || 1;

    const newModule = new Module({
      course_id,
      module_code,
      module_name,
      module_desc,
      module_seq_no,
      module_type,
    });

    const savedModule = await newModule.save();

    await Course.findByIdAndUpdate(course_id, {
      $push: {
        modules: savedModule._id,
      },
    });

    res.status(201).json({
      error: false,
      data: savedModule,
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      data: err.message,
    });
  }
});

router.post("/create_assessment", async (req, res) => {
  try {
    const { module_id, primary_text, options, correct_option } = req.body;

    const newAssessment = new Assessment({
      module_id,
      primary_text,
      options,
      correct_option,
    });

    const savedAssessment = await newAssessment.save();

    await Module.findByIdAndUpdate(module_id, {
      $push: {
        assessments: savedAssessment._id,
      },
    });

    res.status(201).json({
      error: false,
      data: savedAssessment,
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      data: err.message,
    });
  }
});

const validationArr = valReturn();

router.post("/create_pedagogy", validationArr, async (req, res) => {
  // Check validation results
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: true,
      data:
        "Validation failed: " +
        errors
          .array()
          .flatMap((val) => val.msg)
          .join(", "),
    });
  }

  try {
    const {
      module_id,
      pedagogy_type = "VIDEO",
      text,
      title,
      url,
      // embed_code,
      // avg_time,
      json_data,
      pedagogy_status = "PUBLISHED",
    } = req.body;

    const newPedagogy = new Pedagogy({
      module_id,
      pedagogy_type,
      text,
      title,
      url,
      // embed_code,
      // avg_time,
      json_data,
      pedagogy_status,
    });

    const savedPedagogy = await newPedagogy.save();

    await Module.findByIdAndUpdate(module_id, {
      $push: {
        pedagogies: savedPedagogy._id,
      },
    });

    res.status(201).json({
      error: false,
      data: savedPedagogy,
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      data: err.message,
    });
  }
});

module.exports = router;

function valReturn() {
  return [
    body("module_id")
      .notEmpty()
      .withMessage("module_id is required")
      .isString()
      .withMessage("module_id must be a string"),
    body("text").optional().isString().withMessage("text must be a string"),
    body("title")
      .notEmpty()
      .withMessage("title is required")
      .isString()
      .withMessage("title must be a string"),
    body("url").optional().isURL().withMessage("url must be a valid URL"),
    // body("embed_code")
    //   .optional()
    //   .isString()
    //   .withMessage("embed_code must be a string"),
    // body("avg_time")
    //   .notEmpty()
    //   .withMessage("avg_time is required")
    //   .isInt()
    //   .withMessage("avg_time must be an integer"),
    body("json_data")
      .optional()
      .isString()
      .withMessage("json_data must be a string"),
  ];
}
