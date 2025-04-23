export function countsAndData(responseFromApi) {
  try {
    const newResp = { ...responseFromApi };
    const learning_coursesList = newResp?.learning_coursesList.flatMap(
      (val) => val.user_record
    );

    newResp.learning_coursesList = learning_coursesList || [];

    const response = newResp;

    const getIdsOfAsmtAndPeda = extractIdsFromCourses(response.data);

    const completedCoursesIds = response.completed_coursesList.flatMap(
      (val) => val.source_id
    );

    const completedCourses =
      completedCoursesIds.length > 0
        ? response.data.filter((cor) => cor._id === completedCoursesIds[0])
        : [];

    const all_learning_courses_ids = newResp?.learning_coursesList.flatMap(
      (val) => val.course_id
    );

    const learningCourseIds = response.learning_coursesList.flatMap(
      (val) => val._id
    );

    const learningCourse =
      learningCourseIds.length > 0
        ? response.data.filter((cor) => cor._id === learningCourseIds[0])
        : 0;

    function extractIdsFromCourses(courses) {
      const result = [];
      courses.forEach((course) => {
        course.modules.forEach((module) => {
          result.push(...module.assessments, ...module.pedagogies);
        });
        return;
      });

      return result;
    }

    const idsOfCompletedModules = getCompletedMods(response);

    function getCompletedMods(data) {
      const result = [];

      data.learning_coursesList.forEach((course) => {
        course?.completed_Modules?.forEach((module) => {
          result.push(module.source_id);
        });
        return;
      });

      completedCoursesIds.forEach((id) =>
        data.data.forEach((cor) => {
          if (cor._id === id) {
            const ids = cor.modules.flatMap((mod) => mod._id);
            result.push(...ids);
          }
          return;
        })
      );

      return result;
    }

    const idsOfCompletedAsmt = getCompletedAsmt(response);

    function getCompletedAsmt(data) {
      const result = [];
      data?.learning_coursesList?.forEach((course) => {
        course?.completed_Modules?.forEach((module) => {
          module.user_record?.completed_Assessments.forEach((asmt) => {
            result.push(asmt.source_id);
          });
        });

        course?.learning_Modules?.forEach((module) => {
          module.user_record?.completed_Assessments.forEach((asmt) => {
            result.push(asmt.source_id);
          });
        });
        return;
      });

      completedCoursesIds?.forEach((id) =>
        data.data.forEach((cor) => {
          if (cor._id === id) {
            cor.modules.forEach((module) => {
              result.push(...module.assessments);
            });
          }
        })
      );

      return result;
    }
    const idsOfCompletedPeda = getCompletedPeda(response);

    function getCompletedPeda(data) {
      const result = [];

      data?.learning_coursesList?.forEach((course) => {
        course?.completed_Modules?.forEach((module) => {
          module.user_record?.completed_pedagoggies.forEach((peda) => {
            result.push(peda.source_id);
          });
        });

        course?.learning_Modules?.forEach((module) => {
          module.user_record?.completed_pedagoggies.forEach((peda) => {
            result.push(peda.source_id);
          });
        });
        return;
      });

      completedCoursesIds?.forEach((id) =>
        data.data.forEach((cor) => {
          if (cor._id === id) {
            cor.modules.forEach((module) => {
              result.push(...module.pedagogies);
            });
          }
        })
      );

      return result;
    }
    const coursesCompletedModulesCount = xyz(response);

    function xyz(data) {
      let newObj = {};
      data.learning_coursesList.forEach((co) => {
        return (newObj[co.course_id] = co.completed_Modules.length);
      });

      completedCoursesIds?.forEach((id) =>
        data.data.forEach((cor) => {
          if (cor._id === id) {
            return (newObj[cor._id] = cor.modules.length);
          }
          return;
        })
      );
      return newObj;
    }

    const allLearningModules = response.learning_coursesList
      .flatMap((cor) => cor.learning_Modules)
      .flatMap((cor) => cor.user_record);

    const allModules = response.data.flatMap((cor) => cor.modules);
    return {
      getIdsOfAsmtAndPeda,
      idsOfCompletedModules,
      idsOfCompletedAsmt,
      idsOfCompletedPeda,
      coursesCompletedModulesCount,
      completedCourses,
      learningCourse,
      allLearningModules,
      allModules,
      all_learning_courses_ids,
    };
  } catch (error) {
    return {
      getIdsOfAsmtAndPeda: [],
      idsOfCompletedModules: [],
      idsOfCompletedAsmt: [],
      idsOfCompletedPeda: [],
      coursesCompletedModulesCount: [],
      completedCourses: [],
      learningCourse: [],
      all_learning_courses_ids: [],
    };
  }
}
