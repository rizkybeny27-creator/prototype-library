"use client";

import { NPS_LABELS } from "@/types";
import type { NpsScore } from "@/types";

const STAR = "★";

function StarGlyph({ filled, size }: { filled: boolean; size: "sm" | "lg" }) {
  const sizeClass = size === "sm" ? "text-sm" : "text-2xl";
  return (
    <span
      aria-hidden
      className={`${sizeClass} leading-none transition ${
        filled ? "text-amber-400" : "text-zinc-300"
      }`}
    >
      {STAR}
    </span>
  );
}

export function StarInput({
  value,
  onChange,
  disabled,
}: {
  value: NpsScore | 0;
  onChange: (value: NpsScore) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-1">
        {([1, 2, 3, 4, 5] as const).map((score) => (
          <button
            key={score}
            type="button"
            disabled={disabled}
            aria-label={`${score} bintang — ${NPS_LABELS[score]}`}
            onClick={() => onChange(score)}
            className="cursor-pointer rounded-md p-1 transition hover:scale-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <StarGlyph filled={score <= value} size="lg" />
          </button>
        ))}
      </div>
      <p className="mt-1 text-xs text-zinc-500">
        {value === 0 ? (
          "Pilih 1–5 bintang"
        ) : (
          <span className="font-medium text-zinc-700">
            {value} · {NPS_LABELS[value]}
          </span>
        )}
      </p>
    </div>
  );
}

export function Stars({ value }: { value: number }) {
  return (
    <span
      className="inline-flex items-center gap-0.5"
      aria-label={`${value} dari 5 bintang`}
      title={`${value} dari 5`}
    >
      {([1, 2, 3, 4, 5] as const).map((score) => (
        <StarGlyph key={score} filled={score <= value} size="sm" />
      ))}
    </span>
  );
}