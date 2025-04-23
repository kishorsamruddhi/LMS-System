export function calculateCourseProgress(data) {
  const courseProgress = {};

  // Initialize course progress
  data.courses.forEach((course) => {
    courseProgress[course._id] = {
      course_name: course.course_name,
      total_modules: course.modules.length,
      completed_modules: 0,
      completed_assessments: 0,
      progress_percentage: 0,
    };
  });

  // Count completed modules
  if (data?.completedModules?.length > 0) {
    data.completedModules.forEach((module) => {
      if (courseProgress[module.course_id]) {
        courseProgress[module.course_id].completed_modules += 1;
      }
    });
  }

  // Count completed assessments
  if (data?.completedAssessments?.length > 0) {
    data.completedAssessments.forEach((assessment) => {
      const module = data.completedModules.find(
        (mod) => mod.module_id === assessment.module_id
      );
      if (module && courseProgress[module.course_id]) {
        courseProgress[module.course_id].completed_assessments += 1;
      }
    });
  }

  // Calculate progress percentage
  for (const courseId in courseProgress) {
    const { total_modules, completed_modules } = courseProgress[courseId];
    courseProgress[courseId].progress_percentage =
      total_modules > 0 ? (completed_modules / total_modules) * 100 : 0;
  }

  return courseProgress;
}
