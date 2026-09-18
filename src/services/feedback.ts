import { badRequest, notFound } from "@/lib/app-error";
import { mapFeedbackRow } from "@/lib/row-mapper";
import { getSupabase } from "@/lib/supabase";
import { getVersionById } from "@/services/versions";
import { touchProject } from "@/services/projects";
import { NPS_SCORES } from "@/types";
import type { Feedback, NewFeedbackInput, NpsScore } from "@/types";

export interface FeedbackStats {
  count: number;
  average: number | null;
  distribution: Record<NpsScore, number>;
}

export async function createFeedback(
  versionId: number,
  input: NewFeedbackInput
): Promise<Feedback> {
  const testerName = input.testerName.trim();
  const division = input.division.trim();
  const feedback = input.feedback.trim();

  if (!testerName) throw badRequest("Nama wajib diisi.");
  if (testerName.length > 100) {
    throw badRequest("Nama maksimal 100 karakter.");
  }
  if (!division) throw badRequest("Divisi wajib diisi.");
  if (division.length > 100) {
    throw badRequest("Divisi maksimal 100 karakter.");
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!NPS_SCORES.includes(input.npsScore as any)) {
    throw badRequest("Skor penilaian harus 1–5.");
  }
  if (!feedback) throw badRequest("Feedback wajib diisi.");
  if (feedback.length > 4000) {
    throw badRequest("Feedback maksimal 4000 karakter.");
  }

  const version = await getVersionById(versionId);
  if (!version) throw notFound("Versi tidak ditemukan.");

  const { data, error } = await getSupabase()
    .from("feedback")
    .insert({
      version_id: versionId,
      tester_name: testerName,
      division,
      nps_score: input.npsScore,
      feedback,
      created_at: new Date().toISOString(),
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);

  await touchProject(version.projectId);
  return mapFeedbackRow(data);
}

export async function listFeedbackByVersion(versionId: number): Promise<Feedback[]> {
  const { data, error } = await getSupabase()
    .from("feedback")
    .select("*")
    .eq("version_id", versionId)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapFeedbackRow);
}

export function feedbackStats(feedback: Feedback[]): FeedbackStats {
  const distribution: Record<NpsScore, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const item of feedback) {
    distribution[item.npsScore] += 1;
  }
  const total = feedback.reduce((sum, item) => sum + item.npsScore, 0);
  return {
    count: feedback.length,
    average: feedback.length > 0 ? Math.round((total / feedback.length) * 10) / 10 : null,
    distribution,
  };
}