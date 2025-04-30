"use client"
import React, { useState, useEffect, useContext } from "react";
import Cookies from "universal-cookie";
import { jwtDecode } from "jwt-decode";
import { cookiesKey } from "@/utils/token";
import { toast, ToastContainer } from "react-toastify";
import { redirect, usePathname } from "next/navigation";

const allowedAuthRoutes = {
  admin: "/admin",
  user: "/learner",
}

const protectedRoutes = ["/admin", "/learner"]

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
    getStartedPack(data)
  };

  function getStartedPack(user) {
    const isEmailVerified = user?.isEmailVerified || false
    const business = user?.business_course_id || false
    const role = user?.role || null
    let route = null
    let isMessage = {
      send: false,
      message: ""
    }
    if (role === "user") {
      route = "/learner"
    }

    else if (role === "admin") {
      route = "/admin"
    }

    if (!business) {
      route += "/get-started"
      let message = role == "admin" ? "Please, Setup institute to continue" : "Please, Connect to institute to continue"
      isMessage.send = true
      isMessage.message = message
    }
    else if (!isEmailVerified) {
      route += "/email-verify"
      isMessage.send = true
      isMessage.message = "Please, Verify email to continue"
    }
    if (isMessage.send) {
      toast.info(isMessage.message)
    }

    if (route) {
      setTimeout(() => {
        redirect(route)
      }, 1200);
    }
  }

  const sign_out_handler = () => {
    // toast.success("Logged Out");
    cookies.remove(cookiesKey, { path: "/" });
    window.location.pathname = "/"
    updateAuth(null);
    redirect("/")
  };

  return (
    <UserContext.Provider value={{ auth, isAuhtLoading, signInHandler, sign_out_handler }}>
      <ToastContainer position="top-center" />
      {children}
    </UserContext.Provider>
  );
};

function useUserContext() {
  return useContext(UserContext)
}

export default useUserContext