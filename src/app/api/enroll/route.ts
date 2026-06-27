import { NextRequest, NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: "This endpoint has been deprecated. Use POST /api/enrollments instead.",
    },
    { status: 410 }
  );
}