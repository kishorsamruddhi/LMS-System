import { backendLink } from "@/utils/token";
import { axiosInstance, handleRequest } from "./axios";

axiosInstance.defaults.baseURL = backendLink;

export const loginApi = async ({ password, email }) => {
  return handleRequest(() =>
    axiosInstance.post("/auth/login", { password, email })
  );
};

export const setupAdminApi = async ({
  business_name,
  business_desc,
  category,
}) => {
  return handleRequest(() =>
    axiosInstance.post("/setup/institue", {
      business_name,
      business_desc,
      category,
    })
  );
};

// Get - Token from Email and Verify Token to Join
export const setupUserApi = async ({ email }) => {
  return handleRequest(() => axiosInstance.post("/setup/user", { email }));
};

export const sendInvitationApi = async ({ email }) => {
  return handleRequest(() =>
    axiosInstance.post("/setup/institute-invite", { email })
  );
};

// export const setupValidteUserApi = async () => {
//   return handleRequest(() => axiosInstance.get("/setup/user-validate"));
// };

// export const setupValidteAdminApi = async () => {
//   return handleRequest(() => axiosInstance.get("/setup/admin-validate"));
// };
