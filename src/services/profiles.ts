import { getSupabase } from "@/lib/supabase";

/**
 * Resolves a username to its account email via the profiles table.
 * Usernames are stored lowercased (see idx_profiles_username_lower).
 */
export async function findEmailByUsername(
  username: string
): Promise<string | null> {
  const { data } = await getSupabase()
    .from("profiles")
    .select("email")
    .eq("username", username.toLowerCase())
    .maybeSingle();
  return data?.email ?? null;
}