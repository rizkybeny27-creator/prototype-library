"use client";

import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { apiUploadVersion } from "@/lib/api-client";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import {
  inputClass,
  labelClass,
  primaryButtonClass,
} from "@/components/ui/styles";

export default function UploadVersionForm({ slug }: { slug: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [changelog, setChangelog] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  const isLoading = status === "loading";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading || !fileRef.current?.files?.[0]) return;

    const file = fileRef.current.files[0];
    setStatus("loading");
    setMessage("");

    const body = new FormData();
    body.append("file", file);
    body.append("changelog", changelog);

    const result = await apiUploadVersion(slug, body);

    if (result.error) {
      setStatus("error");
      setMessage(result.error);
      return;
    }

    setStatus("success");
    setMessage(`Versi ${result.data!.version.label} berhasil diupload.`);
    setChangelog("");
    if (fileRef.current) fileRef.current.value = "";
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="file" className={labelClass}>
          File HTML prototype
        </label>
        <input
          ref={fileRef}
          id="file"
          type="file"
          accept=".html,.htm"
          required
          className="block w-full text-sm text-zinc-700 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-zinc-700 hover:file:bg-zinc-200 disabled:opacity-60"
          disabled={isLoading}
        />
        <p className="mt-1 text-xs text-zinc-400">
          Satu file HTML self-contained, maksimal 15 MB.
        </p>
      </div>

      <div>
        <label htmlFor="changelog" className={labelClass}>
          Changelog versi ini (opsional)
        </label>
        <textarea
          id="changelog"
          rows={3}
          maxLength={5000}
          value={changelog}
          onChange={(e) => setChangelog(e.target.value)}
          placeholder="Apa yang berubah dari versi sebelumnya?"
          className={inputClass}
          disabled={isLoading}
        />
      </div>

      {status !== "idle" && message ? (
        <Alert tone={status === "success" ? "success" : "error"}>{message}</Alert>
      ) : null}

      <button
        type="submit"
        disabled={isLoading}
        className={primaryButtonClass}
      >
        {isLoading ? (
          <>
            <Spinner /> Mengupload...
          </>
        ) : (
          "Upload versi baru"
        )}
      </button>
    </form>
  );
}