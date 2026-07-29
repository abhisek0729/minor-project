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

  // Protected routes
  const protectedRoutes = [
    "/dashboard",
    "/profile",
  ];

  //public routes
  const publicRoutes = [
    "/sign-in",
    "/sign-up",
    "/verify-email",
    "/partner"
  ]

  if (
    publicRoutes.some((route) =>
      pathname.startsWith(route)
    ) &&
    isLoggedIn
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }


  if (
    protectedRoutes.some((route) =>
      pathname.startsWith(route)
    ) &&
    !isLoggedIn
  ) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }



  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/sign-in",
    "/sign-up/:path*",
    "/verify-email/:path*",
    "/partner/:path*"
  ],
};