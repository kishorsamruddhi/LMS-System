import { backendLink } from "@/utils/token.js";
import { handleRequest, axiosInstance } from "../axios.js";

axiosInstance.defaults.baseURL = backendLink;

export const updateAdminBusiness = async (body) => {
  return handleRequest(() =>
    axiosInstance.put("/admin/update/update_business", body)
  );
};

export const updateAdminCourse = async (body) => {
  return handleRequest(() =>
    axiosInstance.put("/admin/update/update_course", body)
  );
};

export const updateAdminModule = async (body) => {
  return handleRequest(() =>
    axiosInstance.put("/admin/update/update_module", body)
  );
};

export const updateAdmin_Assessment = async (body) => {
  return handleRequest(() =>
    axiosInstance.put("/admin/update/update_assessment", body)
  );
};

export const updateAdmin_Pedagogy = async (body) => {
  return handleRequest(() =>
    axiosInstance.put("/admin/update/update_pedagogy", body)
  );
};
