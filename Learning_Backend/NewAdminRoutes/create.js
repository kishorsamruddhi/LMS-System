const express = require("express");
const Course = require("../models/Course.js");
const Module = require("../models/Module.js");
const Assessment = require("../models/Assessment.js");
const Pedagogy = require("../models/Pedagogy.js");
const BusinessCourses = require("../LearningModels/Training_Business.js");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const User = require("../models/User.model.js");
const validationArr = valReturn();

router.post("/create_course", async (req, res) => {
  try {
    const user = req.user;

    const getUser = await User.findById(user._id, {
      business_course_id: 1,
      role: 1,
    });

    if (!getUser) {
      return res.status(403).json({ error: true, data: "Unauthorized" });
    }

    if (getUser?.role !== "admin") {
      return res.status(404).json({ error: true, data: "Api Invaild" });
    }

    const { course_code, course_name, course_desc, color, course_status } =
      req.body;

    const getBusinessCourseDoc = await BusinessCourses.findById(
      getUser.business_course_id,
      {
        _id: 1,
        courses: 1,
      }
    ).lean();

    if (!getBusinessCourseDoc) {
      return res
        .status(404)
        .json({ error: true, data: "BusinessCourses is Empty" });
    }

    const seq = getBusinessCourseDoc.courses.length + 1;

    const newCourse = new Course({
      course_code,
      business_id: getBusinessCourseDoc._id,
      course_name,
      course_desc,
      color,
      course_status,
      course_seq_no: seq,
      subscription_lvl: 1,
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
    const { course_id, module_code, module_name, module_desc, module_type } =
      req.body;

    const checkCourseStatus = await Course.findById(course_id, {
      modules: 1,
      business_id: 1,
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
      business_id: checkCourseStatus.business_id,
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

    if (Array.isArray(options) && options.length === 0) {
      return res
        .status(404)
        .json({ error: true, data: "Need atleast 2 options." });
    }

    const moduleDetails = await Module.findById(module_id, {
      course_id: 1,
      business_id: 1,
      module_type: 1,
    }).lean();

    if (!moduleDetails || moduleDetails.module_type !== "ASSESSMENT") {
      return res.status(404).json({ error: true, data: "Module not found" });
    }

    const newAssessment = new Assessment({
      primary_text,
      options,
      correct_option,
      module_id: moduleDetails._id,
      course_id: moduleDetails.course_id,
      business_id: moduleDetails.business_id,
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
    const { module_id, text, title, url } = req.body;

    const moduleDetails = await Module.findById(module_id, {
      course_id: 1,
      business_id: 1,
      module_type: 1,
    }).lean();

    if (!moduleDetails || moduleDetails.module_type !== "THEORY") {
      return res.status(404).json({ error: true, data: "Module not found" });
    }

    const newPedagogy = new Pedagogy({
      module_id: moduleDetails._id,
      course_id: moduleDetails.course_id,
      business_id: moduleDetails.business_id,
      text,
      title,
      url,
      pedagogy_status: "PUBLISHED",
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
