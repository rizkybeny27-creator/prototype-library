import { notFound } from "@/lib/app-error";
import { mapVersionRow } from "@/lib/row-mapper";
import { getSupabase } from "@/lib/supabase";
import { touchProject } from "@/services/projects";
import { writeVersionHtml } from "@/services/files";
import type { Device, Version } from "@/types";

export async function getVersionById(id: number): Promise<Version | null> {
  const { data, error } = await getSupabase()
    .from("versions")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapVersionRow(data) : null;
}

export async function getVersionByProjectSlug(
  projectSlug: string,
  label: string
): Promise<Version | null> {
  const supabase = getSupabase();

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id")
    .eq("slug", projectSlug)
    .maybeSingle();
  if (projectError) throw new Error(projectError.message);
  if (!project) return null;

  const { data, error } = await supabase
    .from("versions")
    .select("*")
    .eq("project_id", project.id)
    .eq("label", label)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapVersionRow(data) : null;
}

export async function listVersions(projectId: number): Promise<Version[]> {
  const { data, error } = await getSupabase()
    .from("versions")
    .select("*")
    .eq("project_id", projectId)
    .order("number", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapVersionRow);
}

async function nextVersionNumber(projectId: number): Promise<number> {
  const { data, error } = await getSupabase()
    .from("versions")
    .select("number")
    .eq("project_id", projectId)
    .order("number", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data?.number as number | undefined ?? 0) + 1;
}

/**
 * Writes the uploaded HTML to Supabase Storage and records the version metadata.
 * The new version is never auto-published (R4: only one published at a time).
 */
export async function createVersion(
  projectId: number,
  projectSlug: string,
  input: {
    file: Uint8Array;
    fileName: string;
    changelog: string;
    device: Device;
  }
): Promise<Version> {
  const now = new Date().toISOString();
  const number = await nextVersionNumber(projectId);
  const label = `v${number}` as const;

  const stored = await writeVersionHtml(projectSlug, label, input.file);

  const { data, error } = await getSupabase()
    .from("versions")
    .insert({
      project_id: projectId,
      number,
      label,
      changelog: input.changelog.trim(),
      test_notes: "",
      file_name: stored.fileName,
      size_bytes: stored.sizeBytes,
      is_published: false,
      device: input.device,
      created_at: now,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);

  await touchProject(projectId);
  return mapVersionRow(data);
}

/**
 * Publishes a single version, atomically unpublishing any other
 * active version in the same project via the publish_version RPC (R3 + R4).
 */
export async function publishVersion(
  versionId: number,
  projectId: number
): Promise<Version> {
  const { data, error } = await getSupabase().rpc("publish_version", {
    p_version_id: versionId,
    p_project_id: projectId,
  });
  if (error) throw new Error(error.message);
  if (!data) throw notFound("Versi tidak ditemukan.");
  return mapVersionRow(data);
}