import { backendLink } from "@/utils/token.js";
import { handleRequest, axiosInstance } from "../axios.js";

axiosInstance.defaults.baseURL = backendLink;
const basePathName = "/admin-test/";

export const getAllDataCounts = async () => {
  return handleRequest(() =>
    axiosInstance.get(basePathName + "get/all_data_counts")
  );
};

export const getAdmin_Businesses = async () => {
  return handleRequest(() => axiosInstance.get("/admin/get/businesses"));
};

export const get_List_of_Admins = async () => {
  return handleRequest(() => axiosInstance.get("/admin/get/admins_List"));
};

export const getAdmin_Courses = async (id) => {
  return handleRequest(() =>
    axiosInstance.get("/admin/get/courses?business_id=" + id)
  );
};

export const getAdmin_modules_by_courseId = async (id) => {
  return handleRequest(() =>
    axiosInstance.get("/admin/get/modules_by_course_id/" + id)
  );
};

export const getAdmin_Business_List_DropDown = async () => {
  return handleRequest(() => axiosInstance.get("/admin/get/business_list"));
};

export const getAdmin_Course_List_DropDown = async (id) => {
  return handleRequest(() =>
    axiosInstance.get("/admin/get/course_list?business_id=" + id)
  );
};

export const getBusinesses_and_Courses_list = async () => {
  return handleRequest(() =>
    axiosInstance.get("/admin/get/businesses_and_courses_list")
  );
};

export const getCourses_and_Modules_list = async (query) => {
  return handleRequest(() =>
    axiosInstance.get("/admin/get/courses_and_modules_list?mod_type=" + query)
  );
};

export const getAdmin_assessments_by_module_id = async (id) => {
  return handleRequest(() =>
    axiosInstance.get("/admin/get/assessments_by_module_id/" + id)
  );
};

export const getAdmin_pedagoggies_by_module_id = async (id) => {
  return handleRequest(() =>
    axiosInstance.get("/admin/get/pedagoggies_by_module_id/" + id)
  );
};

export const getAdmin_details_of_course = async (id) => {
  return handleRequest(() => axiosInstance.get("/admin/get/course/" + id));
};

export const getAdmin_details_of_module = async (id) => {
  return handleRequest(() => axiosInstance.get("/admin/get/module/" + id));
};

export const getAdmin_details_of_pedagogy = async (id) => {
  return handleRequest(() => axiosInstance.get("/admin/get/pedagogy/" + id));
};

export const getAdmin_details_of_asmt = async (id) => {
  return handleRequest(() => axiosInstance.get("/admin/get/assessment/" + id));
};

export const getAdminLearnerList = async () => {
  return handleRequest(() => axiosInstance.get("/admin/get/getLearners"));
};

export const getAdmin_learners_report_datatable = async (id) => {
  return handleRequest(() =>
    axiosInstance.get(
      "/admin/reports/learners_report_datatable?business_id=" + id
    )
  );
};

export const getAdmin_view_report_by_learner_id = async (id) => {
  return handleRequest(() =>
    axiosInstance.get("/admin/reports/view_report_by_learner_id/" + id)
  );
};

export const getAdminSubscriptionPlans = async () => {
  return handleRequest(() =>
    axiosInstance.get("/admin/reports/subscription_packs")
  );
};

export const getAdmin_CustomerList = async (business_Id = "null") => {
  return handleRequest(() =>
    axiosInstance.get("/admin/reports/customer_list?business_Id=" + business_Id)
  );
};

export const createPaymentOrder = async (body) => {
  return handleRequest(() =>
    axiosInstance.post("/admin/subscription/payment", body)
  );
};

export const verifyPaymentApi = async (body) => {
  return handleRequest(() =>
    axiosInstance.post("/admin/subscription/verifyPayment", body)
  );
};
