export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectVersionDetail } from "@/services/projects";
import { feedbackStats } from "@/services/feedback";
import { formatBytes, formatDate } from "@/lib/format";
import { DeviceBadge, EmptyState, StatusBadge } from "@/components/ui/status";
import { Stars } from "@/components/star-rating";
import PublishToggle from "@/components/publish-toggle";
import CopyButton from "@/components/copy-button";
import VersionTabs from "@/components/version-tabs";
import PreviewFrame from "@/components/preview-frame";
import { DEVICE_LABELS, NPS_SCORES } from "@/types";
import type { Feedback } from "@/types";

export default async function VersionDetailPage({
  params,
}: {
  params: Promise<{ slug: string; version: string }>;
}) {
  const { slug, version: label } = await params;
  const detail = await getProjectVersionDetail(slug, label);
  if (!detail) notFound();

  const { project, version, feedback } = detail;
  const stats = feedbackStats(feedback);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col px-6 py-6">
      <div className="shrink-0">
      <Link
        href={`/projects/${project.slug}`}
        className="text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
      >
        ← {project.name}
      </Link>

      <header className="mt-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-mono text-2xl font-semibold tracking-tight text-zinc-900">
            {version.label}
          </h1>
          <StatusBadge published={version.isPublished} />
          <DeviceBadge label={DEVICE_LABELS[version.device]} />
        </div>
        {version.changelog ? (
          <p className="mt-2 max-w-2xl text-sm text-zinc-500">
            {version.changelog}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-zinc-200 pt-4 text-sm text-zinc-500">
          <span>
            Dibuat:{" "}
            <span className="text-zinc-700">{formatDate(version.createdAt)}</span>
          </span>
          <span>Ukuran: <span className="text-zinc-700">{formatBytes(version.sizeBytes)}</span></span>
          {version.isPublished ? (
            <span>
              Link tester:{" "}
              <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs text-zinc-700">
                /t/{project.slug}
              </code>{" "}
              <CopyButton path={`/t/${project.slug}`} />
            </span>
          ) : null}
          <span>
            <Link
              href={`/preview/${project.slug}/${version.label}`}
              target="_blank"
              className="font-medium text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline"
            >
              Buka HTML
            </Link>
          </span>
        </div>
      </header>

      <section className="mt-5 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <PublishToggle versionId={version.id} published={version.isPublished} />
        {version.isPublished ? (
          <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
            Versi ini yang dilihat tester melalui{" "}
            <code className="font-mono">/t/{project.slug}</code>, dan feedback
            dari tester tampil di tab Feedback List.
          </p>
        ) : null}
      </section>
      </div>

      <section className="mt-4 flex flex-1 flex-col">
        <VersionTabs
          previewPanel={
            <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-zinc-200 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-2 gap-x-4 border-b border-zinc-200 bg-zinc-50 px-4 py-2.5">
                <span className="text-xs text-zinc-400">
                  Preview internal · {version.label}
                </span>
                <span className="text-xs text-zinc-400">
                  Tinggi menyesuaikan konten prototype
                </span>
              </div>
              <PreviewFrame
                slug={project.slug}
                label={version.label}
                device={version.device}
                title={`Preview ${version.label}`}
                className="bg-white"
              />
            </div>
          }
          feedbackPanel={
            feedback.length === 0 ? (
              <EmptyState
                title="Belum ada feedback"
                description="Feedback dari tester melalui /t/ akan muncul di sini setelah versi dipublikasikan."
              />
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-3">
                  <StatCard label="Total feedback" value={String(stats.count)} />
                  <StatCard
                    label="Rata-rata skor"
                    value={stats.average === null ? "—" : `${stats.average} / 5`}
                  />
                  <DistributionCard distribution={stats.distribution} />
                </div>

                <ul className="mt-4 space-y-3">
                  {feedback.map((item) => (
                    <FeedbackCard key={item.id} item={item} />
                  ))}
                </ul>
              </>
            )
          }
        />
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-zinc-900">{value}</p>
    </div>
  );
}

function DistributionCard({
  distribution,
}: {
  distribution: Record<(typeof NPS_SCORES)[number], number>;
}) {
  const max = Math.max(...Object.values(distribution), 1);
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        Distribusi skor
      </p>
      <ul className="mt-2 space-y-1">
        {NPS_SCORES.map((score) => (
          <li key={score} className="flex items-center gap-2 text-xs text-zinc-600">
            <span className="w-4 shrink-0 text-right">{score}★</span>
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100">
              <span
                className="block h-full rounded-full bg-amber-400"
                style={{
                  width: `${Math.round((distribution[score] / max) * 100)}%`,
                }}
              />
            </span>
            <span className="w-5 shrink-0 text-right font-medium text-zinc-800">
              {distribution[score]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FeedbackCard({ item }: { item: Feedback }) {
  return (
    <li className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-zinc-900">
            {item.testerName}
          </span>
          <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
            {item.division}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Stars value={item.npsScore} />
          <span className="text-xs text-zinc-400">
            {formatDate(item.createdAt)}
          </span>
        </div>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
        {item.feedback}
      </p>
    </li>
  );
}