const express = require("express");
// const subscriptionPlans = require("../models/SubscriptionPacks.js");
const UserLearningProgress = require("../LearningModels/UserLearningProgress.js");
const Course = require("../models/Course.js");
const User = require("../../models/User_Customer.js");
const Module_Model = require("../models/Module.js");
const Assessment = require("../models/Assessment");
const Pedagogy = require("../models/Pedagogy");
const UserAssessment = require("../LearningModels/LearningAssessment.js");
const UserPedagogy = require("../LearningModels/LearningPedagogy.js");
const UserModuleReport = require("../LearningModels/LearningModule");
const UserCourseReport = require("../LearningModels/LearningCourse");
const BusinessCourses = require("../LearningModels/Training_Business.js");
const extractSuperToken = require("../utils/super_admin_middleware.js");
const LearningTime = require("../LearningModels/LearningTime.js");
const { default: mongoose } = require("mongoose");
const SubscriptionPacks = require("../../models/SubscriptionPacks.js");
const router = express.Router();

router.get("/subscription_packs", extractSuperToken, async (req, res) => {
  try {
    const data = await SubscriptionPacks.find({ price: { $ne: 0 } }).lean();
    return res.status(200).json({ data, error: false });
  } catch (error) {
    return res.status(500).json({ data: error.message, error: true });
  }
});

router.get("/courses_by_subscription", async (req, res) => {
  try {
    const getUserSub = await UserLearningProgress.findOne(
      {},
      { subscription: 1 }
    )
      .populate({
        path: "subscription",
        select: "business_course_id plan_code endTime",
      })
      .lean();
    if (!getUserSub || !getUserSub?.subscription) {
      return res.status(500).json({
        data: "You does not have active subscription plan",
        error: true,
      });
    }
    const { business_course_id, plan_code } = getUserSub?.subscription;

    const getAllCourses = await Course.find({
      business_id: business_course_id,
      plan_code,
    }).lean();

    return res
      .status(200)
      .json({ data: getUserSub, courses: getAllCourses, error: false });
  } catch (error) {
    return res.status(500).json({ data: error.message, error: true });
  }
});

router.get("/modules_courses_by_subscription", async (req, res) => {
  try {
    const getUserSub = await UserLearningProgress.findOne(
      {},
      { subscription: 1 }
    )
      .populate({
        path: "subscription",
        select: "business_course_id plan_code endTime",
      })
      .lean();
    if (!getUserSub || !getUserSub?.subscription) {
      return res.status(500).json({
        data: "You does not have active subscription plan",
        error: true,
      });
    }
    const { business_course_id, plan_code } = getUserSub?.subscription;

    const getAllCourses = await Course.find({
      business_id: business_course_id,
      plan_code,
    }).lean();

    const mod_ids = getAllCourses.flatMap((val) => val.modules);

    const modules = await Module_Model.find({ _id: { $in: mod_ids } }).lean();

    const assmt_ids = modules.flatMap((val) => val.assessments);
    const peda_ids = modules.flatMap((val) => val.pedagogies);

    const assmt = await Assessment.find({ _id: { $in: assmt_ids } }).lean();
    const peda = await Pedagogy.findById({ _id: { $in: peda_ids } }).lean();

    return res.status(200).json({
      data: modules,
      assessments: assmt,
      pedagoggies: peda,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({ data: error.message, error: true });
  }
});

router.get("/assessment_report", async (req, res) => {
  try {
    const getUserSub = await UserLearningProgress.findOne(
      {},
      { subscription: 1, user_id: 1 }
    )
      .populate({
        path: "subscription",
        select: "business_course_id plan_code endTime",
      })
      .lean();
    if (!getUserSub || !getUserSub?.subscription) {
      return res.status(500).json({
        data: "You does not have active subscription plan",
        error: true,
      });
    }
    const { business_course_id, plan_code } = getUserSub?.subscription;

    const getAllCourses = await Course.find({
      business_id: business_course_id,
      plan_code,
    }).lean();

    const mod_ids = getAllCourses.flatMap((val) => val.modules);

    const modules = await Module_Model.find({
      _id: { $in: mod_ids },
      module_type: "ASSESSMENT",
    }).lean();

    const assmt_ids = modules.flatMap((val) => val.assessments);

    const getResults = await UserAssessment.find({
      assessment_id: { $in: assmt_ids },
      user_id: getUserSub.user_id,
    }).lean();

    return res.status(200).json({
      data: getResults,
      totalAssessments: assmt_ids,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({ data: error.message, error: true });
  }
});

router.get("/pedagoggies_report", async (req, res) => {
  try {
    const getUserSub = await UserLearningProgress.findOne(
      {},
      { subscription: 1, user_id: 1 }
    )
      .populate({
        path: "subscription",
        select: "business_course_id plan_code endTime",
      })
      .lean();
    if (!getUserSub || !getUserSub?.subscription) {
      return res.status(500).json({
        data: "You does not have active subscription plan",
        error: true,
      });
    }
    const { business_course_id, plan_code } = getUserSub?.subscription;

    const getAllCourses = await Course.find({
      business_id: business_course_id,
      plan_code,
    }).lean();

    const mod_ids = getAllCourses.flatMap((val) => val.modules);

    const modules = await Module_Model.find({
      _id: { $in: mod_ids },
      module_type: "THEORY",
    }).lean();
    const peda_ids = modules.flatMap((val) => val.pedagogies);

    const getResults = await UserPedagogy.find({
      pedagogy_id: { $in: peda_ids },
      user_id: getUserSub.user_id,
    }).lean();

    return res.status(200).json({
      data: getResults,
      total: peda_ids,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({ data: error.message, error: true });
  }
});

router.get("/modules_report", async (req, res) => {
  try {
    const getUserSub = await UserLearningProgress.findOne(
      {},
      { subscription: 1, user_id: 1 }
    )
      .populate({
        path: "subscription",
        select: "business_course_id plan_code endTime",
      })
      .lean();
    if (!getUserSub || !getUserSub?.subscription) {
      return res.status(500).json({
        data: "You does not have active subscription plan",
        error: true,
      });
    }
    const { business_course_id, plan_code } = getUserSub?.subscription;

    const getAllCourses = await Course.find({
      business_id: business_course_id,
      plan_code,
    }).lean();

    const mod_ids = getAllCourses.flatMap((val) => val.modules);

    const getResults = await UserModuleReport.find({
      module_id: { $in: mod_ids },
      user_id: getUserSub.user_id,
    }).lean();

    return res.status(200).json({
      data: getResults,
      total: mod_ids,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({ data: error.message, error: true });
  }
});

router.get("/courses_report", async (req, res) => {
  try {
    const getUserSub = await UserLearningProgress.findOne(
      {},
      { subscription: 1, user_id: 1 }
    )
      .populate({
        path: "subscription",
        select: "business_course_id plan_code endTime",
      })
      .lean();
    if (!getUserSub || !getUserSub?.subscription) {
      return res.status(500).json({
        data: "You does not have active subscription plan",
        error: true,
      });
    }
    const { business_course_id, plan_code } = getUserSub?.subscription;

    const getAllCourses = await Course.find({
      business_id: business_course_id,
      plan_code,
    }).lean();

    const cor_ids = getAllCourses.flatMap((val) => val._id);

    const getResults = await UserCourseReport.find({
      course_id: { $in: cor_ids },
      user_id: getUserSub.user_id,
    }).lean();

    return res.status(200).json({
      data: getResults,
      total: cor_ids,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({ data: error.message, error: true });
  }
});

router.get("/learners_report_dashboard_card", async (req, res) => {
  try {
    const getBusiness = await BusinessCourses.findOne(
      {},
      { courses: 1 }
    ).lean();
    const cor_ids = getBusiness.courses;
    const get_mods = await Course.find({ _id: { $in: cor_ids } })
      .populate({
        path: "modules",
        match: { module_type: "ASSESSMENT" },
      })
      .lean();
    const all_mods = get_mods
      .flatMap((cor) => cor.modules)
      .map((mod) => ({ _id: mod._id, assessments: mod.assessments }));

    const all_mod_ids = all_mods.flatMap((mod) => mod._id);

    const get_assessments_ids = all_mods.flatMap((mod) => mod.assessments);

    const getAllUsersModReport = await UserModuleReport.find({
      module_id: { $in: all_mod_ids },
    });

    const getAllUsersAsmtReport = await UserAssessment.find({
      assessment_id: { $in: get_assessments_ids },
    });

    return res.status(200).json({
      data: all_mods,
      allAsmt: get_assessments_ids,
      getAllUsersModReport,
      getAllUsersAsmtReport,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({ data: error.message, error: true });
  }
});

router.get("/customer_list", async (req, res) => {
  try {
    const businessCourseId = req.query.business_Id;

    if (!businessCourseId || !mongoose.isValidObjectId(businessCourseId)) {
      return res
        .status(400)
        .json({ data: "Invalid business course ID", error: true });
    }

    const businessCourse = await BusinessCourses.findById(businessCourseId, {
      parent_business: 1,
    }).lean();

    if (!businessCourse) {
      return res
        .status(404)
        .json({ data: "Business course not found", error: true });
    }

    const trainingUsers = await UserLearningProgress.find(
      { business_course_id: businessCourseId },
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
    console.error("Error fetching customer list:", error); // Log the error for debugging
    return res.status(500).json({ data: "Internal server error", error: true });
  }
});

router.get(
  "/learners_report_datatable",
  extractSuperToken,
  async (req, res) => {
    try {
      const business_course_id = req.query.business_id;
      if (!mongoose.isValidObjectId(business_course_id)) {
        return res
          .status(404)
          .json({ data: "Business course not found", error: true });
      }
      const getSub = await BusinessCourses.findById(business_course_id, {
        parent_business: 1,
      }).populate({
        path: "parent_business",
        select: "name active_subscription",
        populate: { path: "active_subscription", select: "plan price" },
      });

      const activeSub = getSub?.parent_business?.active_subscription || null;

      const allStudents = await UserLearningProgress.find(
        { business_course_id },
        { _id: 1, user_id: 1 }
      )
        .populate({
          path: "business_course_id",
        })
        .lean();

      const studentIds = allStudents.flatMap((student) => student.user_id);

      const results = await Promise.all(studentIds.map(userReport));

      // Combine user_id with their respective completed modules and assessments
      const output = studentIds.map((user_id, index) => ({
        user_id,
        user_details: results[index].user,
        completedModules: results[index].completedModules.length,
        completedAssessments: results[index].completedAssessments.length,
        learning_time: results[index].learning_time,
        subpack: activeSub,
      }));

      res.status(200).json({ data: output, error: false });
    } catch (error) {
      return res.status(500).json({ data: error.message, error: true });
    }
  }
);

router.get("/view_report_by_learner_id/:id", async (req, res) => {
  try {
    const learner_id = req.params.id;

    if (!mongoose.isValidObjectId(learner_id)) {
      return res
        .status(404)
        .json({ data: "Learner Id is not a vaild mongoose id", error: true });
    }

    const learningReport = await UserLearningProgress.findOne(
      { user_id: learner_id },
      {
        completed_courses: 1,
        user_id: 1,
        subscription: 1,
        business_course_id: 1,
      }
    ).lean();

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

module.exports = router;
