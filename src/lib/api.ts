import { AppError } from "@/lib/app-error";

export function ok<T>(data: T, init: ResponseInit = {}): Response {
  return Response.json(data, { status: 200, ...init });
}

export function created<T>(data: T): Response {
  return Response.json(data, { status: 201 });
}

export function apiError(error: unknown): Response {
  if (error instanceof AppError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  console.error("[api]", error);
  return Response.json(
    { error: "Terjadi kesalahan tak terduga. Silakan coba lagi." },
    { status: 500 }
  );
}