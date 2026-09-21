export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectVersionDetail } from "@/services/projects";
import { DEVICE_LABELS } from "@/types";
import { DeviceBadge, StatusBadge } from "@/components/ui/status";
import PreviewFrame from "@/components/preview-frame";

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ slug: string; label: string }>;
}) {
  const { slug, label } = await params;
  const detail = await getProjectVersionDetail(slug, label);
  if (!detail) notFound();

  const { project, version } = detail;

  return (
    <main className="flex min-h-dvh w-full flex-col">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-zinc-200 bg-white px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href={`/projects/${project.slug}/versions/${version.label}`}
            className="text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
          >
            ← Kembali
          </Link>
          <span className="font-mono text-sm font-semibold text-zinc-900">
            {project.name} · {version.label}
          </span>
          <StatusBadge published={version.isPublished} />
          <DeviceBadge label={DEVICE_LABELS[version.device]} />
        </div>
        <Link
          href={`/r/${project.slug}/${version.label}`}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-medium text-zinc-500 underline-offset-2 transition hover:text-zinc-900 hover:underline"
        >
          Buka HTML mentah
        </Link>
      </header>
      <div className="flex-1 bg-zinc-100">
        <PreviewFrame
          slug={project.slug}
          label={version.label}
          device={version.device}
          title={`Full screen ${version.label}`}
          className="h-full w-full"
        />
      </div>
    </main>
  );
}