import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const next = searchParams.get("redirect") || "/academy/dashboard";

  return NextResponse.redirect(`${origin}${next}`);
}
