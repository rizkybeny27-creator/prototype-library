import { getProjectBySlug } from "@/services/projects";
import { createVersion } from "@/services/versions";
import { apiError, created } from "@/lib/api";
import { badRequest, notFound } from "@/lib/app-error";
import { DEVICES } from "@/types";
import type { Device } from "@/types";
import {
  isValidSlug,
  isAllowedHtmlFile,
  MAX_UPLOAD_BYTES,
} from "@/services/slug";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!isValidSlug(slug)) throw notFound("Project tidak ditemukan.");

    const project = await getProjectBySlug(slug);
    if (!project) throw notFound("Project tidak ditemukan.");

    const formData = await request.formData();
    const file = formData.get("file");
    const changelogRaw = formData.get("changelog");
    const deviceRaw = formData.get("device");

    if (!(file instanceof File)) {
      throw badRequest("File HTML wajib dilampirkan.");
    }
    if (!isAllowedHtmlFile(file.name)) {
      throw badRequest("File harus berekstensi .html atau .htm.");
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      throw badRequest("Ukuran file maksimal 15 MB.");
    }

    const device: Device = DEVICES.includes(deviceRaw as Device)
      ? (deviceRaw as Device)
      : "responsive";

    const version = await createVersion(project.id, project.slug, {
      file: new Uint8Array(await file.arrayBuffer()),
      fileName: file.name,
      changelog: typeof changelogRaw === "string" ? changelogRaw : "",
      device,
    });

    return created({ version });
  } catch (error) {
    return apiError(error);
  }
}