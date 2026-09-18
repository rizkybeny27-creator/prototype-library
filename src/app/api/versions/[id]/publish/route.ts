import { getVersionById, publishVersion } from "@/services/versions";
import { apiError, ok } from "@/lib/api";
import { notFound } from "@/lib/app-error";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const versionId = Number(id);
    if (!Number.isInteger(versionId)) throw notFound("Versi tidak ditemukan.");

    const version = await getVersionById(versionId);
    if (!version) throw notFound("Versi tidak ditemukan.");

    const updated = await publishVersion(version.id, version.projectId);
    return ok({ version: updated });
  } catch (error) {
    return apiError(error);
  }
}