"use client";

import { useState } from "react";
import { apiSubmitFeedback } from "@/lib/api-client";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { StarInput } from "@/components/star-rating";
import { primaryButtonClass, secondaryButtonClass, inputClass, labelClass } from "@/components/ui/styles";
import type { NpsScore } from "@/types";

export default function TesterFeedbackForm({
  versionId,
  onSubmitted,
}: {
  versionId: number;
  onSubmitted?: () => void;
}) {
  const [testerName, setTesterName] = useState("");
  const [division, setDivision] = useState("");
  const [npsScore, setNpsScore] = useState<NpsScore | 0>(0);
  const [feedback, setFeedback] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const isLoading = status === "loading";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading) return;

    if (!testerName.trim() || !division.trim() || !feedback.trim() || !npsScore) {
      setStatus("error");
      setMessage("Lengkapi semua kolom sebelum mengirim.");
      return;
    }

    setStatus("loading");
    setMessage("");

    const result = await apiSubmitFeedback(versionId, {
      testerName,
      division,
      npsScore,
      feedback,
    });

    if (result.error) {
      setStatus("error");
      setMessage(result.error);
      return;
    }

    setStatus("success");
    setMessage("Terima kasih, feedback tersimpan.");
    onSubmitted?.();
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-start gap-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-zinc-900">
          Terima kasih, {testerName.trim()}!
        </h3>
        <p className="text-sm text-zinc-500">
          Feedback kamu sudah tercatat untuk versi ini. Silakan terus mencoba
          prototype.
        </p>
        <button
          type="button"
          onClick={() => {
            setTesterName("");
            setDivision("");
            setNpsScore(0);
            setFeedback("");
            setStatus("idle");
          }}
          className={secondaryButtonClass}
        >
          Kirim feedback lain
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-xl p-6 bg-white"
      noValidate
    >
      <div className="space-y-5">
        <div>
          <label className={labelClass} htmlFor="feedback-name">
            Nama
          </label>
          <input
            id="feedback-name"
            type="text"
            value={testerName}
            onChange={(e) => setTesterName(e.target.value)}
            placeholder="Nama kamu"
            maxLength={100}
            className={inputClass}
            disabled={isLoading}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="feedback-division">
            Divisi
          </label>
          <input
            id="feedback-division"
            type="text"
            value={division}
            onChange={(e) => setDivision(e.target.value)}
            placeholder="cth. Product, Engineering"
            maxLength={100}
            className={inputClass}
            disabled={isLoading}
          />
        </div>
      </div>

      <div>
        <span className={labelClass} id="feedback-nps">
          Seberapa mudah menggunakan prototype ini?
        </span>
        <StarInput value={npsScore} onChange={setNpsScore} disabled={isLoading} />
      </div>

      <div>
        <label className={labelClass} htmlFor="feedback-text">
          Feedback
        </label>
        <textarea
          id="feedback-text"
          rows={4}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Ceritakan pengalaman kamu — yang berjalan baik dan yang perlu diperbaiki."
          maxLength={4000}
          className={inputClass}
          disabled={isLoading}
        />
      </div>

      {status === "error" && message ? (
        <Alert>{message}</Alert>
      ) : null}

      <button
        type="submit"
        disabled={isLoading}
        className={primaryButtonClass}
      >
        {isLoading ? (
          <>
            <Spinner className="h-4 w-4 border-zinc-400 border-t-white" /> Mengirim...
          </>
        ) : (
          "Kirim feedback"
        )}
      </button>
    </form>
  );
}