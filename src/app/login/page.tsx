import LoginForm from "@/components/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const safeNext =
    typeof next === "string" && next.startsWith("/") && !next.startsWith("//")
      ? next
      : "/";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-100 px-6">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
          Internal team
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">
          Prototype Library
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Masuk dengan admin token untuk mengelola prototype.
        </p>
        <div className="mt-6">
          <LoginForm next={safeNext} />
        </div>
      </div>
    </main>
  );
}