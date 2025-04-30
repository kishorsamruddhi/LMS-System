const express = require("express");
const Course = require("../models/Course.js");
const Module = require("../models/Module.js");
const Assessment = require("../models/Assessment.js");
const Pedagogy = require("../models/Pedagogy.js");
const LearningTime = require("../LearningModels/LearningTime.js");
const UserReportCard = require("../LearningModels/UserLearningProgress.js");
const { default: mongoose } = require("mongoose");
const BusinessCourses = require("../LearningModels/Training_Business.js");
const router = express.Router();

router.get("/all_data_counts", async (req, res) => {
  try {
    const business_id = req.user.business_course_id;
    const coursesCount = await Course.find({ business_id }).countDocuments();
    const modulesCount = await Module.find({ business_id }).countDocuments();
    const assessmentsCount = await Assessment.find({
      business_id,
    }).countDocuments();
    const pedagogyCount = await Pedagogy.find({ business_id }).countDocuments();
    const learnersCount = await UserReportCard.find({
      business_course_id: business_id,
    }).countDocuments();
    const learningTime = await LearningTime.aggregate([
      {
        $match: {
          business_id,
        },
      },
      {
        $group: {
          _id: null,
          totalTimeSpent: { $sum: "$timeSpent" },
        },
      },
      {
        $project: {
          totalTimeSpent: 1,
        },
      },
    ]);
    const totalTime =
      learningTime.length > 0 ? learningTime[0].totalTimeSpent : 0;
    res.status(200).json({
      error: false,
      data: {
        coursesCount,
        pedagogyCount,
        modulesCount,
        assessmentsCount,
        learnersCount,
        learningTime: totalTime,
      },
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      extra: err.message,
      data: "An error occurred while processing your request.",
    });
  }
});

router.get("/courses", async (req, res) => {
  try {
    const user = req.user;
    const bus = await BusinessCourses.findOne(
      { admin_id: user?._id },
      {
        courses: 1,
      }
    )
      .populate({
        path: "courses",
        // populate: { path: "course_pack_id", select: "name plan_code" },
      })
      .lean();

    if (!bus) {
      res.status(500).json({
        error: true,
        data: "Business id not vaild!",
      });
    }

    res.status(200).json({
      error: false,
      data: bus.courses,
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      extra: err.message,
      data: "An error occurred while processing your request.",
    });
  }
});

// For Dropdown
router.get("/course_list", async (req, res) => {
  try {
    const business_id = req.user.business_course_id;
    const bus = await BusinessCourses.findOne(
      {
        admin_id: req.user._id,
        _id: business_id,
      },
      {
        courses: 1,
      }
    )
      .populate({ path: "courses", select: "course_name" })
      .lean();

    if (!bus) {
      res.status(500).json({
        error: true,
        data: "Business id not vaild!",
      });
    }

    res.status(200).json({
      error: false,
      data: bus.courses,
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      extra: err.message,
      data: "An error occurred while processing your request.",
    });
  }
});

router.get("/modules_by_course_id/:id", async (req, res) => {
  try {
    const courseId = req.params.id;
    if (!mongoose.isValidObjectId(courseId)) {
      return res
        .status(404)
        .json({ error: true, data: "Course Id is invaild" });
    }
    const data = await Course.findById(courseId, { modules: 1 })
      .populate({ path: "modules" })
      .lean();

    res.status(200).json({
      error: false,
      data,
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      extra: err.message,
      data: "An error occurred while processing your request.",
    });
  }
});

router.get("/courses_and_modules_list", async (req, res) => {
  try {
    const modTypes = ["THEORY", "ASSESSMENT"];
    const getType = req.query.mod_type;

    if (!modTypes.includes(getType)) {
      return res.status(500).json({
        error: true,
        data: "Requested Mod Type is invaild",
      });
    }
    const business_id = req.user.business_course_id;

    const business = await BusinessCourses.findOne(
      { _id: business_id },
      {
        business_name: 1,
        courses: 1,
      }
    )
      .populate({
        path: "courses",
        select: "course_name modules",
        populate: {
          path: "modules",
          match: { module_type: getType },
          select: "module_name course_id",
        },
      })
      .lean();

    res.status(200).json({
      error: false,
      data: business.courses,
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      extra: err.message,
      data: "An error occurred while processing your request.",
    });
  }
});

router.get("/assessments_by_module_id/:id", async (req, res) => {
  try {
    const module_id = req.params.id;
    if (!mongoose.isValidObjectId(module_id)) {
      return res
        .status(404)
        .json({ error: true, data: "Course Id is invaild" });
    }

    const data = await Module.findById(module_id, {
      module_name: 1,
      course_id: 1,
      assessments: 1,
    })
      .populate({ path: "assessments", select: "-__v -createdAt" })
      .lean();

    res.status(200).json({
      error: false,
      data,
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      extra: err.message,
      data: "An error occurred while processing your request.",
    });
  }
});

router.get("/pedagoggies_by_module_id/:id", async (req, res) => {
  try {
    const module_id = req.params.id;
    if (!mongoose.isValidObjectId(module_id)) {
      return res
        .status(404)
        .json({ error: true, data: "Course Id is invaild" });
    }

    const data = await Module.findById(module_id, {
      module_name: 1,
      course_id: 1,
      pedagogies: 1,
    })
      .populate({ path: "pedagogies", select: "-__v -createdAt" })
      .lean();

    res.status(200).json({
      error: false,
      data,
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      extra: err.message,
      data: "An error occurred while processing your request.",
    });
  }
});

router.get("/course/:id", async (req, res) => {
  try {
    const course_id = req.params.id;
    if (!mongoose.isValidObjectId(course_id)) {
      return res
        .status(404)
        .json({ error: true, data: "Course Id is invaild" });
    }

    const data = await Course.findById(course_id)
      .populate({
        path: "business_id",
        select: "business_name",
      })
      .lean();

    res.status(200).json({
      error: false,
      data,
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      extra: err.message,
      data: "An error occurred while processing your request.",
    });
  }
});

router.get("/module/:id", async (req, res) => {
  try {
    const module_id = req.params.id;
    if (!mongoose.isValidObjectId(module_id)) {
      return res
        .status(404)
        .json({ error: true, data: "Module Id is invaild" });
    }

    const data = await Module.findById(module_id)
      .populate({
        path: "course_id",
        select: "course_name",
      })
      .lean();

    res.status(200).json({
      error: false,
      data,
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      extra: err.message,
      data: "An error occurred while processing your request.",
    });
  }
});

router.get("/assessment/:id", async (req, res) => {
  try {
    const assessment_id = req.params.id;
    if (!mongoose.isValidObjectId(assessment_id)) {
      return res
        .status(404)
        .json({ error: true, data: "Assessment Id is invaild" });
    }

    const data = await Assessment.findById(assessment_id)
      .populate({
        path: "module_id",
        select: "course_id module_name",
        populate: {
          path: "course_id",
          select: "course_name",
        },
      })
      .lean();

    res.status(200).json({
      error: false,
      data,
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      extra: err.message,
      data: "An error occurred while processing your request.",
    });
  }
});

router.get("/pedagogy/:id", async (req, res) => {
  try {
    const pedagogy_id = req.params.id;
    if (!mongoose.isValidObjectId(pedagogy_id)) {
      return res
        .status(404)
        .json({ error: true, data: "Pedagogy Id is invaild" });
    }

    const data = await Pedagogy.findById(pedagogy_id)
      .populate({
        path: "module_id",
        select: "course_id module_name",
        populate: {
          path: "course_id",
          select: "course_name",
        },
      })
      .lean();

    res.status(200).json({
      error: false,
      data,
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      extra: err.message,
      data: "An error occurred while processing your request.",
    });
  }
});

router.get("/getLearners", async (req, res) => {
  try {
    const data = await UserReportCard.find({})
      .limit(10)
      .skip(0)
      .populate({
        path: "user_id",
        model: "User",
        select: "firstName lastName email phoneNumber",
      })
      .lean();
    res.status(200).json({
      error: false,
      data,
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      extra: err.message,
      data: "An error occurred while processing your request.",
    });
  }
});

module.exports = router;
