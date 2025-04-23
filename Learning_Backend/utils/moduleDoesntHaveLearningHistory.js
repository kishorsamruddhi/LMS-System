const UserCourseProgress = require("../LearningModels/LearningCourse.js");
const UserModuleProgress = require("../LearningModels/LearningModule.js");
const UserReportCard = require("../LearningModels/UserLearningProgress.js");

async function moduleDoesntHaveLearningHistory({
  user_id,
  module_id,
  course_id,
}) {
  const createModuleLearning = new UserModuleProgress({
    user_id,
    module_id,
    course_id,
  });
  const newInstance = await createModuleLearning.save();

  const findCourseInstance = await UserCourseProgress.findOne({
    user_id,
    course_id,
  }).lean();

  if (!findCourseInstance) {
    const createCourseLearning = new UserCourseProgress({
      user_id,
      course_id,
      learning_Modules: [
        { source_id: newInstance.module_id, user_record: newInstance._id },
      ],
    });
    const saveCourse = await createCourseLearning.save();

    await UserReportCard.findOneAndUpdate(
      { user_id },
      {
        $push: {
          learning_courses: {
            source_id: saveCourse.course_id,
            user_record: saveCourse._id,
          },
        },
      },
      { new: true }
    );
  } else {
    await UserCourseProgress.findOneAndUpdate(
      { user_id, course_id },
      {
        $push: {
          learning_Modules: {
            source_id: newInstance.module_id,
            user_record: newInstance._id,
          },
        },
      },
      { new: true }
    );
  }

  return newInstance;
}

module.exports = moduleDoesntHaveLearningHistory;
