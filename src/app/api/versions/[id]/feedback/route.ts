import { createFeedback } from "@/services/feedback";
import { getVersionById } from "@/services/versions";
import { apiError, created } from "@/lib/api";
import { badRequest, notFound } from "@/lib/app-error";
import { NPS_SCORES } from "@/types";

interface FeedbackBody {
  testerName?: string;
  division?: string;
  npsScore?: number;
  feedback?: string;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const versionId = Number(id);
    if (!Number.isInteger(versionId)) throw notFound("Versi tidak ditemukan.");

    const version = await getVersionById(versionId);
    if (!version) throw notFound("Versi tidak ditemukan.");

    const body = (await request.json()) as FeedbackBody;
    if (
      typeof body.testerName !== "string" ||
      typeof body.division !== "string" ||
      typeof body.npsScore !== "number" ||
      typeof body.feedback !== "string"
    ) {
      throw badRequest("Data feedback tidak lengkap.");
    }
    if (!NPS_SCORES.includes(body.npsScore as (typeof NPS_SCORES)[number])) {
      throw badRequest("Skor penilaian harus 1–5.");
    }

    const feedback = await createFeedback(version.id, {
      testerName: body.testerName,
      division: body.division,
      npsScore: body.npsScore as (typeof NPS_SCORES)[number],
      feedback: body.feedback,
    });

    return created({ feedback });
  } catch (error) {
    return apiError(error);
  }
}