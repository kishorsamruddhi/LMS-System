"use client"
import React, { useState, useEffect, useContext } from "react";
import Cookies from "universal-cookie";
import { jwtDecode } from "jwt-decode";

export const cookiesKey = "Xperiento-cookies";
export const dataCookieAuth = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjY3ZDg0YTc3MjEyMWNmYmE1YTI4ZjE2NCIsImVtYWlsIjoidGVzdHN0YWZmQGdtYWlsLmNvbSIsInJvbGUiOiJzdGFmZiIsImZpcnN0TmFtZSI6IlRlc3QiLCJsYXN0TmFtZSI6IlN0YWZmIn0sImlhdCI6MTc0NTMzNjU3MywiZXhwIjoxNzQ1NzY4NTczfQ.T02CFved6y7FGHgd4CvU3FO1NPFrBXyHreatAKna8Us"

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
  const token = cookies.get(cookiesKey);
  const [auth, updateAuth] = useState(null);
  const [isAuhtLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userData = decodingToken(dataCookieAuth);
    if (userData) {
      updateAuth(userData.user);
    }
    setIsLoading(false)
  }, []);

  const signInHandler = (data, token) => {
    updateAuth(data);
    cookies.set(cookiesKey, token, { path: "/" });
  };

  const sign_out_handler = () => {
    // toast.success("Logged Out");
    cookies.remove(cookiesKey, { path: "/" });
    window.location.pathname = "/"
    updateAuth(null);
  };

  return (
    <UserContext.Provider value={{ auth, isAuhtLoading, signInHandler, sign_out_handler }}>
      {children}
    </UserContext.Provider>
  );
};

function useUserContext() {
  return useContext(UserContext)
}

export default useUserContext