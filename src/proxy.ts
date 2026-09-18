import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME, adminToken, timingSafeEqual } from "@/lib/admin-auth";

const RATE_LIMIT: Record<
  "upload" | "feedback",
  { limit: number; windowMs: number }
> = {
  upload: { limit: 30, windowMs: 60_000 },
  feedback: { limit: 20, windowMs: 60_000 },
};

const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string, kind: "upload" | "feedback"): boolean {
  const cfg = RATE_LIMIT[kind];
  const now = Date.now();
  const bucket = rateBuckets.get(`${kind}:${ip}`);
  if (!bucket || now >= bucket.resetAt) {
    rateBuckets.set(`${kind}:${ip}`, { count: 1, resetAt: now + cfg.windowMs });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= cfg.limit;
}

function isPublic(request: NextRequest): boolean {
  const { pathname } = request.nextUrl;
  if (pathname === "/login") return true;
  if (pathname.startsWith("/_next/") || pathname === "/favicon.ico") return true;
  if (pathname.startsWith("/t/")) return true;
  if (pathname.startsWith("/r/")) return true;
  if (pathname === "/api/auth/login" || pathname === "/api/auth/logout") return true;
  if (
    pathname.startsWith("/api/versions/") &&
    pathname.endsWith("/feedback") &&
    request.method === "POST"
  ) {
    return true;
  }
  return false;
}

function isAuthed(request: NextRequest): boolean {
  const token = adminToken();
  if (!token) return false;
  const cookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  return cookie ? timingSafeEqual(cookie, token) : false;
}

export function proxy(request: NextRequest) {
  const now = Date.now();
  if (rateBuckets.size > 10_000) {
    for (const [key, bucket] of rateBuckets) {
      if (now >= bucket.resetAt) rateBuckets.delete(key);
    }
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (request.method === "POST") {
    const { pathname } = request.nextUrl;
    if (
      pathname.startsWith("/api/projects/") &&
      pathname.endsWith("/versions") &&
      !checkRateLimit(ip, "upload")
    ) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan. Coba lagi nanti." },
        { status: 429 }
      );
    }
    if (
      pathname.startsWith("/api/versions/") &&
      pathname.endsWith("/feedback") &&
      !checkRateLimit(ip, "feedback")
    ) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan. Coba lagi nanti." },
        { status: 429 }
      );
    }
  }

  if (isPublic(request) || isAuthed(request)) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: "Unauthorized. Silakan login sebagai admin." },
      { status: 401 }
    );
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
  // Skip static assets (files with extensions) and Next.js internals.
};