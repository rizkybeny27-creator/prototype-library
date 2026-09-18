export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getProjectDetail } from "@/services/projects";
import TesterFeedbackWidget from "@/components/tester-feedback-widget";
import TesterPreview from "@/components/tester-preview";

export default async function TesterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const detail = await getProjectDetail(slug);
  if (!detail) notFound();

  const published = detail.publishedVersion;

  if (!published) {
    return (
      <main className="flex min-h-screen flex-col bg-zinc-100">
        <header className="border-b border-zinc-200 bg-white px-4 py-3">
          <span className="text-xs font-medium uppercase tracking-widest text-zinc-500">
            Prototype Testing
          </span>
        </header>
        <div className="m-auto max-w-md rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-zinc-900">{detail.name}</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Belum ada versi yang dipublikasikan untuk project ini. Silakan
            hubungi tim terkait.
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-100">
      <header className="flex items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 rounded-full bg-zinc-900 px-2.5 py-0.5 text-xs font-semibold text-white">
            Prototype Testing
          </span>
          <h1 className="truncate text-sm font-medium text-zinc-800">
            {detail.name}
          </h1>
        </div>
        <div className="shrink-0 text-xs text-zinc-500">
          Versi aktif:{" "}
          <strong className="font-mono text-zinc-800">{published.label}</strong>
        </div>
      </header>
      <TesterPreview
        slug={slug}
        label={published.label}
        device={published.device}
        title={`${detail.name} - ${published.label}`}
      />
      <TesterFeedbackWidget versionId={published.id} />
    </div>
  );
}