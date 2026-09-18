import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, adminToken, timingSafeEqual } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { token?: unknown; next?: unknown }
    | null;

  const token = typeof body?.token === "string" ? body.token : "";
  const next =
    typeof body?.next === "string" && body.next.startsWith("/")
      ? body.next
      : "/";

  const expected = adminToken();
  if (!expected) {
    return NextResponse.json(
      { error: "Server belum dikonfigurasi. Atur ADMIN_ACCESS_TOKEN di .env.local." },
      { status: 500 }
    );
  }
  if (!token || !timingSafeEqual(token, expected)) {
    return NextResponse.json({ error: "Token salah." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, next });
  response.cookies.set(ADMIN_COOKIE_NAME, expected, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}