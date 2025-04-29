const express = require("express");
const Course = require("../models/Course.js");
const Module = require("../models/Module.js");
const Assessment = require("../models/Assessment.js");
const Pedagogy = require("../models/Pedagogy.js");
const { body, validationResult } = require("express-validator");
const BusinessCourses = require("../LearningModels/Training_Business.js");
const { default: mongoose } = require("mongoose");

const router = express.Router();

const businessValidatorRes = businessValidatorFunc();
const courseValidatorRes = courseValidatorFunc();
const moduleValidatorRes = moduleValidatorFunc();
const assessmentValidatorRes = assessmentValidatorFunc();
const pedagogyValidatorRes = pedagogyValidatorFunc();

router.put("/update_business", businessValidatorRes, async (req, res) => {
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
      business_name,
      business_desc,
      email,
      phone,
      category,

      _id,
    } = req.body;

    const updatedCourse = await BusinessCourses.findByIdAndUpdate(_id, {
      $set: {
        business_name,
        business_desc,
        email,
        phone,
        category,
      },
    }).lean();

    if (!updatedCourse) {
      return res.status(404).json({
        error: true,
        data: "Course not found.",
      });
    }

    return res.status(200).json({ error: false, data: updatedCourse });
  } catch (error) {
    return res.status(500).json({ error: true, data: error.message });
  }
});

router.put("/update_course", courseValidatorRes, async (req, res) => {
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
      course_name,
      color,
      course_desc,
      course_pack_id,
      course_code,
      course_status,
      course_id,
    } = req.body;
    if (!mongoose.isValidObjectId(course_id)) {
      return res.status(404).json({ error: true, data: "Course not Found" });
    }
    const updatedCourse = await Course.findByIdAndUpdate(
      course_id,
      {
        $set: {
          course_name,
          color,
          course_code,
          course_pack_id,
          course_desc,
          course_status,
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({
        error: true,
        data: "Course not found.",
      });
    }

    res.status(200).json({ error: false, data: updatedCourse });
  } catch (error) {
    res.status(500).json({ error: true, data: error.message });
  }
});

router.put("/update_module", moduleValidatorRes, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: true,
      data:
        "Validation failed: " +
        errors
          .array()
          .map((val) => val.msg)
          .join(", "),
    });
  }

  const { business_course_id } = req.user;

  const { module_code, module_name, module_desc, module_seq_no, module_id } =
    req.body;

  try {
    const updatedModule = await Module.findOneAndUpdate(
      { _id: module_id, business_id: business_course_id },
      {
        $set: {
          module_code,
          module_name,
          module_desc,
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedModule) {
      return res.status(404).json({
        error: true,
        data: "Module not found.",
      });
    }

    res.status(200).json({ error: false, data: updatedModule });
  } catch (error) {
    res.status(500).json({ error: true, data: error.message });
  }
});

router.put("/update_assessment", assessmentValidatorRes, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: true,
      data:
        "Validation failed: " +
        errors
          .array()
          .map((val) => val.msg)
          .join(", "),
    });
  }

  const {
    primary_text,
    options,
    correct_option,
    assessment_seq_no,
    assessment_status,
    _id,
  } = req.body;

  try {
    const updatedAssessment = await Assessment.findByIdAndUpdate(
      _id,
      {
        $set: {
          primary_text,
          options,
          correct_option,
          assessment_seq_no,
          assessment_status,
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedAssessment) {
      return res.status(404).json({
        error: true,
        data: "Assessment not found.",
      });
    }

    res.status(200).json({ error: false, data: updatedAssessment });
  } catch (error) {
    res.status(500).json({ error: true, data: error.message });
  }
});

router.put("/update_pedagogy", pedagogyValidatorRes, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: true,
      data:
        "Validation failed: " +
        errors
          .array()
          .map((val) => val.msg)
          .join(", "),
    });
  }

  try {
    const { business_course_id } = req.user;
    const { text, title, url, _id } = req.body;

    const getPadagogy = await Pedagogy.findById(_id, {
      business_id: 1,
    }).lean();

    if (
      !getPadagogy ||
      getPadagogy?.business_id.toString() !== business_course_id
    ) {
      return res.status(403).json({ error: true, data: "Pedagogy not found" });
    }

    const updatedPedagogy = await Pedagogy.findByIdAndUpdate(
      _id,
      {
        $set: {
          text,
          title,
          url,
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedPedagogy) {
      return res.status(404).json({
        error: true,
        data: "Pedagogy not found.",
      });
    }

    res.status(200).json({ error: false, data: updatedPedagogy });
  } catch (error) {
    res.status(500).json({ error: true, data: error.message });
  }
});

function businessValidatorFunc() {
  return [
    body("business_name")
      .optional()
      .isString()
      .withMessage("Business name must be a string."),
    body("phone")
      .optional()
      .isNumeric()
      .withMessage("mobile number must be a number."),
    body("email").optional().isEmail().withMessage("Email must be a string."),
    body("business_desc")
      .optional()
      .isString()
      .withMessage("Business description must be a string."),
  ];
}

function courseValidatorFunc() {
  return [
    body("course_name")
      .optional()
      .isString()
      .withMessage("Course name must be a string."),
    body("color").optional().isString().withMessage("Color must be a string."),
    body("course_code")
      .optional()
      .isString()
      .withMessage("Course Code must be a string."),
    body("course_desc")
      .optional()
      .isString()
      .withMessage("Course description must be a string."),
    body("course_status")
      .optional()
      .isIn(["ACTIVE", "INACTIVE", "ARCHIVED"])
      .withMessage(
        "Course status must be one of ACTIVE, INACTIVE, or ARCHIVED."
      ),
  ];
}

function moduleValidatorFunc() {
  return [
    body("module_code")
      .optional()
      .isString()
      .withMessage("Module code must be a string."),
    body("module_name")
      .optional()
      .isString()
      .withMessage("Module name must be a string."),
    body("module_desc")
      .optional()
      .isString()
      .withMessage("Module description must be a string."),
    body("module_seq_no")
      .optional()
      .isString()
      .withMessage("Module sequence number must be a string."),
    body("module_type")
      .optional()
      .isIn(["THEORY", "ASSESSMENT"])
      .withMessage("Module type must be either THEORY or ASSESSMENT."),
  ];
}

function assessmentValidatorFunc() {
  return [
    body("primary_text")
      .optional()
      .isString()
      .withMessage("Primary text must be a string."),
    body("options")
      .optional()
      .isArray()
      .withMessage("Options must be an array of strings."),
    body("correct_option")
      .optional()
      .isString()
      .withMessage("Correct option must be a string."),
    body("assessment_seq_no")
      .optional()
      .isNumeric()
      .withMessage("Assessment sequence number must be a number."),
    body("assessment_status")
      .optional()
      .isIn(["PUBLISHED", "DRAFT", "ARCHIVED"])
      .withMessage(
        "Assessment status must be one of PUBLISHED, DRAFT, or ARCHIVED."
      ),
    body("_id").isMongoId().withMessage("Invalid assessment ID."),
  ];
}

function pedagogyValidatorFunc() {
  return [
    body("pedagogy_type")
      .optional()
      .isIn(["VIDEO", "H5P"])
      .withMessage("Pedagogy type must be either VIDEO or H5P."),
    body("text").optional().isString().withMessage("Text must be a string."),
    body("title").optional().isString().withMessage("Title must be a string."),
    body("url").optional().isURL().withMessage("URL must be a valid URL."),
    // body("embed_code")
    //   .optional()
    //   .isString()
    //   .withMessage("Embed code must be a string."),
    // body("avg_time")
    //   .optional()
    //   .isNumeric()
    //   .withMessage("Average time must be a number."),
    body("pedagogy_seq_no")
      .optional()
      .isString()
      .withMessage("Pedagogy sequence number must be a string."),
    body("pedagogy_status")
      .optional()
      .isIn(["PUBLISHED", "DRAFT", "ARCHIVED"])
      .withMessage(
        "Pedagogy status must be one of PUBLISHED, DRAFT, or ARCHIVED."
      ),
  ];
}

function validateSubscriptionPlan() {
  return [
    body("name")
      .isString()
      .withMessage("Name must be a string")
      .notEmpty()
      .withMessage("Name is required"),

    body("plan_code")
      .isString()
      .withMessage("Plan code must be a string")
      .notEmpty()
      .withMessage("Plan code is required")
      .isLength({ min: 3 })
      .withMessage("Plan code must be at least 3 characters long"),

    body("description")
      .optional()
      .isString()
      .withMessage("Description must be a string"),

    body("status")
      .isString()
      .withMessage("Status must be a string")
      .isIn(["ACTIVE", "SUSPENDED"])
      .withMessage("Status must be one of ACTIVE, SUSPENDED."),

    body("price")
      .isNumeric()
      .withMessage("Price must be a number")
      .isFloat({ gt: 0 })
      .withMessage("Price must be greater than 0"),

    body("days")
      .isNumeric()
      .withMessage("Days must be a number")
      .isInt({ gt: 0 })
      .withMessage("Days must be a positive integer"),
  ];
}

module.exports = router;
