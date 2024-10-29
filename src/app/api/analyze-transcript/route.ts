import { protectedRoute } from "@/lib/api/protected-route";
import { NextResponse } from "next/server";

export const POST = protectedRoute(async (req, userId) => {
  try {
    const data = await req.json();
    // Your protected API logic here
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 400 }
    );
  }
});
