"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { apiCreateProject } from "@/lib/api-client";
import { TEST_TYPES, TEST_TYPE_LABELS } from "@/types";
import type { TestType } from "@/types";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import {
  inputClass,
  labelClass,
  primaryButtonClass,
} from "@/components/ui/styles";

export default function CreateProjectForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [testType, setTestType] = useState<TestType>("usability");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  const isLoading = status === "loading";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading) return;

    setStatus("loading");
    setError("");
    const result = await apiCreateProject({ name, description, testType });

    if (result.error) {
      setStatus("error");
      setError(result.error);
      return;
    }
    router.push(`/projects/${result.data!.project.slug}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="name" className={labelClass}>
          Nama project
        </label>
        <input
          id="name"
          required
          maxLength={120}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="contoh: Flow Checkout — Ride Hailing"
          className={inputClass}
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          Deskripsi
        </label>
        <textarea
          id="description"
          rows={3}
          maxLength={2000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Apa yang sedang diuji di project ini?"
          className={inputClass}
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="testType" className={labelClass}>
          Jenis test
        </label>
        <select
          id="testType"
          value={testType}
          onChange={(e) => setTestType(e.target.value as TestType)}
          className={inputClass}
          disabled={isLoading}
        >
          {TEST_TYPES.map((type) => (
            <option key={type} value={type}>
              {TEST_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </div>

      {status === "error" && error ? <Alert>{error}</Alert> : null}

      <button type="submit" disabled={isLoading} className={primaryButtonClass}>
        {isLoading ? (
          <>
            <Spinner /> Membuat project...
          </>
        ) : (
          "Buat project"
        )}
      </button>
      <p className="text-xs text-zinc-400">
        Link tester otomatis dibuat dari nama project dan bisa disesuaikan agar unik.
      </p>
    </form>
  );
}