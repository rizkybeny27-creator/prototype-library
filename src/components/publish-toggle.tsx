"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPublishVersion } from "@/lib/api-client";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { StatusBadge } from "@/components/ui/status";
import { secondaryButtonClass } from "@/components/ui/styles";

export default function PublishToggle({
  versionId,
  published,
}: {
  versionId: number;
  published: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  if (published) return <StatusBadge published />;

  const isLoading = status === "loading";

  async function handlePublish() {
    if (isLoading) return;
    setStatus("loading");
    setError("");

    const result = await apiPublishVersion(versionId);
    if (result.error) {
      setStatus("error");
      setError(result.error);
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col items-start gap-2">
      {status === "error" && error ? <Alert>{error}</Alert> : null}
      <button
        type="button"
        onClick={handlePublish}
        disabled={isLoading}
        className={secondaryButtonClass}
      >
        {isLoading ? (
          <>
            <Spinner /> Mempublikasikan...
          </>
        ) : (
          "Publikasikan"
        )}
      </button>
      <p className="text-xs text-zinc-400">
        Hanya satu versi yang aktif untuk tester.
      </p>
    </div>
  );
}