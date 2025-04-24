import { backendLink } from "@/utils/token";
import { axiosInstance, handleRequest } from "./axios";

axiosInstance.defaults.baseURL = backendLink;
export const loginApi = async ({ password, email }) => {
  return handleRequest(() =>
    axiosInstance.post("/auth/login", { password, email })
  );
};
