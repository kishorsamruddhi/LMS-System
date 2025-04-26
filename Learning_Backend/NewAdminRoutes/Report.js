const express = require("express");
const { default: mongoose } = require("mongoose");
const BusinessCourses = require("../LearningModels/Training_Business.js");
const extractToken = require("../utils/middleware.js");
const UserReportCard = require("../LearningModels/UserLearningProgress.js");
const UserModuleReport = require("../LearningModels/LearningModule.js");
const AssessmentReport = require("../LearningModels/LearningAssessment.js");
const LearningTime = require("../LearningModels/LearningTime.js");
const User = require("../models/User.model.js");
const Course = require("../models/Course.js");
const router = express.Router();

router.get("/learners_report_datatable", extractToken, async (req, res) => {
  try {
    const user = req.user;

    const findBusiness = await BusinessCourses.findOne({
      admin_id: user._id,
    }).lean();
    if (!findBusiness) {
      return res
        .status(404)
        .json({ data: "Business isn't exists", error: true });
    }
    const business_course_id = findBusiness._id;

    const allStudents = await UserReportCard.find(
      { business_course_id },
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
    }));

    res.status(200).json({ data: output, error: false });
  } catch (error) {
    return res.status(500).json({ data: error.message, error: true });
  }
});

router.get("/view_report_by_learner_id/:id", async (req, res) => {
  try {
    const learner_id = req.params.id;

    if (!mongoose.isValidObjectId(learner_id)) {
      return res
        .status(404)
        .json({ data: "Learner Id is not a vaild mongoose id", error: true });
    }

    const learningReport = await UserReportCard.findOne(
      { user_id: learner_id },
      {
        completed_courses: 1,
        user_id: 1,
        business_course_id: 1,
      }
    ).lean();

    const courses = await Course.find(
      {
        business_id: learningReport.business_course_id,
      },
      {
        color: 1,
        course_desc: 1,
        course_name: 1,
        modules: 1,
      }
    ).lean();
    const data = await userReport(learner_id);

    return res.status(200).json({
      data: {
        ...data,
        courses,
        completed_courses: learningReport.completed_courses,
      },
      error: false,
    });
  } catch (error) {
    return res.status(500).json({ data: error.message, error: true });
  }
});

const userReport = async (user_id) => {
  try {
    const user = await User.findById(user_id, {
      email: 1,
      username: 1,
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
