// import { cookieKEY } from "@/utils/Const";
// src/axiosInstance.js
import axios from "axios";
// import Cookies from "universal-cookie";
import Cookies from "universal-cookie";
import { backendLink, cookiesKey, dataCookieAuth } from "@/utils/token";

const axiosInstance = axios.create({
  baseURL: backendLink,
  timeout: 60000,
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  async function (config) {
    try {
      config.headers["Content-Type"] = "application/json";
      config.headers.Accept = "application/json";
      const cookies = new Cookies();
      const token = cookies.get(cookiesKey) || dataCookieAuth;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("error ==> ", error.message);
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  function (response) {
    return response.data;
  },
  function (error) {
    return Promise.reject(error);
  }
);

const handleRequest = async (request) => {
  let res;
  try {
    res = await request();
    return res;
  } catch (error) {
    if (res) return res;
    const statusCode = error.response ? error.response.status : 500;
    const responseData = error.response ? error.response.data : null;
    return responseData;
  }
};

export { axiosInstance, handleRequest };
