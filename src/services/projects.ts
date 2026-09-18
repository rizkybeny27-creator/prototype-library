import { getSupabase } from "@/lib/supabase";
import { badRequest } from "@/lib/app-error";
import { slugify } from "@/services/slug";
import {
  mapFeedbackRow,
  mapProjectRow,
  mapVersionRow,
} from "@/lib/row-mapper";
import { TEST_TYPES } from "@/types";
import type {
  NewProjectInput,
  Project,
  ProjectDetail,
  ProjectVersionDetail,
  ProjectWithMeta,
  VersionListItem,
} from "@/types";

type Row = Record<string, unknown>;

export async function listProjects(): Promise<ProjectWithMeta[]> {
  const { data, error } = await getSupabase()
    .from("project_overview")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row: Row) => ({
    ...mapProjectRow(row),
    versionCount: row.version_count as number,
    publishedLabel: (row.published_label as string | null) ?? null,
    latestLabel: (row.latest_label as string | null) ?? null,
  }));
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const { data, error } = await getSupabase()
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapProjectRow(data) : null;
}

export async function getProjectById(id: number): Promise<Project | null> {
  const { data, error } = await getSupabase()
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapProjectRow(data) : null;
}

function assertValidInput(input: NewProjectInput): void {
  const name = input.name.trim();
  if (!name) throw badRequest("Nama project wajib diisi.");
  if (name.length > 120) throw badRequest("Nama project maksimal 120 karakter.");
  if (input.description.length > 2000) {
    throw badRequest("Deskripsi maksimal 2000 karakter.");
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!TEST_TYPES.includes(input.testType as any)) {
    throw badRequest("Jenis test tidak valid.");
  }
}

async function toUniqueSlug(name: string): Promise<string> {
  const supabase = getSupabase();
  const exists = async (slug: string) => {
    const { data } = await supabase
      .from("projects")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    return data !== null;
  };

  const base = slugify(name);
  if (!(await exists(base))) return base;

  for (let i = 2; i < 100; i++) {
    const candidate = `${base}-${i}`.slice(0, 51);
    if (!(await exists(candidate))) return candidate;
  }
  throw badRequest("Gagal membuat slug unik. Coba ubah nama project.");
}

export async function createProject(input: NewProjectInput): Promise<Project> {
  assertValidInput(input);
  const now = new Date().toISOString();
  const slug = await toUniqueSlug(input.name);

  const { data, error } = await getSupabase()
    .from("projects")
    .insert({
      name: input.name.trim(),
      description: input.description.trim(),
      test_type: input.testType,
      slug,
      created_at: now,
      updated_at: now,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapProjectRow(data);
}

export async function touchProject(projectId: number): Promise<void> {
  const { error } = await getSupabase()
    .from("projects")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", projectId);
  if (error) throw new Error(error.message);
}

export async function getProjectDetail(slug: string): Promise<ProjectDetail | null> {
  const project = await getProjectBySlug(slug);
  if (!project) return null;

  const { data, error } = await getSupabase()
    .from("versions")
    .select("*")
    .eq("project_id", project.id)
    .order("number", { ascending: false });
  if (error) throw new Error(error.message);

  const versions: VersionListItem[] = (data ?? []).map((row: Row) => ({
    ...mapVersionRow(row),
    feedbackCount: 0,
  }));

  if (versions.length > 0) {
    const ids = versions.map((v) => v.id);
    const { data: counts, error: countError } = await getSupabase()
      .from("feedback")
      .select("version_id")
      .in("version_id", ids);
    if (countError) throw new Error(countError.message);

    const tally = new Map<number, number>();
    for (const row of counts ?? []) {
      const versionId = row.version_id as number;
      tally.set(versionId, (tally.get(versionId) ?? 0) + 1);
    }
    for (const version of versions) {
      version.feedbackCount = tally.get(version.id) ?? 0;
    }
  }

  const publishedVersion =
    versions.find((v) => v.isPublished) ?? null;

  return { ...project, versions, publishedVersion };
}

export async function getProjectVersionDetail(
  slug: string,
  label: string
): Promise<ProjectVersionDetail | null> {
  const project = await getProjectBySlug(slug);
  if (!project) return null;

  const supabase = getSupabase();

  const { data: versionRow, error: versionError } = await supabase
    .from("versions")
    .select("*")
    .eq("project_id", project.id)
    .eq("label", label)
    .maybeSingle();
  if (versionError) throw new Error(versionError.message);
  if (!versionRow) return null;
  const version = mapVersionRow(versionRow);

  const { data: publishedRow, error: publishedError } = await supabase
    .from("versions")
    .select("*")
    .eq("project_id", project.id)
    .eq("is_published", true)
    .maybeSingle();
  if (publishedError) throw new Error(publishedError.message);

  const { data: feedbackRows, error: feedbackError } = await supabase
    .from("feedback")
    .select("*")
    .eq("version_id", version.id)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });
  if (feedbackError) throw new Error(feedbackError.message);

  return {
    project,
    version,
    publishedVersion: publishedRow ? mapVersionRow(publishedRow) : null,
    feedback: (feedbackRows ?? []).map(mapFeedbackRow),
  };
}