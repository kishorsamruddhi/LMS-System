import { NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";
import { cookiesKey } from "@/utils/token";

const availableRoutes = {
  admin: "/admin",
  user: "/learner",
};

const protectedRoutes = ["/admin", "/learner"];

export async function middleware(request) {
  const cookies = await request.cookies;
  const token = cookies.get(cookiesKey)?.value;
  const { pathname } = request.nextUrl;
  let isRequestingProtectedRoute = false;

  protectedRoutes.map((val) => {
    if (pathname.includes(val)) {
      isRequestingProtectedRoute = true;
    }
  });

  if (!token && isRequestingProtectedRoute) {
    return NextResponse.redirect(new URL("/auth-error", request.url));
  }
  if (token) {
    try {
      const decoded = jwtDecode(token);
      const userRole = decoded.user?.role;
      const roleRoute = availableRoutes[userRole];

      let isValidForThisUser = pathname.includes(roleRoute);

      if (isRequestingProtectedRoute && !isValidForThisUser) {
        throw new Error("Page is not available");
      }
      return NextResponse.next();
    } catch (error) {
      return NextResponse.redirect(new URL("/page-not-available", request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
