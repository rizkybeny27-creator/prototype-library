import { HTML_BUCKET, ensureHtmlBucket, getSupabase } from "@/lib/supabase";
import type { VersionLabel } from "@/types";

function versionStoragePath(projectSlug: string, label: VersionLabel): string {
  return `projects/${projectSlug}/${label}/index.html`;
}

export async function writeVersionHtml(
  projectSlug: string,
  label: VersionLabel,
  contents: Uint8Array
): Promise<{ fileName: string; sizeBytes: number }> {
  await ensureHtmlBucket();
  const storagePath = versionStoragePath(projectSlug, label);
  const { error } = await getSupabase()
    .storage.from(HTML_BUCKET)
    .upload(storagePath, contents, {
      contentType: "text/html; charset=utf-8",
      upsert: true,
    });
  if (error) {
    throw new Error(`Gagal menyimpan HTML: ${error.message}`);
  }
  return { fileName: "index.html", sizeBytes: contents.byteLength };
}

export async function readVersionHtml(
  projectSlug: string,
  label: VersionLabel
): Promise<Uint8Array | null> {
  const storagePath = versionStoragePath(projectSlug, label);
  const { data, error } = await getSupabase()
    .storage.from(HTML_BUCKET)
    .download(storagePath);
  if (error) return null;
  const buffer = await data.arrayBuffer();
  return new Uint8Array(buffer);
}