const express = require("express");
const Course = require("../models/Course.js");
const Assessment = require("../models/Assessment.js");
const Pedagogy = require("../models/Pedagogy.js");
const UserAssessment = require("../LearningModels/LearningAssessment.js");
const UserModuleReport = require("../LearningModels/LearningModule.js");
const UserPedagogyProgress = require("../LearningModels/LearningPedagogy.js");
const UserCourseReport = require("../LearningModels/LearningCourse.js");
const UserReportCard = require("../LearningModels/UserLearningProgress.js");
const extractToken = require("../utils/middleware.js");
const LearningTime = require("../LearningModels/LearningTime.js");

const router = express.Router();

router.post("/checkAnswer", extractToken, async (req, res) => {
  const { assessment_id, module_id, course_id, user_option } = req.body;
  const user_id = req.user._id;
  if (
    !assessment_id ||
    user_option === undefined ||
    !user_id ||
    !course_id ||
    !module_id
  ) {
    return res.status(400).json({ error: true, data: "Invalid request data" });
  }

  try {
    const isSkip = user_option === "0.SKIP" || req.body.isSkip ? true : false;
    const isCorrect = await submittingAnswer({
      user_id,
      module_id,
      course_id,
      assessment_id,
      user_option,
      isSkip,
    });
    res.status(201).json({
      error: false,
      data: isCorrect,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      error: true,
      extra: err.message,
      data: "An error occurred while processing your request.",
    });
  }
});

router.post("/update_pedagogy_Status", extractToken, async (req, res) => {
  const { pedagogy_id, module_id, learning_sec, course_id } = req.body;
  const user_id = req.user._id;
  if (!pedagogy_id || !module_id || !learning_sec || !user_id || !course_id) {
    return res.status(400).json({ error: true, data: "Invalid request data" });
  }

  try {
    const getData = await updateLearningPedagogyStatus({
      pedagogy_id,
      module_id,
      learning_sec,
      user_id,
      course_id,
    });
    res.status(201).json({
      error: false,
      data: getData,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      error: true,
      extra: err.message,
      data: "An error occurred while processing your request.",
    });
  }
});

router.post("/update_user_learning_time", extractToken, async (req, res) => {
  try {
    const user_id = req.user._id;
    const {
      time_stamp: timeSpent,
      pedagogy_id,
      module_id,
      assessment_id,
      course_id,
    } = req.body;

    const updateQuery = { $inc: { timeSpent } };
    const pushQuery = {};

    if (course_id) {
      const courseExists = await LearningTime.findOne({
        user_id,
        "courses.course_id": course_id,
      });
      if (courseExists) {
        updateQuery.$inc["courses.$[course].timeSpent"] = timeSpent;
      } else {
        pushQuery.$push = { courses: { course_id, timeSpent } };
      }
    }
    if (module_id) {
      const moduleExists = await LearningTime.findOne({
        user_id,
        "modules.module_id": module_id,
      });
      if (moduleExists) {
        updateQuery.$inc["modules.$[module].timeSpent"] = timeSpent;
      } else {
        pushQuery.$push = { modules: { module_id, timeSpent } };
      }
    }
    if (pedagogy_id) {
      const pedagogyExists = await LearningTime.findOne({
        user_id,
        "pedagogies.pedagogy_id": pedagogy_id,
      });
      if (pedagogyExists) {
        updateQuery.$inc["pedagogies.$[pedagogy].timeSpent"] = timeSpent;
      } else {
        pushQuery.$push = { pedagogies: { pedagogy_id, timeSpent } };
      }
    }
    if (assessment_id) {
      const assessmentExists = await LearningTime.findOne({
        user_id,
        "assessments.assessment_id": assessment_id,
      });
      if (assessmentExists) {
        updateQuery.$inc["assessments.$[assessment].timeSpent"] = timeSpent;
      } else {
        pushQuery.$push = { assessments: { assessment_id, timeSpent } };
      }
    }

    // If no existing document, create a new one
    let userLearning = await LearningTime.findOne({ user_id });
    if (!userLearning) {
      userLearning = new LearningTime({
        user_id,
        timeSpent,
        courses: course_id ? [{ course_id, timeSpent }] : [],
        modules: module_id ? [{ module_id, timeSpent }] : [],
        pedagogies: pedagogy_id ? [{ pedagogy_id, timeSpent }] : [],
        assessments: assessment_id ? [{ assessment_id, timeSpent }] : [],
      });
      await userLearning.save();
      return res.status(201).json({ error: false, data: "Time Updated" });
    }

    // Update existing document
    await LearningTime.updateOne(
      { user_id },
      { ...updateQuery, ...pushQuery },
      {
        arrayFilters: [
          ...(course_id ? [{ "course.course_id": course_id }] : []),
          ...(module_id ? [{ "module.module_id": module_id }] : []),
          ...(pedagogy_id ? [{ "pedagogy.pedagogy_id": pedagogy_id }] : []),
          ...(assessment_id
            ? [{ "assessment.assessment_id": assessment_id }]
            : []),
        ],
      }
    );

    res.status(201).json({ error: false, data: "Time Updated" });
  } catch (err) {
    res.status(500).json({
      error: true,
      extra: err.message,
      data: "An error occurred while processing your request.",
    });
  }
});

// router.get("/clearModule", async (req, res) => {
//   try {
//     const getData = await UserModuleReport.findByIdAndUpdate(
//       "678a41b8420f0a25a4b468b1",
//       {
//         $set: {
//           total_child_count: 0,
//           complete_child_count: 0,
//           completed_Assessments: [],
//         },
//       },
//       { new: true }
//     ).lean();
//     await UserAssessment.deleteMany({}).lean();
//     res.status(201).json({
//       error: false,
//       data: getData,
//     });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({
//       error: true,
//       extra: err.message,
//       data: "An error occurred while processing your request.",
//     });
//   }
// });

// router.get("/deleteAll", async (req, res) => {
//   try {
//     await UserReportCard.deleteMany({}).lean();
//     await UserCourseReport.deleteMany({}).lean();
//     await UserModuleReport.deleteMany({}).lean();
//     await UserAssessment.deleteMany({}).lean();

//     res.status(201).json({
//       error: false,
//       data: "Deleted",
//     });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({
//       error: true,
//       extra: err.message,
//       data: "An error occurred while processing your request.",
//     });
//   }
// });

module.exports = router;

async function submittingAnswer(data) {
  const { user_id, module_id, assessment_id, user_option, isSkip } = data;

  const getCorrectAns = await Assessment.findById(assessment_id)
    .populate({ path: "module_id", select: "course_id" })
    .lean();
  const getUserAlreadySubmitted_Asmt = await UserAssessment.findOne({
    user_id,
    assessment_id,
  }).lean();
  const course_id = getCorrectAns.module_id.course_id;
  const isCorrect = getCorrectAns.correct_option === user_option;
  // if Submitting Again answer
  if (getUserAlreadySubmitted_Asmt) {
    if (getUserAlreadySubmitted_Asmt.isCorrect) {
      await UserAssessment.findByIdAndUpdate(getUserAlreadySubmitted_Asmt._id, {
        $push: {
          history: {
            user_option: isSkip ? "0.SKIP" : user_option,
            isCorrect,
          },
        },
      }).lean();
      return isCorrect;
    } else if (!getUserAlreadySubmitted_Asmt?.isCorrect) {
      const update_Asmt = await UserAssessment.findByIdAndUpdate(
        getUserAlreadySubmitted_Asmt._id,
        {
          $push: {
            history: {
              user_option: isSkip ? "0.SKIP" : user_option,
              isCorrect,
            },
          },
          $set: { isCorrect, user_option },
        }
      ).lean();
      // Now Update The Treee
      if (isCorrect) {
        await updateTreeOnCorrectOption({
          module_id,
          course_id,
          user_id,
          updatedUserAssessment: update_Asmt,
        });
      }
      return isCorrect;
    }
  } else if (!getUserAlreadySubmitted_Asmt) {
    // If Never Submitted Answer
    const newAssement = await UserAssessment({
      user_id,
      module_id,
      assessment_id,
      user_option,
      isSkip,
      isCorrect,
      correct_option: getCorrectAns.correct_option,
    });

    const savedDoc = await newAssement.save();
    // Now Update The Treee
    if (isCorrect) {
      await updateTreeOnCorrectOption({
        module_id,
        course_id,
        user_id,
        updatedUserAssessment: savedDoc,
      });
    }
    return isCorrect;
  }
}

async function updateLearningPedagogyStatus({
  pedagogy_id,
  module_id,
  learning_sec,
  course_id,
  user_id,
}) {
  try {
    const returnedValue = {
      isAlreadyCompleted: false,
      inc_l_s_high: false,
      isNew: false,
      nowStatusComplete: false,
      avg_time: 0,
      userPeda: null,
    };

    const pedagogy = await Pedagogy.findById(pedagogy_id).lean();
    if (!pedagogy) throw new Error("Pedagogy not found");
    returnedValue.avg_time = pedagogy.avg_time;

    const existingProgress = await UserPedagogyProgress.findOne({
      user_id,
      pedagogy_id,
    }).lean();

    const isWatchedAboveOfAvgTime = learning_sec >= pedagogy.avg_time;
    returnedValue.nowStatusComplete = isWatchedAboveOfAvgTime;
    returnedValue.userPeda = existingProgress;
    if (existingProgress) {
      // Handle already existing progress
      returnedValue.isAlreadyCompleted = existingProgress.isCompleted;

      const isLearningSecHigher = learning_sec > existingProgress.learning_sec;

      if (!isLearningSecHigher && existingProgress.isCompleted) {
        return returnedValue; // No update needed
      }

      const updatedFields = {
        learning_sec: isLearningSecHigher
          ? learning_sec
          : existingProgress.learning_sec,
        isCompleted: isWatchedAboveOfAvgTime || existingProgress.isCompleted,
      };

      await UserPedagogyProgress.findByIdAndUpdate(
        existingProgress._id,
        { $set: updatedFields },
        { new: true }
      );

      if (isWatchedAboveOfAvgTime && !existingProgress.isCompleted) {
        await updateTreeOnCorrectOption({
          module_id,
          course_id,
          user_id,
          updatedUserAssessment: existingProgress,
        });
      }

      returnedValue.inc_l_s_high = isLearningSecHigher;
      return returnedValue;
    } else {
      // Handle new progress creation
      const newProgress = new UserPedagogyProgress({
        user_id,
        module_id,
        pedagogy_id,
        learning_sec,
        isCompleted: isWatchedAboveOfAvgTime,
      });
      const saveProgress = await newProgress.save();

      if (isWatchedAboveOfAvgTime) {
        await updateTreeOnCorrectOption({
          module_id,
          course_id,
          user_id,
          updatedUserAssessment: saveProgress,
        });
      }

      returnedValue.userPeda = saveProgress;
      returnedValue.isNew = true;
      return returnedValue;
    }
  } catch (error) {
    console.error("Error updating learning pedagogy status:", error.message);
    throw new Error("Failed to update pedagogy status");
  }
}

const updateTreeOnCorrectOption = async ({
  module_id,
  course_id,
  user_id,
  updatedUserAssessment,
}) => {
  const getUserModules = await UserModuleReport.findOne({
    user_id,
    module_id,
  })
    .populate({
      path: "module_id",
    })
    .lean();
  const real_module = getUserModules.module_id;
  const mod_type = real_module.module_type;

  let totalChildsLength;
  let usersCompletedChildsLength;

  if (mod_type === "ASSESSMENT") {
    totalChildsLength = real_module.assessments.length;
    usersCompletedChildsLength =
      getUserModules.completed_Assessments?.length + 1;
  } else {
    totalChildsLength = real_module.pedagogies.length;
    usersCompletedChildsLength =
      getUserModules.completed_pedagoggies?.length + 1;
  }

  const isModuleComplete = totalChildsLength === usersCompletedChildsLength;
  // If the Current Completed Assessment is not the last uncompleted Assessment
  const updateModuleCompletedChild = await addChildIntoModuleChildCompleteList({
    getUserModules,
    totalChildsLength,
    usersCompletedChildsLength,
    mod_type,
    updatedUserAssessment,
  });

  if (isModuleComplete) {
    // if  the Current Completed Assessment is the Last Completed Assessment
    await addModuleIntoCourseModuleCompleteList({
      real_module,
      user_id,
      course_id,
      module_id,
      updatedModule: updateModuleCompletedChild,
    });
  }
  return;
};

async function addChildIntoModuleChildCompleteList({
  getUserModules,
  totalChildsLength,
  mod_type,
  usersCompletedChildsLength,
  updatedUserAssessment,
}) {
  const valueIsAssessment = {
    completed_Assessments: {
      source_id: updatedUserAssessment.assessment_id,
      user_record: updatedUserAssessment._id,
    },
  };

  const valueIsPeda = {
    completed_pedagoggies: {
      source_id: updatedUserAssessment.pedagogy_id,
      user_record: updatedUserAssessment._id,
    },
  };

  const pushObj = mod_type === "ASSESSMENT" ? valueIsAssessment : valueIsPeda;
  const isComplete =
    totalChildsLength === usersCompletedChildsLength ? true : false;
  return await UserModuleReport.findByIdAndUpdate(
    getUserModules._id,
    {
      $set: {
        total_child_count: totalChildsLength,
        complete_child_count: usersCompletedChildsLength,
        isComplete,
      },
      $push: pushObj,
    },
    { upsert: true, new: true }
  ).lean();
}

async function addModuleIntoCourseModuleCompleteList({
  real_module,
  user_id,
  course_id,
  updatedModule,
}) {
  // Updating Completed Modules Details in UserCourseReport
  const getCourseDetails = await Course.findById(real_module.course_id).lean();
  const courseReport = await UserCourseReport.findOne({
    user_id,
    course_id,
  })
    .lean()
    .exec();

  if (!courseReport) {
    throw new Error("courseReport not found with", user_id, course_id);
  }

  const courseTotalModulesList = getCourseDetails?.modules?.length || 0;
  const userCompletedModulesList =
    courseReport?.completed_Modules?.length + 1 || 1;

  const isCourseComplete = courseTotalModulesList === userCompletedModulesList;
  const updatedCourseStatus = await UserCourseReport.findByIdAndUpdate(
    courseReport._id,
    {
      $set: {
        total_child_count: courseTotalModulesList,
        complete_child_count: userCompletedModulesList,
        isComplete: isCourseComplete,
      },
      $push: {
        completed_Modules: {
          source_id: updatedModule.module_id,
          user_record: updatedModule._id,
        },
      },
      $pull: {
        learning_Modules: {
          source_id: updatedModule.module_id,
          user_record: updatedModule._id,
        },
      },
    },
    { new: true }
  ).lean();
  // IF the Course is Complete Then
  if (isCourseComplete) {
    await UpdateCompleteListOfCoursesInUserList({
      user_id,
      source_id: updatedCourseStatus.course_id,
      user_record: updatedCourseStatus._id,
    });
  }
  return updatedCourseStatus;
}

async function UpdateCompleteListOfCoursesInUserList({
  user_id,
  source_id,
  user_record,
}) {
  // Updating Completed Courses Completed List Details in User Report Card
  const getCoursesDetails = await UserReportCard.findOne(
    { user_id },
    { business_course_id: 1, completed_courses: 1 }
  )
    .populate({
      path: "business_course_id",
      select: "courses",
    })
    .lean();

  const totalCoursesList = getCoursesDetails.business_course_id.courses.length;
  const userCompletedModulesList =
    getCoursesDetails.completed_courses.length + 1;

  const isCoursesComplete = totalCoursesList === userCompletedModulesList;

  return await UserReportCard.findByIdAndUpdate(getCoursesDetails._id, {
    $set: {
      total_courses_count: totalCoursesList,
      complete_courses_count: userCompletedModulesList,
      isComplete: isCoursesComplete,
    },
    $push: { completed_courses: { user_record, source_id } },
    $pull: { learning_courses: { user_record, source_id } },
  }).lean();
}
