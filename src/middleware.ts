import { type NextRequest, NextResponse } from "next/server";

const publicPaths = [
  "/auth/login",
  "/auth/register",
  "/",
  "/about",
  "/academy",
  "/academy/pricing",
  "/insights",
  "/projects",
  "/hire",
  "/pricing",
  "/community",
  "/careers",
  "/contact",
  "/privacy",
  "/terms",
];

function isPublicPath(path: string): boolean {
  return publicPaths.some((p) => path === p || path.startsWith(p + "/"));
}

function isStaticAsset(path: string): boolean {
  return /\.(svg|png|jpg|jpeg|gif|webp|ico|css|js)$/.test(path);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isStaticAsset(pathname) || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  if (
    (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login") && !pathname.startsWith("/admin/forgot-password")) ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/proposals") ||
    pathname.startsWith("/notifications") ||
    pathname.startsWith("/messages") ||
    pathname.startsWith("/payments") ||
    pathname.startsWith("/downloads") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/hire/review") ||
    pathname.startsWith("/hire/checkout") ||
    pathname.startsWith("/hire/order") ||
    pathname.startsWith("/academy/dashboard") ||
    pathname.startsWith("/academy/enrollment")
  ) {
    const hasSession = request.cookies.has("codemafia_session");
    if (!hasSession) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
