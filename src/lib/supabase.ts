import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

export const HTML_BUCKET =
  process.env.SUPABASE_STORAGE_BUCKET ?? "prototype-html";

const globalForSupabase = globalThis as unknown as {
  __prototypeSupabase?: SupabaseClient;
  __prototypeBucketChecked?: boolean;
};

export function getEnvOrThrow(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing ${name} in environment. Copy .env.example ke .env.local dan isi nilainya.`
    );
  }
  return value;
}

export async function getSupabaseAnonKey(): Promise<string> {
  return getEnvOrThrow("SUPABASE_ANON_KEY");
}

export function getSupabase(): SupabaseClient {
  if (globalForSupabase.__prototypeSupabase) {
    return globalForSupabase.__prototypeSupabase;
  }
  const client = createClient(
    getEnvOrThrow("SUPABASE_URL"),
    getEnvOrThrow("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false } }
  );
  globalForSupabase.__prototypeSupabase = client;
  return client;
}

export async function ensureHtmlBucket(): Promise<void> {
  if (globalForSupabase.__prototypeBucketChecked) return;
  const supabase = getSupabase();
  const { error } = await supabase.storage.getBucket(HTML_BUCKET);
  if (error) {
    const { error: createError } = await supabase.storage.createBucket(HTML_BUCKET, {
      public: false,
      fileSizeLimit: 15 * 1024 * 1024,
    });
    if (createError) {
      throw new Error(
        `Gagal membuat storage bucket "${HTML_BUCKET}": ${createError.message}`
      );
    }
  }
  globalForSupabase.__prototypeBucketChecked = true;
}