const express = require("express");
const User = require("../models/User.model");
const Module = require("../models/Module.js");
const { default: mongoose } = require("mongoose");
const LearningTime = require("../LearningModels/LearningTime.js");

const moduleDoesntHaveLearningHistory = require("../utils/moduleDoesntHaveLearningHistory.js");
const router = express.Router();

const extractToken = require("../utils/middleware.js");
const BusinessCourses = require("../LearningModels/Training_Business.js");
const UserLearningProgress = require("../LearningModels/UserLearningProgress.js");
const UserModuleReport = require("../LearningModels/LearningModule.js");
const AssessmentReport = require("../LearningModels/LearningAssessment.js");

router.get("/staff_subpack_validator", extractToken, async (req, res) => {
  try {
    const token = req.user;
    const getUserSub = await UserLearningProgress.findOne(
      { user_id: token._id },
      { subscription: 1 }
    ).lean();
    if (getUserSub?.subscription?.length === 0) {
      throw new Error(
        "You need to buy subscription to use this service and add the staff details who will be using this service"
      );
    }
    res.status(200).json({
      error: false,
      data: "User Active Have Subscription Pack",
    });
  } catch (err) {
    res.status(500).json({ error: true, data: err.message });
  }
});

router.get("/get_module_data", extractToken, async (req, res) => {
  try {
    const moduleId = req.query?.module_Id;
    if (!mongoose.isValidObjectId(moduleId)) {
      return res
        .status(500)
        .json({ error: true, data: "Module id is not vaild" });
    }
    const assessment = await Module.findById(moduleId, {
      modules: 1,
    }).populate([
      {
        path: "assessments",
        select: "-correct_option -createdAt -updatedAt",
      },
      {
        path: "pedagogies",
        select: "-correct_option -createdAt -updatedAt",
      },
    ]);
    // const assessment = await Assessment.find().lean();

    res.status(201).json({
      error: false,
      data: assessment,
    });
  } catch (err) {
    res.status(500).json({ error: true, data: err.message });
  }
});

router.get("/get_pedagoggies_with_status", extractToken, async (req, res) => {
  try {
    const module_id = req.query.module_id;
    const user_id = req.user._id;

    if (
      !mongoose.isValidObjectId(module_id) ||
      !mongoose.isValidObjectId(user_id)
    ) {
      return res.status(403).json({
        error: true,
        data: "module_id or user_id is not valid",
      });
    }

    const user_peda = await UserModuleReport.findOne(
      {
        module_id,
        user_id,
      },
      { completed_pedagoggies: 1, module_id: 1 }
    )
      .populate({
        path: "module_id",
        select:
          "pedagogies course_id module_code module_name module_desc module_type",
        populate: {
          path: "pedagogies",
          select:
            "-created_by -updated_by -pedagogy_seq_no -pedagogy_status -createdAt -updatedAt -__v",
        },
      })
      .lean()
      .exec();

    if (user_peda) {
      user_peda.completed_pedagoggies =
        user_peda?.completed_pedagoggies.flatMap((val) => val.source_id) || [];
      return res.status(200).json({
        error: false,
        data: user_peda,
      });
    }

    const getCourseId = await Module.findById(module_id, { course_id: 1 })
      .lean()
      .exec();

    if (!getCourseId) {
      return res.status(403).json({
        error: true,
        data: "course_id is not valid",
      });
    }

    const newModuleInstance = await moduleDoesntHaveLearningHistory({
      user_id,
      module_id,
      course_id: getCourseId.course_id,
    });

    const filteredData = await UserModuleReport.findById(newModuleInstance)
      .populate([
        { path: "completed_pedagoggies", select: "pedagogy_id" },
        {
          path: "module_id",
          select: "pedagogies module_code module_name module_desc module_type",
          populate: {
            path: "pedagogies",
            select:
              "-created_by -updated_by -pedagogy_seq_no -pedagogy_status -createdAt -updatedAt -__v",
          },
        },
      ])
      .lean()
      .exec();
    return res.status(200).json({
      error: false,
      data: filteredData,
      extra: "instance Created",
    });
  } catch (err) {
    res.status(500).json({ error: true, data: err.message });
  }
});

router.get("/get_assessments_with_status", extractToken, async (req, res) => {
  try {
    const module_id = req.query.module_id;
    const user_id = req.user._id;

    if (
      !mongoose.isValidObjectId(module_id) ||
      !mongoose.isValidObjectId(user_id)
    ) {
      return res.status(403).json({
        error: true,
        data: "module_id or user_id is not valid",
      });
    }

    const userProgress = await UserModuleReport.findOne({
      module_id,
      user_id,
    })
      .populate({
        path: "module_id",
        select:
          "assessments module_code course_id module_name module_desc module_type",
        populate: {
          path: "assessments",
          select:
            "-created_by -updated_by -correct_option -assessment_status -assessment_seq_no -createdAt -updatedAt -__v",
        },
      })
      .lean()
      .exec();

    if (userProgress) {
      return res.status(200).json({
        error: false,
        data: userProgress,
      });
    }

    const moduleData = await Module.findById(module_id, {
      course_id: 1,
    })
      .lean()
      .exec();

    if (!moduleData) {
      return res.status(404).json({
        error: true,
        data: "Module not found",
      });
    }

    let newModuleInstance = await moduleDoesntHaveLearningHistory({
      user_id,
      module_id,
      course_id: moduleData.course_id,
    });

    const xyz = await UserModuleReport.findById(newModuleInstance._id)
      .populate({
        path: "module_id",
        select:
          "assessments module_code course_id module_name module_desc module_type",
        populate: {
          path: "assessments",
          select:
            "-created_by -updated_by -correct_option -assessment_status -assessment_seq_no -createdAt -updatedAt -__v",
        },
      })
      .lean()
      .exec();

    return res.status(200).json({
      error: false,
      data: xyz,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      error: true,
      data: "An error occurred while processing your request.",
      extra: err.message,
    });
  }
});

router.get("/get_user_learning_time", extractToken, async (req, res) => {
  try {
    const user_id = req.user._id;

    const getUserLearningObj = await LearningTime.findOne({ user_id }).lean();

    if (!getUserLearningObj) {
      const newInstance = new LearningTime({
        user_id,
      });

      const registerUserLearning = await newInstance.save();
      const { timeSpent, updatedAt } = registerUserLearning;
      return res.status(200).json({
        error: false,
        data: { timeSpent, updatedAt },
      });
    }

    const { timeSpent, updatedAt } = getUserLearningObj;
    res.status(200).json({
      error: false,
      data: { timeSpent, updatedAt },
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      extra: err.message,
      data: "An error occurred while processing your request.",
    });
  }
});

router.get("/learners_report_datatable", extractToken, async (req, res) => {
  try {
    const { _id } = req.user;
    const user = await User.findById(_id, {
      business_Id: 1,
    })
      .populate({
        path: "business_Id",
        select: "active_subscription",
        populate: { path: "active_subscription", select: "plan" },
      })
      .lean();

    const active_plan = user?.business_Id?.active_subscription?.plan || null;

    const getBusiness = await BusinessCourses.findOne({ admin_id: _id }).lean();

    if (!getBusiness) {
      return res.status(404).json({
        data: "You don't have access of business training module. Contact super-admin or visit help desk.",
        error: true,
      });
    }

    const allStudents = await UserLearningProgress.find(
      { business_course_id: getBusiness._id },
      { _id: 1, user_id: 1 }
    ).lean();

    const studentIds = allStudents.flatMap((student) => student.user_id);

    const results = await Promise.all(studentIds.map(userReport));

    // Combine user_id with their respective completed modules and assessments
    const output = studentIds.map((user_id, index) => ({
      user_id,
      user_details: results[index].user,
      completedModules: results[index].completedModules.length,
      completedAssessments: results[index].completedAssessments.length,
      learning_time: results[index].learning_time,
      subpack: active_plan,
    }));

    res.status(200).json({ data: output, error: false });
  } catch (error) {
    return res.status(500).json({ data: error.message, error: true });
  }
});

const userReport = async (user_id) => {
  try {
    const user = await User.findById(user_id, {
      email: 1,
      firstName: 1,
      lastName: 1,
      phoneNumber: 1,
    }).lean();
    const completedModules = await UserModuleReport.find(
      { user_id, isComplete: true },
      { _id: 1, course_id: 1, module_id: 1 }
    ).lean();

    const completedAssessments = await AssessmentReport.find(
      { user_id, isCorrect: true },
      { _id: 1, module_id: 1, assessment_id: 1 }
    ).lean();

    const learning_time = await LearningTime.findOne({ user_id }).lean();

    const doesHaveLearningTime = learning_time?.timeSpent
      ? learning_time
      : {
          timeSpent: 0,
          courses: [],
          modules: [],
          pedagogies: [],
          assessments: [],
        };

    return {
      user,
      completedModules,
      completedAssessments,
      learning_time: doesHaveLearningTime,
    };
  } catch (err) {
    throw new Error(`Error in User report: ${err.message}`);
  }
};

module.exports = router;
