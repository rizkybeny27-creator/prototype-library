import { getVersionByProjectSlug } from "@/services/versions";
import { readVersionHtml } from "@/services/files";
import { isValidSlug, isValidVersionLabel } from "@/services/slug";

export const dynamic = "force-dynamic";

const VIEWPORT_META = '<meta name="viewport" content="width=device-width, initial-scale=1" />';
const BASE_STYLE =
  "<style>html,body{margin:0;min-height:100%;min-height:100dvh}*,*::before,*::after{box-sizing:border-box}</style>";
const HEIGHT_PROBE =
  "<script>(function(){function h(){try{if(window.parent&&window.parent!==window){window.parent.postMessage({__penHeight:document.documentElement.scrollHeight},\"*\")}}catch(e){}}if(document.readyState===\"loading\"){window.addEventListener(\"load\",h)}else{h()}setTimeout(h,300);if(window.ResizeObserver){try{new ResizeObserver(h).observe(document.body)}catch(e){}}}())</script>";

function normalizeHtml(bytes: Uint8Array): Uint8Array<ArrayBuffer> {
  const html = new TextDecoder().decode(bytes);

  let doc: string;
  if (/<html[\s>]/i.test(html)) {
    doc = html;
  } else {
    doc = `<!doctype html><html lang="en"><head>${VIEWPORT_META}${BASE_STYLE}</head><body>${html}</body></html>`;
  }

  if (/<head[\s>]/i.test(doc)) {
    if (!/<meta[^>]*name=["']viewport["']/i.test(doc)) {
      doc = doc.replace(/<head([^>]*)>/i, (_match, attrs) => `<head${attrs}>${VIEWPORT_META}`);
    }
    if (!/min-height\s*:\s*100/i.test(doc)) {
      doc = doc.replace(/<head([^>]*)>/i, (_match, attrs) => `<head${attrs}>${BASE_STYLE}`);
    }
  }

  if (!/__penHeight/.test(doc)) {
    if (/<\/body>/i.test(doc)) {
      doc = doc.replace(/<\/body>/i, `${HEIGHT_PROBE}</body>`);
    } else {
      doc += HEIGHT_PROBE;
    }
  }

  return new TextEncoder().encode(doc);
}

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

  const normalized = normalizeHtml(html);

  return new Response(normalized, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Length": String(normalized.byteLength),
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}