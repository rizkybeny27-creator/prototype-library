import type { VersionLabel } from "@/types";

/** Normalizes a free-text project name into a URL-safe slug. */
export function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
  return base || "project";
}

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,49}$/;

export function isValidSlug(slug: unknown): slug is string {
  return typeof slug === "string" && slug.length > 0 && SLUG_RE.test(slug);
}

const LABEL_RE = /^v[1-9]\d{0,3}$/;

export function isValidVersionLabel(label: unknown): label is VersionLabel {
  return typeof label === "string" && LABEL_RE.test(label);
}

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15 MB, single self-contained HTML

const ALLOWED_EXTENSIONS = ["html", "htm"];

export function isAllowedHtmlFile(fileName: string): boolean {
  const ext = fileName.split(".").pop()?.toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext ?? "");
}