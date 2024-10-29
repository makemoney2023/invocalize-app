import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_CONFIG } from "@/lib/auth/config";

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();
  const path = request.nextUrl.pathname;

  const isPublicPath = AUTH_CONFIG.publicRoutes.some((pattern) => {
    if (pattern.includes('(.*)')) {
      return new RegExp(`^${pattern}$`).test(path);
    }
    return path === pattern || path.startsWith(`${pattern}/`);
  });

  if (!isPublicPath && !userId) {
    const loginUrl = new URL(AUTH_CONFIG.routes.signIn, request.url);
    loginUrl.searchParams.set('redirect_url', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!.*\\.|_next|api/public).*)",
    "/",
    "/(api|trpc)(.*)",
  ]
};
