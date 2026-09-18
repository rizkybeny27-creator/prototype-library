export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectDetail } from "@/services/projects";
import { DEVICE_LABELS, TEST_TYPE_LABELS } from "@/types";
import type { VersionListItem } from "@/types";
import { formatBytes, formatDate } from "@/lib/format";
import { DeviceBadge, EmptyState, TestTypeBadge } from "@/components/ui/status";
import { sectionTitleClass } from "@/components/ui/styles";
import { DeviceFrame } from "@/components/device-frame";
import UploadVersionForm from "@/components/upload-version-form";
import CopyButton from "@/components/copy-button";

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const detail = await getProjectDetail(slug);
  if (!detail) notFound();

  const query = await searchParams;
  const previewRequested =
    typeof query.preview === "string" ? query.preview : undefined;
  const previewVersion =
    detail.versions.find((v) => v.label === previewRequested) ??
    detail.publishedVersion ??
    detail.versions[0];

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10">
      <Link
        href="/"
        className="text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
      >
        ← Semua project
      </Link>

      <header className="mt-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            {detail.name}
          </h1>
          <TestTypeBadge label={TEST_TYPE_LABELS[detail.testType]} />
        </div>
        {detail.description ? (
          <p className="mt-1.5 max-w-2xl text-sm text-zinc-500">
            {detail.description}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-zinc-200 pt-4 text-sm text-zinc-500">
          <span>
            Link tester:{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs text-zinc-700">
              /t/{detail.slug}
            </code>{" "}
            <CopyButton path={`/t/${detail.slug}`} />
          </span>
          <span>
            Update terakhir:{" "}
            <span className="text-zinc-700">{formatDate(detail.updatedAt)}</span>
          </span>
        </div>
      </header>

      <section className="mt-8">
        <h2 className={sectionTitleClass}>Preview</h2>
        {previewVersion ? (
          <div className="mt-3 overflow-hidden rounded-xl border border-zinc-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 bg-zinc-50 px-4 py-2.5">
              <div className="flex items-center gap-1.5">
                {detail.versions.map((version) => (
                  <Link
                    key={version.id}
                    href={`/projects/${detail.slug}?preview=${version.label}`}
                    className={`rounded-md px-2.5 py-1 font-mono text-xs font-medium transition ${
                      previewVersion.label === version.label
                        ? "bg-zinc-900 text-white"
                        : "bg-white text-zinc-600 hover:bg-zinc-100"
                    }`}
                  >
                    {version.label}
                  </Link>
                ))}
              </div>
              <span className="text-xs text-zinc-400">
                Preview internal · {previewVersion.label}
              </span>
            </div>
            <DeviceFrame device={previewVersion.device}>
              <iframe
                title={`Preview ${detail.name} ${previewVersion.label}`}
                src={`/r/${detail.slug}/${previewVersion.label}`}
                sandbox="allow-scripts"
                className="h-[60vh] w-full bg-white"
              />
            </DeviceFrame>
          </div>
        ) : (
          <div className="mt-3">
            <EmptyState
              title="Belum ada versi untuk dipreview"
              description="Upload versi pertama, lalu sematkan versi sebelum dibagikan ke tester."
            />
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className={sectionTitleClass}>Upload versi baru</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Versi baru tidak otomatis terpublish — sematkan secara manual setelah
          siap.
        </p>
        <div className="mt-3 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <UploadVersionForm slug={detail.slug} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className={sectionTitleClass}>Riwayat versi</h2>
        {detail.versions.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              title="Belum ada versi"
              description="Riwayat versi, changelog, dan hasil testing akan tercatat di sini."
            />
          </div>
        ) : (
          <ul className="mt-3 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
            {detail.versions.map((version, index) => (
              <VersionRow
                key={version.id}
                version={version}
                isFirst={index === 0}
                projectSlug={detail.slug}
                showDivider={index > 0}
              />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function VersionRow({
  version,
  isFirst,
  projectSlug,
  showDivider,
}: {
  version: VersionListItem;
  isFirst: boolean;
  projectSlug: string;
  showDivider: boolean;
}) {
  return (
    <li className={showDivider ? "border-t border-zinc-100" : undefined}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="font-mono text-sm font-semibold text-zinc-900">
            {version.label}
          </span>
          <DeviceBadge label={DEVICE_LABELS[version.device]} />
          {version.isPublished ? (
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
              Sedang aktif untuk tester
            </span>
          ) : isFirst ? (
            <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
              Versi terbaru
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400">
          <span>{formatDate(version.createdAt)}</span>
          <span>{formatBytes(version.sizeBytes)}</span>
          <span
            className={`font-medium ${
              version.feedbackCount > 0 ? "text-zinc-600" : ""
            }`}
          >
            {version.feedbackCount > 0
              ? `${version.feedbackCount} feedback`
              : "Belum ada feedback"}
          </span>
          <a
            href={`/r/${projectSlug}/${version.label}`}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline"
          >
            Buka HTML
          </a>
          <Link
            href={`/projects/${projectSlug}/versions/${version.label}`}
            className="font-medium text-zinc-800 underline-offset-2 hover:underline"
          >
            Detail →
          </Link>
        </div>
      </div>
    </li>
  );
}