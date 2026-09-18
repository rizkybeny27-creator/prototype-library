export const dynamic = "force-dynamic";

import Link from "next/link";
import { listProjects } from "@/services/projects";
import { TEST_TYPE_LABELS } from "@/types";
import { formatDate } from "@/lib/format";
import { EmptyState, TestTypeBadge } from "@/components/ui/status";
import { secondaryButtonClass } from "@/components/ui/styles";
import LogoutButton from "@/components/logout-button";

export default async function Home() {
  const projects = await listProjects();

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
            Internal team
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900">
            Prototype Library
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Satu tempat untuk menyimpan, mengelola, dan menguji prototype HTML.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/projects/new" className={secondaryButtonClass}>
            + Project baru
          </Link>
          <LogoutButton />
        </div>
      </header>

      {projects.length === 0 ? (
        <EmptyState
          title="Belum ada project"
          description="Buat project pertama untuk mulai menyimpan dan menguji prototype HTML."
          action={
            <Link href="/projects/new" className={secondaryButtonClass}>
              Buat project pertama
            </Link>
          }
        />
      ) : (
        <ul className="divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 bg-white">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={`/projects/${project.slug}`}
                className="block px-5 py-4 transition hover:bg-zinc-50"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold text-zinc-900">
                      {project.name}
                    </h2>
                    {project.description ? (
                      <p className="mt-0.5 line-clamp-1 text-sm text-zinc-500">
                        {project.description}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <TestTypeBadge
                      label={TEST_TYPE_LABELS[project.testType]}
                    />
                    <span className="text-xs text-zinc-400">
                      {project.versionCount} versi
                    </span>
                    {project.publishedLabel ? (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                        Published · {project.publishedLabel}
                      </span>
                    ) : (
                      <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
                        Draft
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-1 flex items-center gap-4 text-xs text-zinc-400">
                  <span className="font-mono">/{project.slug}</span>
                  <span>Update terakhir {formatDate(project.updatedAt)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}