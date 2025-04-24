import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookiesKey } from "@/utils/token";

const availableRoutes = {
  admin: "/admin",
  user: "/training",
  auth: "/auth",
};

export async function middleware(request) {
  console.log("Incoming request URL:", request.nextUrl.href);
  console.log("Incoming pathname:", request.nextUrl.pathname);
  const cookies = await request.cookies;
  const token = cookies.get(cookiesKey)?.value;
  const { pathname } = request.nextUrl;
  if (!token) {
    if (
      pathname === "/" ||
      pathname.startsWith(availableRoutes.auth) ||
      pathname === "/page404"
      // ||pathname === "/training"
    ) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/page404", request.url));
  }

  try {
    const decoded = jwt.decode(token);
    const userRole = decoded.user?.role;
    const isEmailVerified = decoded.user?.isEmailVerified;

    const redirectToGetStarted = (basePath) => {
      const url = new URL(`${basePath}/get-started`, request.url);
      return NextResponse.redirect(url);
    };

    if (userRole === "admin") {
      if (!pathname.startsWith(availableRoutes.admin)) {
        return NextResponse.redirect(
          new URL(availableRoutes.admin, request.url)
        );
      }
      if (
        !isEmailVerified &&
        pathname !== `${availableRoutes.admin}/get-started`
      ) {
        return redirectToGetStarted(availableRoutes.admin);
      }
    } else if (userRole === "user") {
      if (!pathname.startsWith(availableRoutes.user)) {
        return NextResponse.redirect(
          new URL(availableRoutes.user, request.url)
        );
      }
      if (
        !isEmailVerified &&
        pathname !== `${availableRoutes.user}/get-started`
      ) {
        return redirectToGetStarted(availableRoutes.user);
      }
    }
    return NextResponse.next();
  } catch (error) {
    console.error("JWT decoding error:", error.message);
    return NextResponse.redirect(new URL("/page404", request.url));
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
