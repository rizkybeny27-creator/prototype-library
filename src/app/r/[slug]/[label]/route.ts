import { getVersionByProjectSlug } from "@/services/versions";
import { readVersionHtml } from "@/services/files";
import { isValidSlug, isValidVersionLabel } from "@/services/slug";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; label: string }> }
) {
  const { slug, label } = await params;
  if (!isValidSlug(slug) || !isValidVersionLabel(label)) {
    return new Response("Not found", { status: 404 });
  }

  const version = await getVersionByProjectSlug(slug, label);
  const html = version ? await readVersionHtml(slug, label) : null;
  if (!version || !html) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(new Uint8Array(html), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Length": String(html.byteLength),
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}