import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;
  const isLoggedIn = !!token;

  // Protected routes (Require authentication)
  const protectedRoutes = [
    "/dashboard",
    "/profile",
    "/workspace",
    "/onboarding",
  ];

  // Auth-only guest routes (Logged in users should not access sign-in/sign-up/guest-registration)
  const guestOnlyRoutes = [
    "/sign-in",
    "/sign-up",
    "/partner/register",
  ];

  // If logged in and accessing guest-only auth pages, redirect to workspace
  if (guestOnlyRoutes.some((route) => pathname.startsWith(route)) && isLoggedIn) {
    return NextResponse.redirect(new URL("/workspace", request.url));
  }

  // If not logged in and accessing protected pages, redirect to sign-in
  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !isLoggedIn) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/workspace/:path*",
    "/onboarding/:path*",
    "/sign-in",
    "/sign-up/:path*",
    "/verify-email/:path*",
    "/partner/:path*",
  ],
};