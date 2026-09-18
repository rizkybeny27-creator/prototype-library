import type {
  Feedback,
  NewFeedbackInput,
  NewProjectInput,
  Project,
  Version,
} from "@/types";

export interface ApiResult<T> {
  data?: T;
  error?: string;
}

interface ApiErrorBody {
  error?: string;
}

async function request<T>(
  path: string,
  init?: RequestInit
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(path, init);
    const body = (await res.json().catch(() => null)) as T & ApiErrorBody | null;

    if (!res.ok) {
      return {
        error: body?.error ?? "Terjadi kesalahan. Silakan coba lagi.",
      };
    }
    return { data: body as T };
  } catch {
    return {
      error: "Koneksi gagal. Periksa jaringan, lalu coba lagi.",
    };
  }
}

export function apiCreateProject(
  input: NewProjectInput
): Promise<ApiResult<{ project: Project }>> {
  return request("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: input.name,
      description: input.description,
      testType: input.testType,
    }),
  });
}

export function apiUploadVersion(
  slug: string,
  formData: FormData
): Promise<ApiResult<{ version: Version }>> {
  return request(`/api/projects/${encodeURIComponent(slug)}/versions`, {
    method: "POST",
    body: formData,
  });
}

export function apiPublishVersion(
  versionId: number
): Promise<ApiResult<{ version: Version }>> {
  return request(`/api/versions/${versionId}/publish`, { method: "POST" });
}

export function apiSubmitFeedback(
  versionId: number,
  input: NewFeedbackInput
): Promise<ApiResult<{ feedback: Feedback }>> {
  return request(`/api/versions/${versionId}/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}