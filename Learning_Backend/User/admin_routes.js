const express = require("express");
const User = require("../models/User.model");
const Course = require("../models/Course.js");
const { default: mongoose } = require("mongoose");
const router = express.Router();

const extractToken = require("../utils/middleware.js");
const BusinessCourses = require("../LearningModels/Training_Business.js");
const UserLearningProgress = require("../LearningModels/UserLearningProgress.js");
const LearningTime = require("../LearningModels/LearningTime.js");
const UserAssessment = require("../LearningModels/LearningAssessment.js");
const UserModuleReport = require("../LearningModels/LearningModule.js");

router.get("/get/getStaffList", extractToken, async (req, res) => {
  try {
    const { _id, role } = req.user;
    if (role !== "admin") {
      return res
        .status(403)
        .json({ data: "Only Admin can access.", error: true });
    }
    // throw new Error("api is not available");

    const businessCourse = await BusinessCourses.findOne(
      {
        admin_id: _id,
      },
      {
        parent_business: 1,
      }
    ).lean();

    if (!businessCourse) {
      return res
        .status(404)
        .json({ data: "Business course not found", error: true });
    }

    const trainingUsers = await UserLearningProgress.find(
      { business_course_id: businessCourse._id },
      { user_id: 1 }
    ).lean();

    const idsOfTrainingStaff = trainingUsers.map((user) => user.user_id);

    const users = await User.find(
      {
        role: "staff",
        _id: { $nin: idsOfTrainingStaff },
        business_Id: businessCourse.parent_business,
      },
      { firstName: 1, lastName: 1, phoneNumber: 1, email: 1, status: 1 }
    ).lean();

    return res.status(200).json({
      data: users,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({ data: "Internal server error", error: true });
  }
});

router.get("/get/learners_report_datatable", extractToken, async (req, res) => {
  try {
    const { _id, role } = req.user;
    if (role !== "admin") {
      return res
        .status(403)
        .json({ data: "Only Admin can access.", error: true });
    }
    const user = await User.findById(_id, {
      business_Id: 1,
    })
      .populate({
        path: "business_Id",
        select: "active_subscription",
        populate: {
          path: "active_subscription",
          select: "plan price subscription_lvl endTime",
        },
      })
      .lean();

    const activeSubscription = user?.business_Id?.active_subscription;
    const active_plan = user?.business_Id?.active_subscription?.plan || null;
    const sub_pack_lvl = activeSubscription?.subscription_lvl || 0;

    if (sub_pack_lvl <= 1) {
      return res.status(403).json({
        error: true,
        data: "You need to buy a subscription to access this service",
      });
    }

    if (!activeSubscription) {
      return res.status(403).json({
        error: true,
        data: "You don't have an active subscription.",
      });
    }

    const currentTime = new Date();
    if (currentTime > new Date(activeSubscription.endTime)) {
      return res.status(403).json({
        error: true,
        data: "Your subscription has expired.",
      });
    }

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

router.get(
  "/get/reports/view_report_by_learner_id/:id",
  extractToken,
  async (req, res) => {
    try {
      const { _id, role } = req.user;
      if (role !== "admin") {
        return res
          .status(403)
          .json({ data: "Only Admin can access.", error: true });
      }
      const learner_id = req.params.id;

      if (!mongoose.isValidObjectId(learner_id)) {
        return res
          .status(404)
          .json({ data: "Learner Id is not a vaild mongoose id", error: true });
      }

      const isBusiness = await BusinessCourses.findOne(
        { admin_id: _id },
        { admin_id: 1 }
      ).lean();

      if (!isBusiness) {
        return res
          .status(404)
          .json({ data: "Business not found.", error: true });
      }

      const learningReport = await UserLearningProgress.findOne(
        { user_id: learner_id, business_course_id: isBusiness._id },
        {
          completed_courses: 1,
          user_id: 1,
          subscription: 1,
          business_course_id: 1,
        }
      ).lean();
      if (!learningReport) {
        return res
          .status(404)
          .json({ data: "Learner not found.", error: true });
      }

      const user = await User.findById(learningReport.user_id, {
        business_Id: 1,
      })
        .populate({
          path: "business_Id",
          select: "active_subscription",
          populate: {
            path: "active_subscription",
            select: "plan price plansDetails",
          },
        })
        .lean();
      const active_plan =
        user?.business_Id?.active_subscription?.plansDetails?._id || null;

      const courses = await Course.find(
        {
          business_id: learningReport.business_course_id,
          course_pack_id: active_plan,
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
  }
);

module.exports = router;

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

    const completedAssessments = await UserAssessment.find(
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
