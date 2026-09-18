import { NextResponse } from "next/server";
import {
  createAuthClient,
  parseCookies,
  type PendingCookie,
} from "@/lib/supabase-auth";

export async function POST(request: Request) {
  const pendingCookies: PendingCookie[] = [];
  const supabase = createAuthClient({
    getAll: () => parseCookies(request.headers.get("cookie")),
    setAll: (cookies: PendingCookie[]) => pendingCookies.push(...cookies),
  });

  await supabase.auth.signOut();

  const response = NextResponse.json({ ok: true });
  for (const cookie of pendingCookies) {
    response.cookies.set(cookie.name, cookie.value, cookie.options);
  }
  response.headers.set("Cache-Control", "no-store");
  return response;
}