"use client"
import React, { useState, useEffect, useContext } from "react";
import Cookies from "universal-cookie";
import { jwtDecode } from "jwt-decode";
import { cookiesKey } from "@/utils/token";
import { toast, ToastContainer } from "react-toastify";
import { redirect } from "next/navigation";

export const UserContext = React.createContext();
export function decodingToken(token = "") {
  try {
    const decoded = jwtDecode(token);
    if (!decoded.user.email) {
      throw new Error("User Details Invaild")
    }
    return decoded;
  } catch (error) {
    return null;
  }
}

export const UserProvider = ({ children }) => {
  const cookies = new Cookies();
  const [auth, updateAuth] = useState(null);
  const [isAuhtLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = cookies.get(cookiesKey);
    const userData = decodingToken(token);
    if (userData) {
      updateAuth(userData.user);
    }
    setIsLoading(false)
  }, []);

  const signInHandler = (data, token) => {
    updateAuth(data);
    cookies.set(cookiesKey, token, { path: "/" });
    const isEmailVerified = data?.isEmailVerified || false
    const business = data?.business_course_id || false
    const role = data?.role || null
    let route = null
    if (role === "user") {
      route = "/learner"
    }
    else if (role === "admin") {
      route = "/admin"
    }

    if (!isEmailVerified) {
      route += "/email-verify"
      toast.info("Please, Verify email to continue")
    }

    if (!business) {
      route += "/get-started"
      let message = role == "admin" ? "Please, Setup Institue to continue" : "Please, Connect to Institue to continue"
      toast.info(message)
    }
    if (route) {
      setTimeout(() => {
        redirect(route)
      }, 1200);
    }
  };

  const sign_out_handler = () => {
    // toast.success("Logged Out");
    cookies.remove(cookiesKey, { path: "/" });
    window.location.pathname = "/"
    updateAuth(null);
  };

  return (
    <UserContext.Provider value={{ auth, isAuhtLoading, signInHandler, sign_out_handler }}>
      <ToastContainer />
      {children}
    </UserContext.Provider>
  );
};

function useUserContext() {
  return useContext(UserContext)
}

export default useUserContext