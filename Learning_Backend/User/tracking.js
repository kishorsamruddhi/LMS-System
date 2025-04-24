const express = require("express");
const User = require("../models/User.model");
const UserAssessment = require("../LearningModels/LearningAssessment.js");
const BusinessCourses = require("../LearningModels/Training_Business.js");
const UserReportCard = require("../LearningModels/UserLearningProgress.js");
const extractToken = require("../utils/middleware.js");
const UserModuleReport = require("../LearningModels/LearningModule.js");
const UserCourseReport = require("../LearningModels/LearningCourse.js");

const router = express.Router();

const removeField =
  "-createdAt -updatedAt -__v -business_id -created_by -updated_by";

const getCoursesData = [
  {
    path: "learning_Modules.user_record",
    select: removeField,
    model: "user_learning_module",
  },
  {
    path: "completed_Modules.user_record",
    select: removeField,
    model: "user_learning_module",
  },
];

router.get("/check-training-validation", extractToken, async (req, res) => {
  try {
    const token = req.user;

    let user = await UserReportCard.findOne(
      { user_id: token._id },
      { business_course_id: 1 }
    )
      .populate({
        path: "business_course_id",
        select: "parent_business",
        populate: {
          path: "parent_business",
          select: "active_subscription",
          populate: {
            path: "active_subscription",
            select: "plan price startTime endTime",
          },
        },
      })
      .lean();
    if (!user) {
      return res.status(403).json({
        error: true,
        data: "You don't have permission to access the training module. Contact admin for permission.",
      });
    }

    const activeSubscription =
      user.business_course_id?.parent_business?.active_subscription;

    if (!activeSubscription || !activeSubscription.endTime) {
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

    return res.status(200).json({ data: "Ok", error: false });
  } catch (error) {
    res.status(500).json({
      error: true,
      extra: error.message,
      data: "An error occurred while processing your request.",
    });
  }
});

router.get("/getAllStats", extractToken, async (req, res) => {
  try {
    const token = req.user;
    let activePlanLvl = 4;

    const populateUserData = async (userId) => {
      return await UserReportCard.findOne(userId)
        .populate([
          {
            path: "business_course_id",
            populate: {
              path: "courses",
              select: removeField,
              match: { subscription_lvl: { $lte: activePlanLvl } },
              populate: {
                path: "modules",
                select: removeField,
              },
            },
          },
          {
            path: "learning_courses.user_record",
            populate: getCoursesData,
            model: "user_learning_course",
          },
        ])
        .lean();
    };

    let user = await populateUserData({ user_id: token._id });

    if (!user) {
      return res.status(403).json({
        error: true,
        data: "You don't have permission to access the training module. Contact admin for permission.",
      });
    }

    const { business_course_id, learning_courses, completed_courses } = user;
    const learning_Modules = learning_courses?.learning_Modules || [];
    const completed_Modules = learning_courses?.completed_Modules || [];
    res.status(200).json({
      error: false,
      data: business_course_id?.courses || [],
      extra: user,
      learning_coursesList: learning_courses || [],
      completed_coursesList: completed_courses || [],
      learning_Modules,
      completed_Modules,
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      data: err?.message || "An error occurred while processing your request.",
    });
  }
});

router.get("/get_user_assessments_results", extractToken, async (req, res) => {
  try {
    const { _id } = req.user;
    const assessments = await UserAssessment.find(
      {
        user_id: _id,
      },
      { _id: 1, isCorrect: 1 }
    ).lean();
    const getIncompleteModules = await UserModuleReport.find(
      {
        user_id: _id,
        isComplete: false,
      },
      { _id: 1, completed_Assessments: 1, completed_pedagoggies: 1 }
    )
      .populate({
        path: "module_id",
        select: "assessments module_name module_desc module_type pedagogies",
      })
      .lean();

    res.status(200).json({
      error: false,
      data: assessments,
      incompleteModules: getIncompleteModules,
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      extra: err.message,
      data: "An error occurred while processing your request.",
    });
  }
});

router.get("/getCompletedCourses", extractToken, async (req, res) => {
  try {
    const { _id } = req.user;

    const report = await UserReportCard.findOne(
      { user_id: _id },
      { completed_courses: 1 }
    )
      .populate({
        path: "completed_courses.user_record",
        select: "course_id updatedAt",
        populate: {
          path: "course_id",
          select: "course_name course_desc",
        },
      })
      .lean();
    const planeData = report?.completed_courses?.flatMap(
      (cor) => cor.user_record
    );
    res.status(200).json({
      error: false,
      data: planeData,
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      extra: err.message,
      data: "An error occurred while processing your request.",
    });
  }
});

router.get("/getCompletedCourse/:id", extractToken, async (req, res) => {
  try {
    const { _id } = req.user;
    const course_id = req.params.id;

    const user = await User.findById(_id, {
      email: 1,
    }).lean();

    if (!user) {
      return res.status(404).json({
        error: true,
        data: "User not found",
      });
    }
    const report = await UserCourseReport.findOne(
      { user_id: _id, course_id },
      { course_id: 1, updatedAt: 1 }
    )
      .populate({
        path: "course_id",
        select: "course_name course_desc ",
      })
      .lean();

    res.status(200).json({
      error: false,
      data: report,
      user,
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      extra: err.message,
      data: "An error occurred while processing your request.",
    });
  }
});

async function createUserLearningInstance({ user_id, business_id }) {
  const newReportCard = new UserReportCard({
    user_id,
    business_course_id: business_id,
  });

  return await newReportCard.save();
}

module.exports = router;
