import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CookieOptions } from "@supabase/ssr";
import { getEnvOrThrow } from "@/lib/supabase";

export const AUTH_COOKIE_OPTIONS: CookieOptions = {
  path: "/",
  sameSite: "strict",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
};

export type PendingCookie = {
  name: string;
  value: string;
  options: CookieOptions;
};

export function parseCookies(header: string | null): PendingCookie[] {
  if (!header) return [];
  return header.split(";").map((part) => {
    const idx = part.indexOf("=");
    if (idx === -1) {
      return { name: part.trim(), value: "", options: {} };
    }
    return {
      name: part.slice(0, idx).trim(),
      value: part.slice(idx + 1).trim(),
      options: {},
    };
  });
}

/**
 * Server client backed by Supabase Auth with the anon (publishable) key.
 * Sessions are persisted to cookies via the provided getAll/setAll handlers,
 * so access + refresh tokens rotate automatically on use.
 */
export function createAuthClient(input: {
  getAll: () => PendingCookie[];
  setAll: (cookies: PendingCookie[]) => void;
}): SupabaseClient {
  return createServerClient(
    getEnvOrThrow("SUPABASE_URL"),
    getEnvOrThrow("SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll: input.getAll,
        setAll: input.setAll,
      },
      cookieOptions: AUTH_COOKIE_OPTIONS,
    }
  );
}