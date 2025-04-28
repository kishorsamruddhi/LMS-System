"use server";
import { cookies } from "next/headers";
import { cookiesKey } from "./token";
import { jwtDecode } from "jwt-decode";

export default async function serverTokenDecode() {
  const cookieStore = cookies();
  const token = cookieStore.get(cookiesKey)?.value;

  if (token) {
    const decoded = decodingToken(token);
    if (decoded) {
      // Check if the token is expired
      const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
      if (decoded.exp && decoded.exp < currentTime) {
        // Token is expired, remove it from cookies
        cookieStore.delete(cookiesKey);
        return null; // Return null since the token is expired
      }
      return decoded; // Return the decoded token if it's valid
    }
  }
  return null; // Return null if no token or decoding failed
}

function decodingToken(token = "") {
  try {
    const decoded = jwtDecode(token);
    if (!decoded.user || !decoded.user.email) {
      throw new Error("User Details Invalid");
    }
    return decoded;
  } catch (error) {
    return null; // Return null if decoding fails
  }
}
