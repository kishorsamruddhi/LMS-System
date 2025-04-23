import { axiosInstance, handleRequest } from "./axios";

export const staffTrainingValidator = async () => {
  return handleRequest(() =>
    axiosInstance.get("/tracking/check-training-validation")
  );
};

export const getAdmin_getStaffList = async () => {
  return handleRequest(() =>
    axiosInstance.get("/normal-admin/get/getStaffList")
  );
};

export const getAdmin_addStaffToLearner = async (body) => {
  return handleRequest(() =>
    axiosInstance.post("/normal-admin/add/add_learner", body)
  );
};

export const getAdmin_learners_report_datatable = async () => {
  return handleRequest(() =>
    axiosInstance.get("/normal-admin/get/learners_report_datatable")
  );
};

export const getAdmin_view_report_by_learner_id = async (id) => {
  return handleRequest(() =>
    axiosInstance.get(
      "/normal-admin/get/reports/view_report_by_learner_id/" + id
    )
  );
};

export const get_pedagoggies_with_status = async (module_id) => {
  return handleRequest(() =>
    axiosInstance.get("/get/get_pedagoggies_with_status?module_id=" + module_id)
  );
};

export const get_assessments_with_status = async (module_id) => {
  return handleRequest(() =>
    axiosInstance.get("/get/get_assessments_with_status?module_id=" + module_id)
  );
};

export const submitAssessmentAnswer = async (body) => {
  return handleRequest(() => axiosInstance.post("/progress/checkAnswer", body));
};

export const update_pedagogy_Status = async (body) => {
  return handleRequest(() =>
    axiosInstance.post("/progress/update_pedagogy_Status", body)
  );
};

export const update_user_learning_time = async (body) => {
  return handleRequest(() =>
    axiosInstance.post("/progress/update_user_learning_time", body)
  );
};

export const get_user_learning_stats = async () => {
  return handleRequest(() => axiosInstance.get("/get/get_user_learning_time"));
};

export const getCompletedCourses = async () => {
  return handleRequest(() =>
    axiosInstance.get("/tracking/getCompletedCourses")
  );
};

export const downloadCompletedCourseById = async (id) => {
  return handleRequest(() =>
    axiosInstance.get("/tracking/getCompletedCourse/" + id)
  );
};

export const getCoursesAndModulesWithStats = async () => {
  return handleRequest(() => axiosInstance.get("/tracking/getAllStats"));
};

export const get_assessments_result = async () => {
  return handleRequest(() =>
    axiosInstance.get("/tracking/get_user_assessments_results")
  );
};
