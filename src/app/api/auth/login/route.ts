import { NextResponse } from "next/server";
import { createAuthClient, type PendingCookie } from "@/lib/supabase-auth";
import { findEmailByUsername } from "@/services/profiles";

interface LoginBody {
  username?: unknown;
  password?: unknown;
  next?: unknown;
}

function validateUsername(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length < 3 || trimmed.length > 32) return null;
  if (!/^[a-zA-Z0-9_.-]+$/.test(trimmed)) return null;
  return trimmed;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as LoginBody | null;

  const username = validateUsername(body?.username);
  const password = typeof body?.password === "string" ? body.password : "";
  const next =
    typeof body?.next === "string" && body.next.startsWith("/")
      ? body.next
      : "/";

  if (!username || password.length < 6) {
    return NextResponse.json(
      { error: "Username dan password wajib diisi (password minimal 6 karakter)." },
      { status: 400 }
    );
  }

  const email = await findEmailByUsername(username);
  if (!email) {
    return NextResponse.json(
      { error: "Username atau password salah." },
      { status: 401 }
    );
  }

  const pendingCookies: PendingCookie[] = [];
  const supabase = createAuthClient({
    getAll: () => pendingCookies,
    setAll: (cookies: PendingCookie[]) => pendingCookies.push(...cookies),
  });

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.json(
      { error: "Username atau password salah." },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ ok: true, next });
  for (const cookie of pendingCookies) {
    response.cookies.set(cookie.name, cookie.value, cookie.options);
  }
  response.headers.set("Cache-Control", "no-store");
  return response;
}