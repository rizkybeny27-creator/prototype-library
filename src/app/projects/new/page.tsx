import Link from "next/link";
import CreateProjectForm from "@/components/create-project-form";

export default function NewProjectPage() {
  return (
    <main className="mx-auto w-full max-w-xl px-6 py-12">
      <Link
        href="/"
        className="text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
      >
        ← Semua project
      </Link>

      <header className="mb-8 mt-6">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Project baru
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Setiap project punya link tester yang stabil dan riwayat versi sendiri.
        </p>
      </header>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <CreateProjectForm />
      </div>
    </main>
  );
}