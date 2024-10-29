import { clerkMiddleware } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export default clerkMiddleware();

// Required configuration for Next.js middleware
export const config = {
  matcher: ["/((?!sign-in|sign-up|api/webhook).*)"],
};
